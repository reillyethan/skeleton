/**
 * Created by alexander on 3/31/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!modules/parse/objects/views/templates/user-or-role.html',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, UserOrRoleView) {
    return Backbone.View.extend({
        template: _.template(UserOrRoleView),
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
            this.object = options.object;
            this.grid = options.grid;
            this.userCollection = options.userCollection;
            this.roleCollection = options.roleCollection;
        },
        render: function(){
            var self = this;
            var object = self.model.toJSON();
            _.each(this.object.getACL().toJSON(),function (roleOrUser, index) {
                if (index === self.model.toJSON().objectId || ("undefined" !== typeof self.model.toJSON().name && index.split(":")[1] === self.model.toJSON().name)) {
                    var access = "";
                    if (true === roleOrUser.read) {
                        access += "read ";
                    }
                    if (true === roleOrUser.write) {
                        access += "write";
                    }

                    object['access'] = access;
                }
            });
            this.$el.html(this.template({
                roleOrUser: object
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
                if ('_Role' === self.model.className) {
                    Parse.Cloud.run(
                        'deleteRoleFromACL',
                        {
                            parentObjectClassName: self.object.className,
                            parentObjectId: self.object.toJSON().objectId,
                            roleId: self.model.toJSON().objectId
                        },
                        {
                            success: function() {
                                self.model.destroy();
                                notify.addSuccess('Removed!');
                            },
                            error: function(error) {
                                notify.addError('Error occured while deleting! Message: ' + error.message);
                            }
                        }
                    );
                } else {
                    Parse.Cloud.run(
                        'deleteUserFromACL',
                        {
                            parentObjectClassName: self.object.className,
                            parentObjectId: self.object.toJSON().objectId,
                            userId: self.model.toJSON().objectId
                        },
                        {
                            success: function() {
                                self.model.destroy();
                                notify.addSuccess('Removed!');
                            },
                            error: function(error) {
                                notify.addError('Error occured while deleting! Message: ' + error.message);
                            }
                        }
                    );
                }

            }
            return false;
        }
    });
});