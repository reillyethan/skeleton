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
            this.username = options.user.attributes.username;
            var query = new Parse.Query(Parse.User).equalTo("username", options.user.attributes.username).find({
                success: function (results) {
                    var user = results[0];
                    if (user) {
                        var query = new Parse.Query(Parse.Role).equalTo("users", user).find({
                            success: function (results) {
                                for (i in results) {
                                    self.collection.add(results[i]);
                                }
                            },
                            error: function (error) {
                                notify.addError('Error while fetching users roles')
                            }
                        })
                    }
                },
                error: function (error) {
                    notify.addError("Error while fetching user: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            var self = this;
            var roles = [];
            Parse.Cloud.run('getRoles', {}, {
                success: function (results) {
                    for (i in results) {
                        roles.push(results[i].attributes.name);
                    }
                    self.$el.append(self.template({modalClass: modalClass, roles: roles}));
                    _(self.collection.models).each(function(userRole){
                        self.$el.find('div.modal' + modalClass).find('table > tbody').appendUserRole(userRole);
                    }, self);
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
            this.$el.find('div.modal.' + modalClass).find('table > tbody').append('<tr class="' + userRole.attributes.name + '"></tr>');
            var userRoleView = new UserRoleView({
                username: this.username,
                grid: this,
                model: userRole,
                el: this.$el.find('div.modal.' + modalClass).find('table > tbody > tr.' + userRole.attributes.name)
            });
            userRoleView.render();
        },
        addUserRole: function () {
            this.$el.find('button.add-user-role').addClass('disabled');
            var self = this;
            var role = this.$el.find("select option:selected").text();
            Parse.Cloud.run(
                'addChildUser',
                {
                    parentName: role,
                    childUsername: self.username
                },
                {
                    success: function() {
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
                    error: function(error) {
                        notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
                    }
                }
            );
        }
    });
});