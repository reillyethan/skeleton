/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-reset-password.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, UserResetPasswordTemplate) {
    var modalClass = 'reset-password';

    return Backbone.View.extend({
        template: _.template(UserResetPasswordTemplate),
        events: {
            'click button.submit': 'submitResetPassword',
            'hide.bs.modal': 'unrender'
        },
        initialize: function () {
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitResetPassword'
            );
        },
        render: function () {
            this.$el.append(this.template());
            this.$el.find('div.modal.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.modal.' + modalClass).remove();
        },
        submitResetPassword: function () {
            Parse.User.requestPasswordReset($('div.modal-body>div.form-group>input.email-reset').val(), {
                success: function() {
                    $('div.modal.' + modalClass).modal('hide');
                    notify.addSuccess('Email for resetting password has been sent!');
                },
                error: function(error) {
                    $('div.modal.' + modalClass).modal('hide');
                    notify.addError("Error: " + error.code + " " + error.message);
                }
            });
        }
    });
});