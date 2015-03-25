/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/role.html',
    'modules/parse/roles/views/grids/child-roles',
    'modules/parse/roles/views/grids/child-users',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, Role, GridChildRolesView, GridChildUsersView) {
    return Backbone.View.extend({
        template: _.template(Role),
        events: {
            'click button.remove': 'remove',
            'click button.showChildRoles': 'showChildRoles',
            'click button.showChildUsers': 'showChildUsers'
        },
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'unrender',
                'remove'
            );
            this.model.bind('change', this.render);
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
            if (confirm('Are you sure you want to delete that?')) {
                var self = this;
                Parse.Cloud.run('deleteRole', {name: self.model.attributes.name}, {
                    success: function(result) {
                        self.model.destroy();
                        notify.addSuccess('Role has been successfully deleted!');
                    },
                    error: function(error) {
                        notify.addError('Error occured while deleting role! Message: ' + error.message);
                    }
                });
            }
            return false;
        },
        showChildRoles: function () {
            var gridChildRolesView = new GridChildRolesView({'model': this.model, 'el': 'div.col-lg-9'});
            gridChildRolesView.render();
        },
        showChildUsers: function () {
            var gridChildUsersView = new GridChildUsersView({'model': this.model, 'el': 'div.col-lg-9'});
            gridChildUsersView.render();
        }
    });
});