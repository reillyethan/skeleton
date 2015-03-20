/**
 * Created by alexander on 3/20/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/add-child-user.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, ChildUserAddTemplate) {
    return Backbone.View.extend({
        template: _.template(ChildUserAddTemplate),
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
            this.$el.append(this.template());
            this.$el.find('div.modal-create').modal('show');
        },
        unrender: function () {
            this.$el.find('div.modal-create').remove();
        },
        submitCreate: function () {
            var self = this;
            var username = $('input.username').val();

            var query = new Parse.Query(Parse.Role).equalTo('name', this.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.User).equalTo('username', username).find({
                        success: function (result) {
                            parentRole.getUsers().add(result[0]);
                            parentRole.save();
                            self.collection.add(result[0]);
                            self.$el.find('div.modal-create').modal('hide');
                            notify.addSuccess('Child user has been added!');
                        }
                    });
                }
            });
        }
    });
});