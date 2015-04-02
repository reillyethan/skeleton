/**
 * Created by alexander on 3/23/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-profile.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, UserProfileTemplate) {
    var modalClass = "profile";

    return Backbone.View.extend({
        template: _.template(UserProfileTemplate),
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
            var authData = null;
            if ('undefined' !== typeof(this.model.attributes.authData) &&
                'undefined' !== typeof(this.model.attributes.authData.facebook)){
                authData = this.model.attributes.authData;
            }

            var user = this.model.toJSON();

            var createdAt = new Date();
            createdAt.setTime(Date.parse(user['createdAt']));
            var day = createdAt.getDay();
            var month = createdAt.getMonth() + 1;
            var year = createdAt.getFullYear();
            var hours = createdAt.getHours();
            var minutes = createdAt.getMinutes();
            user['createdAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

            var updatedAt = new Date();
            updatedAt.setTime(Date.parse(user['updatedAt']));
            day = updatedAt.getDay();
            month = updatedAt.getMonth() + 1;
            year = updatedAt.getFullYear();
            hours = updatedAt.getHours();
            minutes = updatedAt.getMinutes();
            user['updatedAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

            console.log(user);

            this.$el.append(this.template({
                keys: keysArray,
                values: valuesArray,
                authData: authData,
                user: user,
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