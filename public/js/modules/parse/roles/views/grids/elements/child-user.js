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
            if (confirm('Are you sure you want to delete that?')) {
                var self = this;
                Parse.Cloud.run(
                    'deleteChildUser',
                    {
                        parentName: self.parentRole.attributes.name,
                        childUsername: self.model.attributes.username
                    },
                    {
                        success: function() {
                            self.unrender();
                            notify.addSuccess('Child user removed!');
                        },
                        error: function(error) {
                            notify.addError('Error occured while deleting a child user from role! Message: ' + error.message);
                        }
                    }
                );
            }
            return false;
        }
    });
});