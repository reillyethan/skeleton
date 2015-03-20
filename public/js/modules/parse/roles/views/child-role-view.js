/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/child-role.html',
    'grid-child-roles-view',
    'grid-child-users-view',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, ChildRole, GridChildRolesView, GridChildUsersView) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var ChildRoleView = Backbone.View.extend({
        template: _.template(ChildRole),
        events: {
            'click button.remove': 'remove',
            'click button.showChildRoles': 'showChildRoles',
            'click button.showChildUsers': 'showChildUsers'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'remove',
                'showChildRoles'
            );
            this.parentRole = options.parentRole;
            this.model.bind('remove', this.unrender);
        },
        render: function(){
            this.$el.html(this.template({
                role: this.model.attributes
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
        },
        remove: function(){
            var self = this;
            var query = new Parse.Query(Parse.Role).equalTo('name', this.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.Role).equalTo('name', self.model.attributes.name).find({
                        success: function (result) {
                            parentRole.getRoles().remove(result[0]);
                            parentRole.save();
                            self.unrender();
                            notify.addSuccess('Child role removed!');
                        }
                    });
                }
            });
        },
        showChildRoles: function () {
            //var self = this;
            //var query = new Parse.Query(Parse.Role).equalTo('name', self.model.attributes.name).find({
            //    success: function (result) {
            //        var gridChildRolesView = new GridChildRolesView({'model': result[0], 'el': 'div.col-lg-9'});
                    var gridChildRolesView = new GridChildRolesView({'model': this.model, 'el': 'div.col-lg-9'});
                    gridChildRolesView.render();
            //    }
            //});
        },
        showChildUsers: function () {
            //var self = this;
            //var query = new Parse.Query(Parse.Role).equalTo('name', self.model.attributes.name).find({
            //    success: function (result) {
            //        var gridChildUsersView = new GridChildUsersView({'model': result[0], 'el': 'div.col-lg-9'});
                    var gridChildUsersView = new GridChildUsersView({'model': this.model, 'el': 'div.col-lg-9'});
                    gridChildUsersView.render();
            //    }
            //});
        }
    });

    return ChildRoleView;
});