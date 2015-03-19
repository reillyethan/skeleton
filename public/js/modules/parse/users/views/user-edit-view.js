/**
 * Created by alexander on 3/13/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-edit.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, UserEditTemplate) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var customFieldsCounter = 0;

    var UserEditView = Backbone.View.extend({
        template: _.template(UserEditTemplate),
        events: {
            'click button.submit': 'submitEdit',
            'click button.more': 'moreCustomFields',
            'click button.less': 'lessCustomFields',
            'click button.fb-link': 'fbLink',
            'click button.fb-unlink': 'fbUnlink',
            'hide.bs.modal': 'unrender'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitEdit',
                'moreCustomFields',
                'lessCustomFields',
                'fbLink',
                'fbUnlink'
            );
            this.model = options.model;
        },
        render: function () {
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.attributes, function(values, keys){
                keysArray.push(keys);
                valuesArray.push(values);
            });
            this.$el.append(this.template({keys: keysArray, values: valuesArray}));
            this.$el.find('div.modal-edit').modal('show');
        },
        unrender: function () {
            this.$el.find('div.modal-edit').remove();
        },
        submitEdit: function () {
            var currentUser = Parse.User.current();
            var keysArray = [];
            var valuesArray = [];
            $.map(currentUser.attributes, function(values, keys){
                keysArray.push(keys);
                valuesArray.push(values);
            });
            for (var i=0; i<keysArray.length; i++) {
                var input = this.$el.find('div.modal-edit > div.modal-dialog > div.modal-content > div.modal-body > div.form-group > input.' + keysArray[i]).val();
                currentUser.set(keysArray[i], input);
            }
            var customFieldsKey = this.$el.find('input.custom-fields-key');
            var customFieldsValue = this.$el.find('input.custom-fields-value');
            for (var i=0; i<customFieldsKey.length; i++) {
                currentUser.set(
                    $(customFieldsKey[i]).val(),
                    $(customFieldsValue[i]).val()
                );
            }
            currentUser.save(null, {
                success: function(user, error) {
                    if (error) {
                        notify.addError('Error occured while saving! Message: ' + error.message);
                    }
                    notify.addSuccess('User has been successfully edited!');

                }
            });
            $('div.modal-edit').modal('hide');
            this.model.set(currentUser);
        },
        moreCustomFields: function () {
            customFieldsCounter++;
            if (customFieldsCounter > 0) {
                if (!$('button.less').length) {
                    this.$el.find('div.btn-group-xs').append('<button class="less btn btn-xs btn-warning" type="button">Less fields</button>');
                }
            }
            this.$el.find('input.custom-fields-key').first().clone().appendTo(this.$el.find('div.form-group'));
            this.$el.find('input.custom-fields-value').first().clone().appendTo(this.$el.find('div.form-group'));
        },
        lessCustomFields: function () {
            customFieldsCounter--;
            this.$el.find('input.custom-fields-value').last().remove();
            this.$el.find('input.custom-fields-key').last().remove();

            if (customFieldsCounter == 0) {
                this.$el.find('button.less').remove();
            }
        },
        fbLink: function () {
            var self = this;
            var currentUser = Parse.User.current();
            if (!Parse.FacebookUtils.isLinked(currentUser)) {
                Parse.FacebookUtils.link(currentUser, null, {
                    success: function(user) {
                        notify.addSuccess("Woohoo, user logged in with Facebook!");
                        $('div.modal-edit').modal('hide');
                        self.model.set(user);
                    },
                    error: function(user, error) {
                        $('div.modal-edit').modal('hide');
                        notify.addError("User cancelled the Facebook login or did not fully authorize.");
                    }
                });
            }
        },
        fbUnlink: function () {
            var self = this;
            var currentUser = Parse.User.current();
            Parse.FacebookUtils.unlink(currentUser, {
                success: function(user) {
                    $('div.modal-edit').modal('hide');
                    notify.addNotice("The user is no longer associated with their Facebook account.");
                    self.model.set(user);
                }
            });
        }
    });

    return UserEditView;
});