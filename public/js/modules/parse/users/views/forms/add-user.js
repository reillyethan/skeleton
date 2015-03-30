/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-create.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, UserCreateTemplate) {
    var modalClass = 'create';
    return Backbone.View.extend({
        template: _.template(UserCreateTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'click button.more': 'moreCustomFields',
            'click button.less': 'lessCustomFields',
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            this.collection = options.collection;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.modal.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.create-user').removeClass('disabled');
            this.collection.remove();
            this.$el.find('div.modal.' + modalClass).remove();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);

            var self = this;

            var username = $('input.username').val();
            var password = $('input.password').val();
            var email = $('input.email').val();

            var customFields = [];
            $('div.add-fields-form>ul>li').each(function (counter, element) {
                var key = $(element).find('div.form-group>input.key').val();
                var value = $(element).find('div.form-group>input.value').val();
                if (key && value) {
                    customFields.push({key: key, value: value});
                }
            });

            if (username && password && email) {
                var query = new Parse.Query(Parse.User).equalTo("username", username).find({
                    success: function (results) {
                        var user = results[0];
                        if ("undefined" === typeof user) {
                            user = new Parse.User();
                            user.set("username", username);
                            user.set("password", password);
                            user.set("email", email);

                            customFields.forEach(function (field) {
                                user.set(field.key, field.value);
                            });

                            user.signUp(null, {
                                success: function(user) {
                                    self.collection.add(user);
                                    self.$el.find('div.modal.' + modalClass).modal('hide');
                                    notify.addSuccess('User ' + username + ' is successfully created');
                                },
                                error: function(user, error) {
                                    notify.addError("Error: " + error.code + " " + error.message);
                                }
                            });
                        } else {
                            notify.addError('This user is already exists');
                        }
                    }
                });
            } else {
                notify.addError('Not enough fields are filled');
            }
            $(".submit").removeAttr("disabled");
        },
        moreCustomFields: function () {
            if (this.$el.find('.add-fields-form > ul.list-group > li.list-group-item').length >= 1) {
                if (this.$el.find('.add-fields-form > ul > div.btn-group-xs > .less').length === 0) {
                    this.$el
                        .find('.add-fields-form > ul > div.btn-group-xs')
                        .append('<button class="less btn btn-xs btn-primary" type="button"><i class="fa fa-minus"></i></button>');
                }
            }

            this.$el
                .find('.add-fields-form > ul.list-group > li.list-group-item')
                .first()
                .clone()
                .appendTo(this.$el.find('.add-fields-form > ul.list-group'));

            this.$el.find('.add-fields-form > ul > div.btn-group-xs').appendTo(
                this.$el.find('.add-fields-form > ul.list-group')
            );
        },
        lessCustomFields: function () {
            this.$el
                .find('.add-fields-form > ul.list-group > li.list-group-item')
                .last()
                .remove();

            if (this.$el.find('.add-fields-form > ul.list-group > li.list-group-item').length == 1) {
                this.$el
                    .find('.add-fields-form > ul > div.btn-group-xs > .less')
                    .remove();
            }
        }
    });
});