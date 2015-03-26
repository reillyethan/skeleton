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
    var modalClass = 'edit';

    return Backbone.View.extend({
        template: _.template(UserEditTemplate),
        events: {
            'click button.submit': 'submitEdit',
            'click button.more': 'moreCustomFields',
            'click button.less': 'lessCustomFields',
            'hide.bs.modal': 'unrender'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitEdit',
                'moreCustomFields',
                'lessCustomFields'
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
            this.$el.append(this.template({modalClass: modalClass, keys: keysArray, values: valuesArray}));
            this.$el.find('div.modal.' + modalClass).modal('show');
        },
        unrender: function () {
            this.model.remove();
            this.$el.find('div.modal.' + modalClass).remove();
            this.unbind();
        },
        submitEdit: function () {
            $(".submit").attr("disabled", true);

            var self = this;
            var editedUserFields = [];
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.attributes, function(values, keys){
                keysArray.push(keys);
                valuesArray.push(values);
            });
            for (var i=0; i<keysArray.length; i++) {
                var input = this.$el.find('div.modal.' + modalClass + ' > div.modal-dialog > div.modal-content > div.modal-body > div.form-group > input.' + keysArray[i]).val();
                editedUserFields.push({key: keysArray[i], value: input});
            }
            var customFieldsKey = this.$el.find('input.custom-fields-key');
            var customFieldsValue = this.$el.find('input.custom-fields-value');
            for (var i=0; i<customFieldsKey.length; i++) {
                editedUserFields.push({key: $(customFieldsKey[i]).val(), value: $(customFieldsValue[i]).val()});
            }
            console.log(editedUserFields);
            Parse.Cloud.run('editUser', {
                username: self.model.attributes.username,
                userFields: editedUserFields
            }, {
                success: function(result) {
                    $('div.modal.' + modalClass).modal('hide');
                    self.model.set(result);
                    notify.addSuccess('User has been successfully edited!');
                },
                error: function(error) {
                    notify.addError('Error occured while editing user! Message: ' + error.message);
                }
            });
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