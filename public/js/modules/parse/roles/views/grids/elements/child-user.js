/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/child-user.html',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, ChildUser) {
    return Backbone.View.extend({
        template: _.template(ChildUser),
        events: {
            'click button.remove': 'remove'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'remove'
            );
            this.parentRole = options.parentRole;
            this.model.bind('remove', this.unrender);
        },
        render: function(){
            this.$el.html(this.template({
                user: this.model.attributes
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
        },
        remove: function(){
            var self = this;
            var query = new Parse.Query(Parse.Role).equalTo('name', this.parentRole.attributes.name).find({
                success: function(result) {
                    var parentRole = result[0];
                    var query = new Parse.Query(Parse.User).equalTo('username', self.model.attributes.username).find({
                        success: function (result) {
                            parentRole.getUsers().remove(result[0]);
                            parentRole.save();
                            self.unrender();
                            notify.addSuccess('Child user removed!');
                        }
                    });
                }
            });
        }
    });
});