/**
 * Created by alexander on 3/13/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'modules/parse/users/views/forms/edit-user',
    'text!modules/parse/users/views/templates/user.html',
    'modules/parse/users/views/forms/profile-user',
    'modules/parse/users/views/grids/user-roles',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, UserEditView, User, UserProfileView, UserEditRolesView) {
    return Backbone.View.extend({
        template: _.template(User),
        events: {
            'click button.edit': 'edit',
            'click button.edit-roles': 'editRoles',
            'click button.remove': 'remove',
            'click button.profile': 'profile'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'profile',
                'edit',
                'editRoles',
                'remove'
            );
            this.model.bind('change', this.render);
            this.model.bind('remove', this.unrender);
            this.grid = options.grid;
        },
        render: function(){
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.toJSON(), function (values, keys) {
                keysArray.push(keys);
                valuesArray.push(values);
            });
            var authData = null;
            if ('undefined' !== typeof(this.model.toJSON().authData) &&
                'undefined' !== typeof(this.model.toJSON().authData.facebook)){
                authData = this.model.toJSON().authData;
            }

            var user = this.model.toJSON();

            var createdAt = new Date();
            createdAt.setTime(Date.parse(user['createdAt']));
            var day = createdAt.getDay();
            var month = createdAt.getMonth() + 1;
            var year = createdAt.getFullYear();
            var hours = createdAt.getHours();
            var minutes = createdAt.getMinutes();
            user['createdAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

            var updatedAt = new Date();
            updatedAt.setTime(Date.parse(user['updatedAt']));
            day = updatedAt.getDay();
            month = updatedAt.getMonth() + 1;
            year = updatedAt.getFullYear();
            hours = updatedAt.getHours();
            minutes = updatedAt.getMinutes();
            user['updatedAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;


            this.$el.html(this.template({
                keys: keysArray,
                values: valuesArray,
                authData: authData,
                user: user
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
            this.model.unbind('change', this.render);
            this.model.unbind('remove', this.unrender);
            this.$el.unbind();
        },
        edit: function(){
            this.$el.find('button.edit').addClass('disabled');
            var userEditView = new UserEditView({
                'model': this.model,
                'el': 'div.col-lg-9'
            });
            userEditView.render();
        },
        remove: function(){
            if (confirm('Are you sure you want to delete this user?')) {
                var self = this;
                Parse.Cloud.run('deleteUser', {username: self.model.attributes.username}, {
                    success: function(result) {
                        self.model.destroy();
                        Parse.User.logOut();
                        notify.addSuccess('User has been successfully deleted!');
                    },
                    error: function(error) {
                        notify.addError('Error occured while deleting user! Message: ' + error.message);
                    }
                });
            }
            return false;
        },
        profile: function () {
            this.$el.find('button.profile').addClass('disabled');
            var userProfileView = new UserProfileView({
                'model': this.model,
                'el': 'div.col-lg-9'
            });
            userProfileView.render();
        },
        editRoles: function () {
            this.$el.find('button.edit-roles').addClass('disabled');
            var userEditRolesView = new UserEditRolesView({
                'user': this.model,
                'el': 'div.col-lg-9'
            });
            userEditRolesView.render();
        }
    });
});