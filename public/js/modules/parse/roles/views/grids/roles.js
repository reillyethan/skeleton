/**
 * Created by alexander on 3/17/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/roles/views/grids/elements/role',
    'modules/parse/roles/collections/role',
    'modules/parse/roles/views/forms/add-role',
    'text!modules/parse/roles/views/templates/grid.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, RoleView, RoleCollection, RoleCreateView, GridTemplate) {
    return Backbone.View.extend({
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

            Parse.Cloud.run('getRoles', {}, {
                success: function(results) {
                    for (i in results) {
                        self.collection.add(results[i]);
                    }
                },
                error: function(error) {
                    notify.addError('Error occured while adding a child user to a role! Message: ' + error.message);
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
            //var name = role.toJSON().name.replace(/\s+/g, '');
            this.$el.find('table > tbody').append('<tr class="' + role.toJSON().name.replace(/\s+/g, '') + '"></tr>');
            var roleView = new RoleView({
                model: role,
                el: this.$el.find('table > tbody > tr.' + role.toJSON().name.replace(/\s+/g, ''))
            });
            roleView.render();
        },
        createRole: function () {
            this.$el.find('button.create').addClass('disabled');
            var roleCreateView = new RoleCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
            roleCreateView.render();
        }
    });
});