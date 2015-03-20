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
    var APP_ID = "v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe";
    var REST_KEY = "FjGzHv8sQKjY9FH32Y4PFdEuwgFjWq03xm1i8Cc2";

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
            //VENT OBJECT

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

            $.ajax({
                url: 'https://api.parse.com/1/roles/' + self.model.id,
                type: 'DELETE',
                headers: {
                    'X-Parse-Application-Id': APP_ID,
                    'X-Parse-REST-API-Key': REST_KEY
                },
                success: function (result) {
                    self.model.destroy();
                    notify.addSuccess('Role has been successfully deleted!');
                },
                error: function (xhr, status, error) {
                    notify.addError('Error occured while deleting a user! Message: ' + xhr.responseText);
                }
            });
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