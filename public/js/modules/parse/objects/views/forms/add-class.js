/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/objects/views/templates/add-class.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, ClassCreateTemplate) {
    var modalClass = "add-class";

    return Backbone.View.extend({
        template: _.template(ClassCreateTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'hidden.bs.modal': 'unrender'
        },
        initialize: function (options) {
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitCreate'
            );
            this.collection = options.collection;
            this.that = options.that;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.create-new-class').removeClass('disabled');
            this.$el.find('div.' + modalClass).unbind();
            this.$el.find('div.' + modalClass).remove();
            this.$el.unbind();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);

            var self = this;
            var className = $('input.className').val();

            if (className && className.match(/[a-zA-z]*/g)[0].length) {
                $.ajax({
                    url: '/parse-objects/get-objects-list',
                    success: function (data) {
                        if ($.inArray(className, data) > -1) {
                            notify.addError('Classname is already exists!');
                        } else {
                            $.ajax({
                                method: 'post',
                                url: '/parse-objects/create-new-class',
                                data: {"className": className},
                                success: function (response) {
                                    self.$el.find('select.objectClassSelector').append('<option>' + response.className + '</option>');
                                    notify.addSuccess(response.className + " class has been added!");
                                    self.$el.find('div.' + modalClass).modal('hide');
                                }
                            });
                        }
                    },
                    error: function () {
                        notify.addError('Problems while getting objects list');
                    }
                });
            } else {
                notify.addError('Type the valid className (regexp: "#[a-zA-Z]*#")!');
            }
            $(".submit").removeAttr("disabled");

        }
    });
});