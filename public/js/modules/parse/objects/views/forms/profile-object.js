/**
 * Created by alexander on 3/26/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/objects/views/templates/object-profile.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, ObjectProfileTemplate) {
    var modalClass = "profile-object";

    return Backbone.View.extend({
        template: _.template(ObjectProfileTemplate),
        events: {
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            _.bindAll(
                this,
                'render',
                'unrender'
            );
            this.model = options.model;
        },
        render: function () {
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.toJSON(), function (values, keys) {
                keysArray.push(keys);
                valuesArray.push(values);
            });

            this.$el.append(this.template({
                keys: keysArray,
                values: valuesArray,
                object: this.model.toJSON(),
                modalClass: modalClass
            }));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.profile').removeClass('disabled');
            this.$el.find('div.' + modalClass).remove();
            this.$el.unbind();
        }
    });
});