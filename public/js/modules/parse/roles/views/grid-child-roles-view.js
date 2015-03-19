/**
 * Created by alexander on 3/19/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'child-role-view',
    'role-collection',
    'text!modules/parse/roles/views/templates/grid-child-roles.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, ChildRoleView, RoleCollection, GridChildRolesTemplate) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var GridChildRolesView = Backbone.View.extend({
        template: _.template(GridChildRolesTemplate),
        events: {
            'hide.bs.modal': 'unrender'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'appendRole'
            );
            var self = this;
            this.collection = new RoleCollection();
            this.collection.bind('add', this.appendRole);
            var parentRole = options.model;
            
            var relation = parentRole.relation('roles');
            relation.query().find({
                success: function (results) {
                    for (i in results) {
                        self.collection.add(results[i].attributes);
                    }
                },
                error: function (error) {
                    notify.addError("Error: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            this.$el.append(this.template());
            var self = this;
            _(this.collection.models).each(function(role){
                self.find('div.modal-child table > tbody').appendRole(role);
            }, this);
            this.$el.find('div.modal-child').modal('show');
        },
        unrender: function () {
            this.$el.find('div.modal-child').remove();
        },
        appendRole: function (role) {
            this.$el.find('div.modal-child table > tbody').append('<tr class="' + role.attributes.name + '"></tr>');
            var childRoleView = new ChildRoleView({
                model: role,
                el: this.$el.find('div.modal-child table > tbody > tr.' + role.attributes.name)
            });
            childRoleView.render();
        }
    });

    return GridChildRolesView;
});
