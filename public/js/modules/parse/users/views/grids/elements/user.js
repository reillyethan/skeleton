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
    'modules/parse/users/views/forms/reset-password',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, UserEditView, User, UserResetPasswordView) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var APP_ID = "v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe";
    var REST_KEY = "FjGzHv8sQKjY9FH32Y4PFdEuwgFjWq03xm1i8Cc2";

    var UserView = Backbone.View.extend({
        template: _.template(User),
        events: {
            'click button.edit': 'edit',
            'click button.reset-password': 'resetPassword',
            'click button.remove': 'remove'
        },
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'unrender',
                'edit',
                'resetPassword',
                'remove'
            );
            this.model.bind('change', this.render);
            this.model.bind('remove', this.unrender);
        },
        render: function(){
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.attributes, function (values, keys) {
                keysArray.push(keys);
                valuesArray.push(values);
            });
            var authData = null;
            if ('undefined' !== typeof(this.model.attributes.authData) &&
                'undefined' !== typeof(this.model.attributes.authData.facebook)){
                authData = this.model.attributes.authData;
            }

            this.$el.html(this.template({
                keys: keysArray,
                values: valuesArray,
                authData: authData,
                user: this.model
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
        },
        edit: function(){
            var currentUser = Parse.User.current();
            if (currentUser) {
                if (this.model.attributes.username == currentUser.attributes.username) {
                    var userEditView = new UserEditView({
                        'model': this.model,
                        'el': 'div.col-lg-9'
                    });
                    userEditView.render();
                } else {
                    notify.addError('Only user can edit himself!');
                }
            } else {
                notify.addError('Log in!');
            }
        },
        resetPassword: function(){
            var currentUser = Parse.User.current();
            if (currentUser) {
                if (this.model.attributes.username == currentUser.attributes.username) {
                    var userResetPasswordView = new UserResetPasswordView({'el': 'div.col-lg-9'});
                    userResetPasswordView.render();
                } else {
                    notify.addError('Only user can reset his password!');
                }
            } else {
                notify.addError('Log in!');
            }
        },
        remove: function(){
            var self = this;
            var currentUser = Parse.User.current();
            if (currentUser) {
                if (this.model.attributes.username == currentUser.attributes.username) {
                    var sessiontoken = currentUser._sessionToken;
                    $.ajax({
                        url: 'https://api.parse.com/1/users/' + currentUser.id,
                        type: 'DELETE',
                        headers: {'X-Parse-Application-Id': APP_ID, 'X-Parse-REST-API-Key': REST_KEY, 'X-Parse-Session-Token': sessiontoken},
                        success: function (result) {
                            self.model.destroy();
                            Parse.User.logOut();
                            notify.addSuccess('User has been successfully deleted!');
                        },
                        error: function(xhr, status, error) {
                            notify.addError('Error occured while deleting a user! Message: ' + xhr.responseText);
                        }
                    });
                } else {
                    notify.addError('Only user can delete himself!');
                }
            } else {
                notify.addError('Log in!');
            }
        }
    });

    return UserView;
});