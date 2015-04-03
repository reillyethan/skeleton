/**
 * Created by alexander on 3/19/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/roles/views/grids/elements/child-role',
    'modules/parse/roles/collections/role',
    'text!modules/parse/roles/views/templates/grid-child-roles.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, ChildRoleView, RoleCollection, GridChildRolesTemplate) {
    var modalClass = "child-roles";

    return Backbone.View.extend({
        template: _.template(GridChildRolesTemplate),
        events: {
            'hidden.bs.modal': 'unrender',
            'click button.submit': 'addChildRole'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'appendRole',
                'addChildRole'
            );
            this.collection = new RoleCollection();
            this.collection.bind('add', this.appendRole);
            this.parentRole = options.model;
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
            this.$el.find('button.showChildRoles').removeClass('disabled');
            this.collection.unbind('add', this.appendRole);
            this.collection.remove();
            this.parentRole.remove();
            this.$el.find('div.' + modalClass).remove();
            this.unbind();
        },
        appendRole: function (role) {
            if (role.toJSON().name !== this.parentRole.toJSON().name) {
                var self = this;

                var roles = Parse.Cloud.run('getRole', {name: role.toJSON().name}, {
                    success: function (role) {
                        var childRoles = Parse.Cloud.run('getChildRoles', {parentName: self.parentRole.toJSON().name}, {
                            success: function (childRoles) {
                                _.each(childRoles, function(childRole) {
                                    if (childRole.toJSON().name == role.toJSON().name) {
                                        role['attributes']['checked'] = true;
                                    }
                                });
                                var childRoleView = new ChildRoleView({
                                    model: role,
                                    el: self.$el.find('div.modal.' + modalClass).find('div.modal-body')
                                });
                                childRoleView.render();
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
            }
        },
        addChildRole: function () {
            this.$el.find('button.submit').addClass('disabled');
            var self = this;
            _.each(this.$el.find('div.form-group.input-group'), function (element) {
                var childName = $(element).find('label').text();
                var checkbox = $(element).find('span > input[type=checkbox]');
                var childRoles = Parse.Cloud.run('getChildRoles', {parentName: self.parentRole.toJSON().name}, {
                    success: function (childRoles) {
                        var isAdded = false;
                        _.each(childRoles, function (childRole) {
                            if (childName === childRole.toJSON().name) {
                                isAdded = true;
                            }
                        });

                        if (!isAdded && true === $(checkbox).is(":checked")) {
                            Parse.Cloud.run('addChildRole',
                                {
                                    parentName: self.parentRole.toJSON().name,
                                    childName: childName
                                },
                                {
                                    error: function (error) {
                                        notify.addError('Error occured while adding a child role to a role! Message: ' + error.message);
                                    }
                                }
                            );
                        }
                        if (isAdded && false === $(checkbox).is(":checked")) {
                            Parse.Cloud.run(
                                'deleteChildRole',
                                {
                                    parentName: self.parentRole.toJSON().name,
                                    childName: childName
                                },
                                {
                                    error: function(error) {
                                        notify.addError('Error occured while deleting a child role role! Message: ' + error.message);
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
            });

            notify.addSuccess('Child roles have been changed');
            self.$el.find('div.' + modalClass).modal('hide');
        }
    });
});
