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
    'modules/parse/roles/views/forms/add-child-role',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, ChildRoleView, RoleCollection, GridChildRolesTemplate, ChildRoleAddView) {
    var modalClass = "child-roles";

    var ChildRolesGrid = Backbone.View.extend({
        template: _.template(GridChildRolesTemplate),
        events: {
            'hide.bs.modal': 'unrender',
            'click button.addChildRole': 'addChildRole'
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
            this.vent = options.vent;

            var query = new Parse.Query(Parse.Role).equalTo('name', options.model.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    parentRole.getRoles().query().find({
                        success: function (results) {
                            for (i in results) {
                                self.collection.add(results[i]);
                            }
                        },
                        error: function (error) {
                            notify.addError("Error: " + error.code + " " + error.message);
                        }
                    });
                }
            });
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            var self = this;
            _(this.collection.models).each(function(role){
                self.find('div.' + modalClass).find('table > tbody').appendRole(role);
            }, this);
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.' + modalClass).remove();
        },
        appendRole: function (role) {
            var self = this;
            var query = new Parse.Query(Parse.Role).equalTo('name', self.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.Role).equalTo('name',role.attributes.name).find({
                        success: function (result) {
                            self.$el.find('div.' + modalClass).find('table > tbody').append('<tr class="' + result[0].attributes.name + '"></tr>');
                            var childRoleView = new ChildRoleView({
                                parentRole: parentRole,
                                model: result[0],
                                el: self.$el.find('div.' + modalClass).find('table > tbody > tr.' + result[0].attributes.name)
                            });
                            childRoleView.render();
                        }
                    });
                }
            });
        },
        addChildRole: function () {
            var childRoleAddView = new ChildRoleAddView({
                'parentRole': this.parentRole,
                'collection': this.collection,
                'el': 'div.col-lg-9'
            });
            childRoleAddView.render();
        }
    });

    Backbone.pubSub = _.extend({}, Backbone.Events);
    Backbone.pubSub.on('buttonShowChildRolesClicked', function(data) {
        var childRolesGrid = new ChildRolesGrid({'model': data.model, 'el': 'div.col-lg-9'});
        childRolesGrid.render();
    }, this);

    return ChildRolesGrid;
});
