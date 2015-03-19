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
], function (Backbone, $, _, notify, ChildRole) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var APP_ID = "v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe";
    var REST_KEY = "FjGzHv8sQKjY9FH32Y4PFdEuwgFjWq03xm1i8Cc2";

    var ChildRoleView = Backbone.View.extend({
        template: _.template(ChildRole),
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'unrender'
            );
            this.model.bind('remove', this.unrender);
        },
        render: function(){
            this.$el.html(this.template({
                role: this.model.attributes
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
        }
    });

    return ChildRoleView;
});