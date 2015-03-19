/**
 * Created by alexander on 3/17/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'role-view',
    'role-collection',
    'role-create-view',
    'text!modules/parse/roles/views/templates/grid.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, RoleView, RoleCollection, RoleCreateView, GridTemplate) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var GridView = Backbone.View.extend({
        template: _.template(GridTemplate),
        events: {
            'click button.create': 'createRole'
        },
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'appendRole',
                'createRole'
            );
            var self = this;
            this.collection = new RoleCollection();
            this.collection.bind('add', this.appendRole);
            var query = new Parse.Query(Parse.Role).find({
                success: function (results) {
                    for (i in results) {
                        //console.log(results[i]);
                        var role = results[i].attributes;
                        role['objectId'] = results[i].id;
                        role['createdAt'] = results[i].createdAt;
                        role['updatedAt'] = results[i].updatedAt;
                        self.collection.add(role);
                    }
                },
                error: function (error) {
                    notify.addError("Error: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            this.$el.append(this.template());
            var self = this;
            _(this.collection.models).each(function(role){
                self.find('table > tbody').appendRole(role);
            }, this);
        },
        appendRole: function (role) {
            this.$el.find('table > tbody').append('<tr class="' + role.attributes.name + '"></tr>');
            var roleView = new RoleView({
                model: role,
                el: this.$el.find('table > tbody > tr.' + role.attributes.name)
            });
            roleView.render();
        },
        createRole: function () {
            var roleCreateView = new RoleCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
            roleCreateView.render();
        }
    });

    return GridView;
});