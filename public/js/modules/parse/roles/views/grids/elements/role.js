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
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, Role, GridChildRolesView) {
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
            var self = this;
            var query = new Parse.Query(Parse.Role).equalTo('name', this.model.attributes.name).find({
                success: function(result) {
                    var role = result[0];
                    if ("undefined" !== typeof role) {
                        self.$el.html(self.template({
                            role: self.model,
                            roleId: role.id
                        }));
                        return self;
                    }
                }
            });
        },
        unrender: function(){
            this.model.unbind('change', this.render);
            this.model.unbind('remove', this.unrender);
            this.$el.remove();
            this.$el.unbind();
        },
        remove: function(){
            if (confirm('Are you sure you want to delete this role?')) {
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
            this.$el.find('button.showChildRoles').addClass('disabled');
            var gridChildRolesView = new GridChildRolesView({'model': this.model, 'el': 'div.col-lg-9'});
            gridChildRolesView.render();
        }
    });
});