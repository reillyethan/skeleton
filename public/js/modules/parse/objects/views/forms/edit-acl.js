/**
 * Created by alexander on 3/26/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'text!modules/parse/objects/views/templates/edit-acl.html',
    'modules/parse/users/collections/user',
    'modules/parse/roles/collections/role',
    'modules/parse/objects/views/grids/elements/user-or-role',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, EditACLTemplate, UserCollection, RoleCollection, UserOrRoleView) {
    var modalClass = "edit-acl";
    return Backbone.View.extend({
        template: _.template(EditACLTemplate),
        events: {
            'click button.publicACL': 'sumbitACLPublic',
            'hide.bs.modal': 'unrender',
            'click button.add-object-user-role': 'addRoleOrUser'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'sumbitACLPublic',
                'unrender',
                'appendRoleOrUser',
                'addRoleOrUser'
            );
            var self = this;

            this.object = options.object;

            this.currentACL = this.object.getACL();
            if ('undefined' === typeof this.currentACL) {
                this.currentACL = new Parse.ACL();
            } else {
                this.rolesCollection = new RoleCollection();
                this.userCollection = new UserCollection;

                this.rolesCollection.bind('add', this.appendRoleOrUser);
                this.userCollection.bind('add', this.appendRoleOrUser);

                _.each(this.currentACL.toJSON(), function (object, index) {
                    $.inArray('role', index.split(":"));
                    if ("*" !== index) {
                        if (($.inArray('role', index.split(":")) > -1)) {
                            var query = new Parse.Query(Parse.Role).equalTo('name', index.split(":")[1]).find({
                                success: function (role) {
                                    self.rolesCollection.add(role[0]);
                                },
                                error: function (error) {
                                    notify.addError('Error while appending acl role');
                                }
                            });
                        } else {
                            var query = new Parse.Query(Parse.User).get(index, {
                                success: function (user) {
                                    self.userCollection.add(user);
                                },
                                error: function (error) {
                                    notify.addError('Error while appending acl role');
                                }
                            });

                        }
                    }
                });
            }
        },
        render: function () {
            this.$el.append(this.template({
                object: this.object.toJSON(),
                modalClass: modalClass
            }));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.edit-acl').removeClass('disabled');
            this.$el.find('div.' + modalClass).remove();
            this.$el.unbind();
        },
        sumbitACLPublic: function () {
            var selectedRights = this.$el.find('select.publicACL option:selected').text();
            Parse.Cloud.run('setObjectPublicRights', {
                objectClassName: this.object.className,
                selectedRights: selectedRights,
                objectId: this.object.toJSON().objectId
            }, {
                success: function() {
                    notify.addSuccess('Public rights have been successfully set!');
                },
                error: function(error) {
                    notify.addError('Error occured while setting public rights to an ACL! Message: ' + error.message);
                }
            });
        },
        appendRoleOrUser: function (userOrRole) {
            this.$el.find('div.modal.' + modalClass).find('table > tbody').append('<tr class="' + userOrRole.toJSON().objectId + '"></tr>');
            var userOrRoleView = new UserOrRoleView({
                object: this.object,
                grid: this,
                model: userOrRole,
                userCollection: this.userCollection,
                roleCollection: this.rolesCollection,
                el: this.$el.find('div.modal.' + modalClass).find('table > tbody > tr.' + userOrRole.toJSON().objectId)
            });
            userOrRoleView.render();
        },
        addRoleOrUser: function () {
            var self = this;
            var objectId = this.$el.find('input.role-user-objectId').val();
            var selectedRights = this.$el.find('select.access option:selected').text();
            var query = new Parse.Query(Parse.Role).get(objectId, {
                success: function (role) {
                    var unique = true;
                    _.each(self.rolesCollection.models, function (collectionRole) {
                        if (collectionRole.toJSON().name === role.toJSON().name) {
                            unique = false;
                        }
                    });
                    if (false === unique) {
                        notify.addError('You cannot add this object twice!');
                    } else {
                        Parse.Cloud.run('addRoleToACL', {
                            objectClassName: self.object.className,
                            selectedRights: selectedRights,
                            objectId: self.object.toJSON().objectId,
                            roleId: role.toJSON().objectId
                        }, {
                            success: function() {
                                self.rolesCollection.add(role);
                                notify.addSuccess('Role has been successfully added to an ACL!');
                            },
                            error: function(error) {
                                notify.addError('Error occured while adding role to an ACL! Message: ' + error.message);
                            }
                        });
                    }
                },
                error: function (error) {
                    var query = new Parse.Query(Parse.User).get(objectId, {
                        success: function (user) {
                            var unique = true;
                            _.each(self.userCollection.models, function (collectionUser) {
                                if (collectionUser.toJSON().username === user.toJSON().username) {
                                    unique = false;
                                }
                            });
                            if (false === unique) {
                                notify.addError('You cannot add this object twice!');
                            } else {
                                Parse.Cloud.run('addUserToACL', {
                                    objectClassName: self.object.className,
                                    selectedRights: selectedRights,
                                    objectId: self.object.toJSON().objectId,
                                    userId: user.toJSON().objectId
                                }, {
                                    success: function() {
                                        self.userCollection.add(user);
                                        notify.addSuccess('user has been successfully added to an ACL!');
                                    },
                                    error: function(error) {
                                        notify.addError('Error occured while adding user to an ACL! Message: ' + error.message);
                                    }
                                });
                            }
                        },
                        error: function () {
                            notify.addError('Error while adding acl user');
                        }
                    });
                }
            });
        }
    });
});