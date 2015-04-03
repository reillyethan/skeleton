/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/child-role.html',
    'bootstrap',
    'json2'
], function (
    Backbone,
    $,
    _,
    notify,
    ChildRole
    ) {
    return Backbone.View.extend({
        template: _.template(ChildRole),
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'unrender'
            );
        },
        render: function(){
            this.$el.append(this.template({
                role: this.model.toJSON()
            }));
            return this;
        },
        unrender: function(){
            this.$el.remove();
            this.$el.unbind();
        }
    });
});