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
    'helpers/event-manager',
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
    GridTemplate
    ) {
    var UsersGrid = Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.create-user': 'createUser',
            'click ul.dropdown-menu>li': 'selectField',
            'click button.search': 'search'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendUser',
                'createUser',
                'selectField',
                'search'
            );
            this.selectedField = 'Fields';
            this.limit = options.limit;
            this.collection = new UserCollection();
            this.collection.bind('add', this.appendUser);
        },
        unrender: function () {
            //this.$el.unbind();
            //this.$el.remove();
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

                                Backbone.pubSub.trigger('createPaginator', {
                                    collection: self.collection,
                                    el: 'div.grid',
                                    that: self,
                                    limit: limit,
                                    objects: allUsers,
                                    activePage: activePage
                                });
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
        },
        selectField: function (event) {
            this.selectedField = $(event.target).text();
            if ("created" == this.selectedField && !this.$el.find('input.search-input').hasClass('datepicker')) {
                this.$el.find('input.search-input').addClass('datepicker');
            } else if (this.$el.find('input.search-input').hasClass('datepicker')) {
                this.$el.find('input.search-input').removeClass('datepicker')
            }
            
            this.$el.find('button.dropdown-toggle').html(this.selectedField + ' <span class="caret"></span>');
        },
        search: function () {
            var self = this;
            var query = new Parse.Query(Parse.User);
            switch (this.selectedField) {
                case 'username':
                    var username = this.$el.find('.search-input').val();
                    if (username) {
                        query.equalTo('username', username).find({
                            success: function(result) {
                                var user = result[0];
                                if ("undefined" !== typeof user) {
                                    self.$el.find('tbody').html('');
                                    self.appendUser(user);
                                } else {
                                    notify.addNotice('No user found with such username!');
                                }
                            }
                        });
                    }
                    break;
                case 'email':
                    var email= this.$el.find('.search-input').val();
                    if (email) {
                        query.equalTo('email', email).find({
                            success: function(result) {
                                var user = result[0];
                                if ("undefined" !== typeof user) {
                                    self.$el.find('tbody').html('');
                                    self.appendUser(user);
                                } else {
                                    notify.addNotice('No user found with such username!');
                                }
                            }
                        });
                    }
                    break;
                case 'objectId':
                    var objectId= this.$el.find('.search-input').val();
                    if (objectId) {
                        query.get(objectId, {
                            success: function(user) {
                                if ("undefined" !== typeof user) {
                                    self.$el.find('tbody').html('');
                                    self.appendUser(user);
                                } else {
                                    notify.addNotice('No user found with such objectId!');
                                }
                            }
                        });
                    }
                    break;
                case 'created':
                    break;
                default:
                    break;
            }
        }
    });

    Backbone.pubSub.on('createUsersGrid', function (options) {
        new UsersGrid({
            el: options.el,
            limit: 4
        }).render({activePage: options.activePage});
    }, this);

    return UsersGrid;
});