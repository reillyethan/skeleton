/**
 * Created by alexander on 3/26/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/users/views/templates/user-role.html',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, UserRoleView) {
    return Backbone.View.extend({
        template: _.template(UserRoleView),
        initialize: function(options){
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