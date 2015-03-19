/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/role.html',
    'grid-child-roles-view',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, Role, GridChildRolesView) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var RoleView = Backbone.View.extend({
        template: _.template(Role),
        events: {
            'click button.remove': 'remove',
            'click button.showChildRoles': 'showChildRoles'
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
            var self = this;
            var currentUser = Parse.User.current();
            if (currentUser) {
                var sessiontoken = currentUser._sessionToken;
                $.ajax({
                    url: 'https://api.parse.com/1/roles/' + this.model.attributes.objectId,
                    type: 'DELETE',
                    headers: {
                        'X-Parse-Application-Id': APP_ID,
                        'X-Parse-REST-API-Key': REST_KEY,
                        'X-Parse-Session-Token': sessiontoken
                    },
                    success: function (result) {
                        self.model.destroy();
                        notify.addSuccess('Role has been successfully deleted!');
                    },
                    error: function (xhr, status, error) {
                        notify.addError('Error occured while deleting a user! Message: ' + xhr.responseText);
                    }
                });
            } else {
                notify.addNotice('Log in!');
            }
        },
        showChildRoles: function () {
            var gridChildRolesView = new GridChildRolesView({'model': this.model, 'el': 'div.col-lg-9'});
            gridChildRolesView.render();
        }
    });

    return RoleView;
});