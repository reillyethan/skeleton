/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-login.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, UserLoginTemplate) {
    var modalClass = "login";
    return Backbone.View.extend({
        template: _.template(UserLoginTemplate),
        events: {
            'click button.submit': 'submitLogin',
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitLogin'
            );
            this.usersGridView = options.usersGridView;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.' + modalClass).remove();
        },
        submitLogin: function () {
            var password = this.$el.find('div.' + modalClass).find('input.password').val();
            var username = this.$el.find('div.' + modalClass).find('input.username').val();
            var self = this;
            Parse.User.logIn(username, password, {
                success: function(user) {
                    self.usersGridView.updateCurrentUser();
                    Backbone.pubSub.trigger('userLoggedIn');
                    self.$el.find('div.' + modalClass).modal('hide');
                    notify.addSuccess('You have successfully logged in!');
                },
                error: function(user, error) {
                    notify.addError('Authentication failed! Message: ' + error.message);
                }
            });
        }
    });
});