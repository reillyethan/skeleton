/**
 * Created by alexander on 3/26/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'modules/parse/objects/views/forms/edit-object',
    'text!modules/parse/objects/views/templates/object.html',
    'modules/parse/objects/views/forms/profile-object',
    'modules/parse/objects/views/forms/edit-acl',
    'bootstrap',
    'json2'
], function (
    Backbone,
    $,
    _,
    notify,
    ObjectEditView,
    Object,
    ObjectProfileView,
    ObjectEditACLView
    ) {
    return Backbone.View.extend({
        template: _.template(Object),
        events: {
            'click button.edit': 'edit',
            'click button.remove': 'remove',
            'click button.profile': 'profile',
            'click button.edit-acl': 'editACL'
        },
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'unrender',
                'profile',
                'edit',
                'remove'
            );
            this.model.bind('change', this.render);
            this.model.bind('remove', this.unrender);
        },
        render: function(){
            var keysArray = [];
            var valuesArray = [];
            $.map(this.model.toJSON(), function (values, keys) {
                keysArray.push(keys);
                valuesArray.push(values);
            });

            var object = this.model.toJSON();

            var createdAt = new Date();
            createdAt.setTime(Date.parse(object['createdAt']));
            var day = createdAt.getDay() + 1;
            var month = createdAt.getMonth() + 1;
            var year = createdAt.getFullYear();
            var hours = createdAt.getHours();
            var minutes = createdAt.getMinutes();
            object['createdAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

            var updatedAt = new Date();
            updatedAt.setTime(Date.parse(object['updatedAt']));
            day = updatedAt.getDay() + 1;
            month = updatedAt.getMonth() + 1;
            year = updatedAt.getFullYear();
            hours = updatedAt.getHours();
            minutes = updatedAt.getMinutes();
            object['updatedAt'] = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;

            this.$el.html(this.template({
                object: object,
                keys: keysArray,
                values: valuesArray
            }));

            return this;
        },
        unrender: function(){
            this.$el.unbind();
            this.$el.remove();
            this.model.unbind('change', this.render);
            this.model.unbind('remove', this.unrender);
        },
        edit: function(){
            var objectEditView = new ObjectEditView({
                'model': this.model,
                'el': 'div.col-lg-9'
            });
            objectEditView.render();
        },
        remove: function(){
            if (confirm('Are you sure you want to delete that?')) {
                var self = this;
                Parse.Cloud.run('deleteObject', {
                    objectClassName: self.model.className,
                    objectId: self.model.toJSON().objectId
                }, {
                    success: function() {
                        self.model.destroy();
                        notify.addSuccess('Object has been successfully deleted!');
                    },
                    error: function(error) {
                        notify.addError('Error occured while deleting object! Message: ' + error.message);
                    }
                });
            }
            return false;
        },
        profile: function () {
            this.$el.find('button.profile').addClass('disabled');
            var objectProfileView = new ObjectProfileView({
                'model': this.model,
                'el': 'div.col-lg-9'
            });
            objectProfileView.render();
        },
        editACL: function () {
            this.$el.find('button.edit-acl').addClass('disabled');
            var objectEditACLView = new ObjectEditACLView({
                'object': this.model,
                'el': 'div.col-lg-9'
            });
            objectEditACLView.render();
        }
    });
});