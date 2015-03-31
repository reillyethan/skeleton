/**
 * Created by alexander on 3/26/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/objects/views/templates/object-create.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, ObjectCreateTemplate) {
    var modalClass = 'create-object';
    return Backbone.View.extend({
        template: _.template(ObjectCreateTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'click button.more': 'moreCustomFields',
            'click button.less': 'lessCustomFields',
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            this.collection = options.collection;
            this.objectClassName = options.objectClassName;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.modal.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.create-object').removeClass('disabled');
            this.collection.remove();
            this.$el.find('div.modal.' + modalClass).remove();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);

            var self = this;

            var customFields = [];
            $('div.add-fields-form>ul>li').each(function (counter, element) {
                var key = $(element).find('div.form-group>input.key').val();
                var value = $(element).find('div.form-group>input.value').val();
                if (key && value && key.match(/[a-zA-z]*/g)[0].length && value.match(/[a-zA-Z0-9-_@.,]*/g)[0].length) {
                    customFields.push({key: key, value: value});
                } else {
                    notify.addError('Enter valid key value! Key regexp: "[a-zA-z]*", Value regexp: "[a-zA-Z0-9-_@.,]*"');
                    $(".submit").attr("disabled", false);
                }
            });

            var Object = Parse.Object.extend(this.objectClassName);
            var object = new Object();

            customFields.forEach(function (field) {
                object.set(field.key, field.value);
            });

            object.save(null, {
                success: function(object) {
                    self.collection.add(object);
                    self.$el.find('div.modal.' + modalClass).modal('hide');
                    notify.addSuccess('object is successfully created');
                },
                error: function(object, error) {
                    notify.addError("Error: " + error.code + " " + error.message);
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