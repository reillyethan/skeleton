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
    'modules/parse/users/views/forms/login-user',
    'json2',
    'bootstrap'
], function ($, Backbone, Parse, notify, _, UserView, UserCollection, UserCreateView, GridTemplate, UserLoginView) {
    var UsersGridView = Backbone.View.extend({
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
                'fbLogin',
                'login',
                'createUser',
                'logout',
                'updateCurrentUser'
            );
            var self = this;
            this.collection = new UserCollection();
            this.collection.bind('add', this.appendUser);
            var query = new Parse.Query('User');
            query.find({
                success: function(results) {
                    for (i in results) {
                        var user = results[i].attributes;
                        user['objectId'] = results[i].id;
                        user['createdAt'] = results[i].createdAt;
                        user['updatedAt'] = results[i].updatedAt;

                        self.collection.add(user);
                    }
                },
                error: function(myObject, error) {
                    notify.addError("Error while fetching users: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            this.$el.append(this.template());
            this.updateCurrentUser();
            var self = this;
            _(this.collection.models).each(function(user){
                self.find('table > tbody').appendUser(user);
            }, this);
        },
        appendUser: function (user) {
            this.$el.find('table > tbody').append('<tr class="' + user.attributes.username + '"></tr>');
            var userView = new UserView({
                grid: this,
                model: user,
                el: this.$el.find('table > tbody > tr.' + user.attributes.username)
            });
            userView.render();
        },
        createUser: function () {
            var userCreateView = new UserCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
            userCreateView.render();
        },
        fbLogin: function () {
            var currentUser = Parse.User.current();
            if (currentUser) {
                notify.addError('You are already logged in!');
            } else {
                Parse.FacebookUtils.logIn(null, {
                    success: function(user) {
                        updateCurrentUser();
                        if (!user.existed()) {
                            notify.addSuccess("User signed up and logged in through Facebook!");
                        } else {
                            notify.addSuccess("User logged in through Facebook!");
                        }
                    },
                    error: function(user, error) {
                        notify.addError("User cancelled the Facebook login or did not fully authorize. Message: " + error.message);
                    }
                });
            }
        },
        login: function () {
            var currentUser = Parse.User.current();
            if (currentUser) {
                notify.addError('You are already logged in!');
            } else {
                var userLogin = new UserLoginView({'usersGridView': this,'el': 'div.col-lg-9'});
                userLogin.render();
            }
        },
        logout: function () {
            var currentUser = Parse.User.current();
            if (currentUser) {
                Parse.User.logOut();
                this.updateCurrentUser();
            }
        },
        updateCurrentUser: function () {
            var currentUser = Parse.User.current();
            if (currentUser) {
                this.$el.find('dl > dd.current-user').text(currentUser.attributes.username);
            } else {
                this.$el.find('dl > dd.current-user').text('You are not logged in!');
            }
        }
    });

    return UsersGridView;
});