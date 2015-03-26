/**
 * Created by alexander on 3/26/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    //'modules/parse/users/views/forms/edit-object',
    //'text!modules/parse/users/views/templates/user.html',
    //'modules/parse/users/views/forms/profile-user',
    'bootstrap',
    'json2'
], function (
    Backbone,
    $,
    _,
    notify
    //UserEditView,
    //Object,
    //ObjectProfileView
    ) {
    //return Backbone.View.extend({
    //    template: _.template(Object),
    //    events: {
    //        'click button.edit': 'edit',
    //        'click button.reset-password': 'resetPassword',
    //        'click button.remove': 'remove',
    //        'click button.profile': 'profile'
    //
    //    },
    //    initialize: function(options){
    //        _.bindAll(
    //            this,
    //            'render',
    //            'unrender',
    //            'profile',
    //            'edit',
    //            'resetPassword',
    //            'remove'
    //        );
    //        this.model.bind('change', this.render);
    //        this.model.bind('remove', this.unrender);
    //        this.grid = options.grid;
    //    },
    //    render: function(){
    //        var keysArray = [];
    //        var valuesArray = [];
    //        $.map(this.model.attributes, function (values, keys) {
    //            keysArray.push(keys);
    //            valuesArray.push(values);
    //        });
    //        var authData = null;
    //        if ('undefined' !== typeof(this.model.attributes.authData) &&
    //            'undefined' !== typeof(this.model.attributes.authData.facebook)){
    //            authData = this.model.attributes.authData;
    //        }
    //
    //        this.$el.html(this.template({
    //            keys: keysArray,
    //            values: valuesArray,
    //            authData: authData,
    //            user: this.model
    //        }));
    //
    //        return this;
    //    },
    //    unrender: function(){
    //        this.$el.remove();
    //    },
    //    edit: function(){
    //        var userEditView = new UserEditView({
    //            'model': this.model,
    //            'el': 'div.col-lg-9'
    //        });
    //        userEditView.render();
    //    },
    //    resetPassword: function(){
    //        var currentUser = Parse.User.current();
    //        if (currentUser) {
    //            if (this.model.attributes.username == currentUser.attributes.username) {
    //                var userResetPasswordView = new UserResetPasswordView({'el': 'div.col-lg-9'});
    //                userResetPasswordView.render();
    //            } else {
    //                notify.addError('Only user can reset his password!');
    //            }
    //        } else {
    //            notify.addError('Log in!');
    //        }
    //    },
    //    remove: function(){
    //        if (confirm('Are you sure you want to delete that?')) {
    //            var self = this;
    //            Parse.Cloud.run('deleteUser', {username: self.model.attributes.username}, {
    //                success: function(result) {
    //                    self.model.destroy();
    //                    Parse.User.logOut();
    //                    self.grid.updateCurrentUser();
    //                    notify.addSuccess('User has been successfully deleted!');
    //                },
    //                error: function(error) {
    //                    notify.addError('Error occured while deleting user! Message: ' + error.message);
    //                }
    //            });
    //        }
    //        return false;
    //    },
    //    profile: function () {
    //        var userProfileView = new UserProfileView({
    //            'model': this.model,
    //            'el': 'div.col-lg-9'
    //        });
    //        userProfileView.render();
    //    }
    //});
});