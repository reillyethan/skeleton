/**
 * Created by alexander on 3/26/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/users/views/grids/elements/user-role',
    'modules/parse/users/collections/user-role',
    'text!modules/parse/users/views/templates/grid-user-roles.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, UserRoleView, UserRoleCollection, GridTemplate) {
    var modalClass = "user-roles";
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        events: {
            'click button.submit': 'addUserRole',
            'hide.bs.modal': 'unrender'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendUserRole',
                'addUserRole',
                'unrender'
            );
            var self = this;

            this.collection = new UserRoleCollection();
            this.collection.bind('add', this.appendUserRole);
            this.user = options.user;
        },
        render: function () {
            var self = this;
            var roles = Parse.Cloud.run('getRoles', {}, {
                success: function (allRoles) {
                    _.each(allRoles, function (allrole) {
                        self.collection.add(allrole);
                    });
                    self.$el.append(self.template({modalClass: modalClass}));
                    self.$el.find('div.modal.' + modalClass).modal('show');
                },
                error: function (error) {
                    notify.addError("Error while fetching roles: " + error.code + " " + error.message);
                }
            });
        },
        unrender: function () {
            this.$el.find('button.edit-roles').removeClass('disabled');
            this.$el.find('div.' + modalClass).remove();
            this.collection.unbind('add', this.appendUserRole);
            this.collection.remove();
            this.$el.unbind();
        },
        appendUserRole: function (userRole) {
            var self = this;

            var roles = Parse.Cloud.run('getRole', {name: userRole.toJSON().name}, {
                success: function (role) {
                    var userRoles = Parse.Cloud.run('getUserRoles', {username: self.user.toJSON().username}, {
                        success: function (allRoles) {
                            _.each(allRoles, function(allrole) {
                                if (allrole.toJSON().name == role.toJSON().name) {
                                    role['attributes']['checked'] = true;
                                }
                            });
                            var userRoleView = new UserRoleView({
                                grid: self,
                                model: role,
                                el: self.$el.find('div.modal.' + modalClass).find('div.modal-body')
                            });
                            userRoleView.render();
                        },
                        error: function (error) {
                            notify.addError('Error while fetching users roles')
                        }
                    });
                },
                error: function (error) {
                    notify.addError("Error while fetching roles: " + error.code + " " + error.message);
                }
            });
        },
        addUserRole: function () {
            this.$el.find('button.submit').addClass('disabled');
            var self = this;
            _.each(this.$el.find('div.form-group.input-group'), function(element) {
                var checkbox = $(element).find('span > input[type=checkbox]');

                var roles = Parse.Cloud.run('getRole', {name: $(element).find('label').text()}, {
                    success: function (parentRole) {
                        var query = new Parse.Query(Parse.User).equalTo('username', self.user.toJSON().username).find({
                            success: function (result) {
                                var childUser = result[0];
                                var childUsers = Parse.Cloud.run('getChildUsers', {parentName: parentRole.toJSON().name}, {
                                    success: function (results) {
                                        var isAdded = false;
                                        for (i in results) {
                                            if (childUser.toJSON().username === results[i].toJSON().username) {
                                                isAdded = true;
                                            }
                                        }

                                        if (!isAdded && true === $(checkbox).is(":checked")) {
                                            Parse.Cloud.run(
                                                'addChildUser',
                                                {
                                                    parentName: parentRole.toJSON().name,
                                                    childUsername: self.user.toJSON().username
                                                },
                                                {
                                                    error: function (error) {
                                                        notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
                                                    }
                                                }
                                            );
                                        }
                                        if (isAdded && false === $(checkbox).is(":checked")) {
                                            Parse.Cloud.run(
                                                'deleteChildUser',
                                                {
                                                    parentName: parentRole.toJSON().name,
                                                    childUsername: self.user.toJSON().username
                                                },
                                                {
                                                    error: function(error) {
                                                        notify.addError('Error occured while deleting a child user from role! Message: ' + error.message);
                                                    }
                                                }
                                            );
                                        }
                                        self.$el.find('button.submit').removeClass('disabled');
                                    },
                                    error: function (error) {
                                        console.log(error);
                                    }
                                });
                            }
                        });
                    },
                    error: function (error) {
                        notify.addError("Error while fetching roles: " + error.code + " " + error.message);
                    }
                });
            });
            notify.addSuccess('Roles have been changed');
            self.$el.find('div.' + modalClass).modal('hide');
        }
    });
});