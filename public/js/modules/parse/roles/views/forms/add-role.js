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
    var modalClass = "add-role";

    return Backbone.View.extend({
        template: _.template(RoleCreateTemplate),
        events: {
            'click button.submit': 'submitCreate',
            'click button.more': 'moreObjectsFields',
            'click button.less': 'lessObjectsFields',
            'hidden.bs.modal': 'unrender'
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
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('button.create').removeClass('disabled');
            this.collection.remove();
            this.$el.find('div.' + modalClass).unbind();
            this.$el.find('div.' + modalClass).remove();
            this.$el.unbind();
        },
        submitCreate: function () {
            $(".submit").attr("disabled", true);

            var self = this;
            var name = $('input.name').val();

            var objects = [];
            this.$el.find('.add-fields-form li.list-group-item').each(function (counter, element) {
                var objectId = $(element).find('input.objectId').val();
                var selectedAccessOption = $(element).find("select option:selected").text();
                if (objectId.length) {
                    if (objectId && selectedAccessOption && objectId.match(/[a-zA-z0-9]*/g)[0].length) {
                        objects.push({'objectId': objectId, 'option': selectedAccessOption})
                    } else {
                        notify.addError('You must type valid objectId! Check out the regexp: "[a-zA-z0-9]*"');
                    }
                }
            });
            var publicOption = this.$el.find('div.all-objects select option:selected').text();
            if (name && name.match(/[a-zA-z0-9_-]*/g)[0].length) {
                var query = new Parse.Query(Parse.Role).equalTo("name", name).find({
                    success: function (results) {
                        var role = results[0];
                        if ("undefined" === typeof role) {
                            var roleACL = new Parse.ACL();
                            if (objects.length) {
                                objects.forEach(function (object) {
                                    switch (object.option) {
                                        case 'Write Access':
                                            roleACL.setWriteAccess(object.objectId, true);
                                            break;
                                        case 'Read Access':
                                            roleACL.setReadAccess(object.objectId, true);
                                            break;
                                        case 'Both':
                                            roleACL.setWriteAccess(object.objectId, true);
                                            roleACL.setReadAccess(object.objectId, true);
                                            break;
                                        default:
                                            break;
                                    }
                                });
                            }
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

                            role = new Parse.Role(name, roleACL);
                            role.save(null, {
                                success: function(role) {
                                    self.collection.add(role);
                                    self.$el.find('div.' + modalClass).modal('hide');
                                    notify.addSuccess('Role ' + name + ' successfully created');
                                },
                                error: function(role, error) {
                                    notify.addError("Cannot not save role. Error: " + error.code + " " + error.message);
                                }
                            });
                        } else {
                            notify.addError('Role is already exists!');
                        }
                    }
                });
            } else {
                notify.addError('At least, valid name should be provided! Regexp: "[a-zA-z0-9_-]*"');
            }
            $(".submit").removeAttr("disabled");
        },
        moreObjectsFields: function () {
            if (this.$el.find('.add-fields-form ul.list-group > li.list-group-item').length >= 1) {
                if (this.$el.find('.add-fields-form div.btn-group-xs > button.less').length === 0) {
                    this.$el.find('div.' + modalClass + ' div.btn-group-xs').append(
                        '<button class="less btn btn-xs btn-primary" type="button"><i class="fa fa-minus"></i></button>'
                    );
                }
            }
            this.$el.find('.add-fields-form ul.list-group > li.list-group-item').first().clone().appendTo(
                this.$el.find('.add-fields-form > ul.list-group')
            );
            this.$el.find('div.' + modalClass).find('div.btn-group-xs').appendTo(
                this.$el.find('div.' + modalClass + ' .add-fields-form > ul.list-group')
            );
        },
        lessObjectsFields: function () {
            this.$el.find('.add-fields-form li.list-group-item').last().remove();
            if (this.$el.find('.add-fields-form > ul.list-group > li.list-group-item').length == 1) {
                this.$el.find('div.' + modalClass).find('.add-fields-form div.btn-group-xs > button.less').remove();
            }
        }
    });
});