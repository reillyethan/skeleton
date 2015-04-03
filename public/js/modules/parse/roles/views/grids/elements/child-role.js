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
                role: this.model,
                roleId: this.model.toJSON().objectId
            }));
            return this;
        },
        unrender: function(){
            this.parentRole.remove();
            this.model.unbind('remove', this.unrender);
            this.$el.remove();
            this.$el.unbind();
        },
        remove: function(){
            if (confirm('Are you sure you want to delete this child role?')) {
                var self = this;
                Parse.Cloud.run(
                    'deleteChildRole',
                    {
                        parentName: self.parentRole.attributes.name,
                        childName: self.model.attributes.name
                    },
                    {
                        success: function() {
                            self.unrender();
                            notify.addSuccess('Child role removed!');
                        },
                        error: function(error) {
                            notify.addError('Error occured while deleting a child role role! Message: ' + error.message);
                        }
                    }
                );
            }
            return false;
        }
    });
});