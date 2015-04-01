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
    'helpers/paginator',
    'json2',
    'bootstrap'
], function (
    $,
    Backbone,
    Parse,
    notify,
    _,
    UserView,
    UserCollection,
    UserCreateView,
    GridTemplate,
    Paginator
    ) {
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.fb-login': 'fbLogin',
            'click button.login': 'login',
            'click button.create-user': 'createUser',
            'click button.logout': 'logout'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendUser',
                'createUser'
            );
            this.limit = options.limit;
            this.collection = new UserCollection();
            this.collection.bind('add', this.appendUser);
        },
        render: function (options) {
            var self = this;
            var query = new Parse.Query('User');
            query.find({
                success: function (users) {
                    var allUsers = users;

                    var limit = self.limit;
                    var activePage = 1;
                    if ("undefined" !== typeof options && "undefined" !== typeof options.activePage) {
                        activePage = parseInt(options.activePage);
                    }
                    var offset = (activePage - 1) * limit;
                    query
                        .limit(limit)
                        .skip(offset)
                        .find({
                            success: function(users) {
                                self.$el.append(self.template());
                                _.each(users, function (user) {
                                    self.collection.add(user);
                                });
                                self.$el.append(new Paginator({
                                    collection: self.collection,
                                    el: 'div.grid',
                                    that: self,
                                    limit: limit,
                                    objects: allUsers,
                                    activePage: activePage
                                }).render().el);
                            },
                            error: function(error) {
                                notify.addError("Error while fetching page: " + error.code + " " + error.message);
                            }
                        });
                },
                error: function (error) {
                    notify.addError("Error while fetching users: " + error.code + " " + error.message);
                }
            });
        },
        appendUser: function (user) {
            this.$el.find('table > tbody').append('<tr class="' + user.toJSON().username.replace(/\s+/g, '') + '"></tr>');
            var userView = new UserView({
                grid: this,
                model: user,
                el: this.$el.find('table > tbody > tr.' + user.toJSON().username.replace(/\s+/g, ''))
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