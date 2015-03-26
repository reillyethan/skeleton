/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'parse',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/add-role.html',
    'bootstrap',
    'json2'
], function (Backbone, Parse, $, _, notify, RoleCreateTemplate) {
    var moreFieldsCounter = 0;
    var modalClass = "add-role";

    return Backbone.View.extend({
        template: _.template(RoleCreateTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'click button.more': 'moreObjectsFields',
            'click button.less': 'lessObjectsFields',
            'hide.bs.modal': 'unrender'
        },
        initialize: function (options) {
            _.bindAll(
                this,
                'render',
                'unrender',
                'submitCreate',
                'moreObjectsFields',
                'lessObjectsFields'
            );

            this.collection = options.collection;
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            console.log(this.$el.find('div.' + modalClass));
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div' + modalClass).remove();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);

            var self = this;
            var name = $('input.name').val();

            var objects = [];
            this.$el.find('div.fields').each(function (counter, element) {
                var objectId = $(element).find('input.objectId').val();
                var selectedAccessOption = $(element).find("select option:selected").text();
                if (objectId && selectedAccessOption) {
                    objects.push({'objectId': objectId, 'option': selectedAccessOption})
                }
            });
            if (name) {
                var roleACL = new Parse.ACL();
                if (objects.length) {
                    objects.forEach(function (object) {
                        switch (object.option) {
                            case 'write':
                                roleACL.setWriteAccess(object.objectId, true);
                                break;
                            case 'read':
                                roleACL.setReadAccess(object.objectId, true);
                                break;
                            case 'both':
                                roleACL.setWriteAccess(object.objectId, true);
                                roleACL.setReadAccess(object.objectId, true);
                                break;
                            default:
                                break;
                        }
                    })
                }
                var publicOption = this.$el.find('div.all-objects select option:selected').text();
                switch (publicOption) {
                    case 'write':
                        roleACL.setPublicWriteAccess(true);
                        break;
                    case 'read':
                        roleACL.setPublicReadAccess(true);
                        break;
                    case 'both':
                        roleACL.setPublicWriteAccess(true);
                        roleACL.setPublicReadAccess(true);
                        break;
                    default:
                        break;
                }

                var role = new Parse.Role(name, roleACL);
                role.save(null, {
                    success: function(role) {
                        self.collection.add(role);
                        self.$el.find('div' + modalClass).modal('hide');
                        notify.addSuccess('Role ' + name + ' is successfully created');
                    },
                    error: function(role, error) {
                        notify.addError("Could not save changes to role. Error: " + error.code + " " + error.message);
                    }
                });
            }
            $(".submit").removeAttr("disabled");
        },
        moreObjectsFields: function () {
            moreFieldsCounter++;
            if (moreFieldsCounter > 0) {
                if (this.$el.find('div' + modalClass).find('div.btn-group > button.less').length === 0) {
                    this.$el
                        .find('div' + modalClass)
                        .find('div.specific-object > div.btn-group')
                        .append('<button class="less btn btn-xs btn-warning" type="button">Less fields</button>');
                }
            }
            this.$el
                .find('div.fields')
                .clone()
                .appendTo(this.$el.find('div.specific-object'));

            this.$el.find('div' + modalClass).find('div.btn-group').appendTo(
                this.$el.find('div.specific-object')
            );
        },
        lessObjectsFields: function () {
            moreFieldsCounter--;
            this.$el
                .find('div.fields')
                .last()
                .remove();
            if (moreFieldsCounter == 0) {
                this.$el
                    .find('div' + modalClass)
                    .find('div.specific-object button.less')
                    .remove();
            }
        }
    });
});