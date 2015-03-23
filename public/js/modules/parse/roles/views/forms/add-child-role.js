/**
 * Created by alexander on 3/20/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/add-child-role.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, ChildRoleAddTemplate) {
    var modalClass = "add-child-role";

    return Backbone.View.extend({
        template: _.template(ChildRoleAddTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitCreate'
            );
            this.collection = options.collection;
            this.parentRole = options.parentRole;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.' + modalClass).remove();
        },
        submitCreate: function () {
            var self = this;
            var name = $('input.name').val();

            var query = new Parse.Query(Parse.Role).equalTo('name', this.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.Role).equalTo('name', name).find({
                        success: function (result) {
                            parentRole.getRoles().add(result[0]);
                            parentRole.save();
                            self.collection.add(result[0]);
                            self.$el.find('div.' + modalClass).modal('hide');
                            notify.addSuccess('Child role has been added!');
                        }
                    });
                }
            });
        }
    });
});