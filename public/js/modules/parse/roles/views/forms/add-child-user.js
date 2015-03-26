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
    var modalClass = "add-child-user";

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
            this.$el.append(this.template({modalClass: modalClass}));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.' + modalClass).remove();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);
            var self = this;
            var childUsername = $('input.username').val();
            Parse.Cloud.run(
                'addChildUser',
                {
                    parentName: self.parentRole.attributes.name,
                    childUsername: childUsername
                },
                {
                    success: function() {
                        var query = new Parse.Query(Parse.User).equalTo('name', childUsername).find({
                            success: function (result) {
                                self.collection.add(result[0]);
                            },
                            error: function () {
                                notify.addError('Unable to render added child user');
                            }
                        });
                        self.$el.find('div.' + modalClass).modal('hide');
                        notify.addSuccess('Child user has been added!');
                    },
                    error: function(error) {
                        notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
                    }
                }
            );
            $(".submit").removeAttr("disabled");
        }
    });
});