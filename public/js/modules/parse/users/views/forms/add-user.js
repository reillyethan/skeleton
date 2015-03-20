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
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var moreFieldsCounter = 0;

    var UserCreateView = Backbone.View.extend({
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
            this.$el.append(this.template());
            this.$el.find('div.modal-create').modal('show');
        },
        unrender: function () {
            this.$el.find('div.modal-create').remove();
        },
        submitCreate: function () {
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
                var user = new Parse.User();
                user.set("username", username);
                user.set("password", password);
                user.set("email", email);

                customFields.forEach(function (field) {
                    user.set(field.key, field.value);
                });

                user.signUp(null, {
                    success: function(user) {
                        $('input.username').val('');
                        $('input.password').val('');
                        $('input.email').val('');
                        $('div.add-fields-form>ul>li').each(function (counter, element) {
                            $(element).find('div.form-group>input.key').val('');
                            $(element).find('div.form-group>input.value').val('');
                        });
                        self.collection.add(user);
                        self.$el.find('div.modal-create').modal('hide');
                        notify.addSuccess('User ' + username + ' is successfully created');
                    },
                    error: function(user, error) {
                        notify.addError("Error: " + error.code + " " + error.message);
                    }
                });
            }
        },
        moreCustomFields: function () {
            moreFieldsCounter++;
            if (moreFieldsCounter > 0) {
                if (this.$el.find('.add-fields-form > ul > div > div > .less').length === 0) {
                    this.$el
                        .find('.add-fields-form > ul > div')
                        .append('<div class="col-sm-1 col-sm-offset-2"><button class="less btn btn-xs btn-warning" type="button">Less fields</button></div>');
                }
            }

            this.$el
                .find('.add-fields-form > ul.list-group > li.list-group-item')
                .first()
                .clone()
                .appendTo(this.$el.find('.add-fields-form > ul.list-group'));

            this.$el.find('.add-fields-form > ul > div.row').appendTo(
                this.$el.find('.add-fields-form > ul.list-group')
            );
        },
        lessCustomFields: function () {
            moreFieldsCounter--;
            this.$el
                .find('.add-fields-form > ul.list-group > li.list-group-item')
                .last()
                .remove();

            if (moreFieldsCounter == 0) {
                this.$el
                    .find('.add-fields-form > ul > div > div > .less')
                    .remove();
            }
        }
    });

    return UserCreateView;
});