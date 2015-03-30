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
            'click button.add-user-role': 'addUserRole',
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

            var query = new Parse.Query(Parse.Role).equalTo("users", self.user).find({
                success: function (roles) {
                    _.each(roles, function (role) {
                        self.collection.add(role);
                    });
                },
                error: function (error) {
                    notify.addError('Error while fetching users roles')
                }
            });
        },
        render: function () {
            var self = this;
            var roles = Parse.Cloud.run('getRoles', {}, {
                success: function (roles) {
                    var userRoles = [];
                    _.each(roles, function (role) {
                        userRoles.push(role.toJSON().name);
                    });
                    self.$el.append(self.template({modalClass: modalClass, roles: userRoles}));
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
            var query = new Parse.Query(Parse.Role).equalTo('name', userRole.toJSON().name).find({
                success: function (result) {
                    var role = result[0];
                    self.$el.find('div.modal.' + modalClass).find('table > tbody').append('<tr class="' + role.toJSON().name + '"></tr>');
                    var userRoleView = new UserRoleView({
                        user: self.user,
                        grid: self,
                        model: role,
                        el: self.$el.find('div.modal.' + modalClass).find('table > tbody > tr.' + role.toJSON().name)
                    });
                    userRoleView.render();
                },
                error: function () {
                    notify.addError('Problems with fetching users role!');
                }
            });
        },
        addUserRole: function () {
            this.$el.find('button.add-user-role').addClass('disabled');
            var self = this;
            var role = this.$el.find("select option:selected").text();

            var query = new Parse.Query(Parse.Role).equalTo('name', role).find({
                success: function (result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.User).equalTo('username', self.user.toJSON().username).find({
                        success: function (result) {
                            var childUser = result[0];
                            parentRole.getUsers().query().find({
                                success: function (results) {
                                    for (i in results) {
                                        if (childUser.toJSON().username === results[i].toJSON().username) {
                                            var isAdded = true;
                                        }
                                    }
                                    if (isAdded) {
                                        notify.addError('Role has already been added!');
                                        self.$el.find('button.add-user-role').removeClass('disabled');
                                    } else {
                                        Parse.Cloud.run(
                                            'addChildUser',
                                            {
                                                parentName: role,
                                                childUsername: self.user.toJSON().username
                                            },
                                            {
                                                success: function () {
                                                    var query = new Parse.Query(Parse.Role).equalTo('name', role).find({
                                                        success: function (result) {
                                                            self.collection.add(result[0]);
                                                            notify.addSuccess('Child user has been added!');
                                                        },
                                                        error: function () {
                                                            notify.addError('Unable to render added role');
                                                        }
                                                    });
                                                    self.$el.find('button.add-user-role').removeClass('disabled');
                                                },
                                                error: function (error) {
                                                    notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
                                                }
                                            }
                                        );
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});