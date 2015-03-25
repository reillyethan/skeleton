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
            var childName = $('input.name').val();
            Parse.Cloud.run(
                'addChildRole',
                {
                    parentName: self.parentRole.attributes.name,
                    childName: childName
                },
                {
                    success: function() {
                        var query = new Parse.Query(Parse.Role).equalTo('name', childName).find({
                            success: function (result) {
                                self.collection.add(result[0]);
                            },
                            error: function () {
                                notify.addError('Unable to render added child role');
                            }
                        });
                        self.$el.find('div.' + modalClass).modal('hide');
                        notify.addSuccess('Child role has been added!');
                    },
                    error: function(error) {
                        notify.addError('Error occured while adding a child role to a role! Message: ' + error.message);
                    }
                }
            );
        }
    });
});