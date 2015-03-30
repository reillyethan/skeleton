/**
 * Created by alexander on 3/13/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/users/views/grids/elements/user',
    'modules/parse/users/collections/user',
    'modules/parse/users/views/forms/add-user',
    'text!modules/parse/users/views/templates/grid.html',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, UserView, UserCollection, UserCreateView, GridTemplate) {
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        events: {
            'click button.fb-login': 'fbLogin',
            'click button.login': 'login',
            'click button.create-user': 'createUser',
            'click button.logout': 'logout'
        },
        initialize: function(){
            _.bindAll(
                this,
                'render',
                'appendUser',
                'createUser'
            );
            var self = this;
            this.collection = new UserCollection();
            this.collection.bind('add', this.appendUser);
            var query = new Parse.Query('User');
            query.find({
                success: function(users) {
                    _.each(users, function (user) {
                        self.collection.add(user);
                    });
                },
                error: function(error) {
                    notify.addError("Error while fetching users: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            this.$el.append(this.template());
        },
        appendUser: function (user) {
            this.$el.find('table > tbody').append('<tr class="' + user.toJSON().username + '"></tr>');
            var userView = new UserView({
                grid: this,
                model: user,
                el: this.$el.find('table > tbody > tr.' + user.toJSON().username)
            });
            userView.render();
        },
        createUser: function () {
            this.$el.find('button.create-user').addClass('disabled');
            var userCreateView = new UserCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
            userCreateView.render();
        }
    });
});