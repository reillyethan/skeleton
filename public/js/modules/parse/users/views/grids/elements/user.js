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
            var self = this;
            var query = new Parse.Query(Parse.User).equalTo("username", this.model.attributes.username).find({
                success: function (results) {
                    var user = results[0];
                    var keysArray = [];
                    var valuesArray = [];

                    $.map(user.attributes, function (values, keys) {
                        keysArray.push(keys);
                        valuesArray.push(values);
                    });
                    var authData = null;
                    if ('undefined' !== typeof(user.attributes.authData) &&
                        'undefined' !== typeof(user.attributes.authData.facebook)){
                        authData = user.attributes.authData;
                    }

                    self.$el.html(self.template({
                        keys: keysArray,
                        values: valuesArray,
                        authData: authData,
                        user: user
                    }));

                    return self;
                },
                error: function () {
                    notify.addError('Problems with fetching a specific user!');
                }
            });
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