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
            this.model.bind('remove', this.unrender);
            this.user = options.user;
        },
        render: function(){
            this.$el.html(this.template({
                role: this.model
            }));

            return this;
        },
        unrender: function(){
            this.$el.remove();
            this.model.unbind('remove', this.unrender);
            this.$el.unbind();
        },
        remove: function(){
            if (confirm('Are you sure you want to delete that?')) {
                var self = this;
                Parse.Cloud.run(
                    'deleteChildUser',
                    {
                        parentName: self.model.toJSON().name,
                        childUsername: self.user.toJSON().username
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