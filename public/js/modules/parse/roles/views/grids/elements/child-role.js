/**
 * Created by alexander on 3/17/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/roles/views/templates/child-role.html',
    'modules/parse/roles/views/grids/child-users',
    'bootstrap',
    'json2'
], function (
    Backbone,
    $,
    _,
    notify,
    ChildRole,
    GridChildUsersView
    ) {
    return Backbone.View.extend({
        template: _.template(ChildRole),
        events: {
            'click button.remove': 'remove',
            'click button.showChildRoles': 'showChildRoles',
            'click button.showChildUsers': 'showChildUsers'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'remove',
                'showChildRoles'
            );
            this.parentRole = options.parentRole;
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
        },
        remove: function(){
            if (confirm('Are you sure you want to delete that?')) {
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
        },
        showChildRoles: function () {
            Backbone.pubSub.trigger('buttonShowChildRolesClicked', {'model': this.model, 'el': 'div.col-lg-9'});
        },
        showChildUsers: function () {
            var gridChildUsersView = new GridChildUsersView({'model': this.model, 'el': 'div.col-lg-9'});
            gridChildUsersView.render();
        }
    });
});