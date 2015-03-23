/**
 * Created by alexander on 3/19/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/roles/views/grids/elements/child-user',
    'modules/parse/roles/collections/role',
    'text!modules/parse/roles/views/templates/grid-child-users.html',
    'modules/parse/roles/views/forms/add-child-user',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, ChildUserView, RoleCollection, GridChildUsersTemplate, ChildUserAddView) {
    var modalClass = "child-users";

    return Backbone.View.extend({
        template: _.template(GridChildUsersTemplate),
        events: {
            'hide.bs.modal': 'unrender',
            'click button.addChildUser': 'addChildUser'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'appendUser'
            );
            var self = this;
            this.collection = new RoleCollection();
            this.collection.bind('add', this.appendUser);
            this.parentRole = options.model;

            var query = new Parse.Query(Parse.Role).equalTo('name', options.model.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    parentRole.getUsers().query().find({
                        success: function (results) {
                            for (i in results) {
                                self.collection.add(results[i]);
                            }
                        },
                        error: function (error) {
                            notify.addError("Error: " + error.code + " " + error.message);
                        }
                    });
                }
            });
        },
        render: function () {
            this.$el.append(this.template({modalClass: modalClass}));
            var self = this;
            _(this.collection.models).each(function(user){
                self.find('div.' + modalClass).find('table > tbody').appendUser(user);
            }, this);
            this.$el.find('div.' + modalClass).modal('show');
        },
        unrender: function () {
            this.$el.find('div.' + modalClass).remove();
        },
        appendUser: function (user) {
            var self = this;
            var query = new Parse.Query(Parse.Role).equalTo('name', self.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.User).equalTo('username',user.attributes.username).find({
                        success: function (result) {
                            self.$el.find('div.' + modalClass).find('table > tbody').append('<tr class="' + result[0].attributes.username + '"></tr>');
                            var childUserView = new ChildUserView({
                                parentRole: parentRole,
                                model: result[0],
                                el: self.$el.find('div.' + modalClass).find('table > tbody > tr.' + result[0].attributes.username)
                            });
                            childUserView.render();
                        }
                    });
                }
            });
        },
        addChildUser: function () {
            var childUserAddView = new ChildUserAddView({
                'parentRole': this.parentRole,
                'collection': this.collection,
                'el': 'div.col-lg-9'
            });
            childUserAddView.render();
        }
    });
});
