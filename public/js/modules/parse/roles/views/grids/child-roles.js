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
            'click button.add-child-role': 'addChildRole'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'appendRole',
                'addChildRole'
            );
            var self = this;
            this.collection = new RoleCollection();
            this.collection.bind('add', this.appendRole);
            this.parentRole = options.model;

            Parse.Cloud.run('getChildRoles', {parentName: self.parentRole.attributes.name}, {
                success: function (results) {
                    for (i in results) {
                        self.collection.add(results[i]);
                    }
                },
                error: function (error) {
                    notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
                }
            });
        },
        render: function () {
            var self = this;
            Parse.Cloud.run('getRoles', {}, {
                success: function (results) {
                    var roles = [];
                    for (i in results) {
                        roles.push(results[i].attributes.name);
                    }
                    self.$el.append(self.template({"roles": roles, modalClass: modalClass}));
                    self.$el.find('div.' + modalClass).modal('show');
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
            var self = this;
            self.$el.find('div.' + modalClass).find('table > tbody').append('<tr class="' + role.toJSON().name + '"></tr>');
            var childRoleView = new ChildRoleView({
                parentRole: self.parentRole,
                model: role,
                el: self.$el.find('div.' + modalClass).find('table > tbody > tr.' + role.toJSON().name)
            });
            childRoleView.render();
        },
        addChildRole: function () {
            var self = this;
            var childName = this.$el.find("select option:selected").text();

            var childRoles = Parse.Cloud.run('getChildRoles', {'parentName': self.parentRole.toJSON().name}, {
                success: function (childRoles) {
                    for (i in childRoles) {
                        if (childName === childRoles[i].toJSON().name) {
                            var isAdded = true;
                        }
                    }
                    if (isAdded) {
                        notify.addError('Role has already been added!');
                    } else {
                        Parse.Cloud.run(
                            'addChildRole',
                            {
                                parentName: self.parentRole.toJSON().name,
                                childName: childName
                            },
                            {
                                success: function(childRole) {
                                    self.collection.add(childRole);
                                    notify.addSuccess('Child role has been added!');
                                },
                                error: function(error) {
                                    notify.addError('Error occured while adding a child role to a role! Message: ' + error.message);
                                }
                            }
                        );
                    }
                },
                error: function () {
                    notify.addError("Problems with fetching child roles!");
                }
            });

        }
    });
});
