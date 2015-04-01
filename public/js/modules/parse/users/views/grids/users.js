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
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.fb-login': 'fbLogin',
            'click button.login': 'login',
            'click button.create-user': 'createUser',
            'click button.logout': 'logout',
            'click li.page': 'pageChanged',
            'click li.disabled > a.disabled': 'disabled'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendUser',
                'createUser',
                'pageChanged'
            );
            this.limit = options.limit;

            this.collection = new UserCollection();
            this.collection.bind('add', this.appendUser);
        },
        render: function (options) {
            var limit = this.limit;
            var activePage = 1;
            if ("undefined" !== typeof options && "undefined" !== typeof options.activePage) {
                activePage = parseInt(options.activePage);
            }
            var offset = (activePage - 1) * limit;

            var next = true;
            var previous = true;

            var self = this;
            var pages = [];
            var query = new Parse.Query('User');
            query
                .find({
                    success: function (users) {
                        if (activePage == parseInt(users.length / limit) + 1) {
                            next = false;
                        }
                        if (activePage == 1) {
                            previous = false;
                        }
                        if (parseInt(users.length / limit) + 1 >= 5) {
                            if (activePage >= 3) {
                                if (false === next) {
                                    for (var i = activePage - 4; i <= activePage; i++) {
                                        if (activePage === i) {
                                            pages.push({
                                                number: i
                                            });
                                        } else {
                                            pages.push({
                                                number: i
                                            });
                                        }
                                    }
                                } else if (activePage + 1 == parseInt(users.length / limit) + 1) {
                                    for (var i = activePage - 3; i <= activePage + 1; i++) {
                                        if (activePage === i) {
                                            pages.push({
                                                number: i
                                            });
                                        } else {
                                            pages.push({
                                                number: i
                                            });
                                        }
                                    }
                                } else {
                                    for (var i = activePage - 2; i <= activePage + 2; i++) {
                                        if (activePage === i) {
                                            pages.push({
                                                number: i
                                            });
                                        } else {
                                            pages.push({
                                                number: i
                                            });
                                        }
                                    }
                                }
                            }
                            if (activePage == 2) {
                                for (var i = activePage - 1; i <= activePage + 3; i++) {
                                    if (activePage === i) {
                                        pages.push({
                                            number: i
                                        });
                                    } else {
                                        pages.push({
                                            number: i
                                        });
                                    }
                                }
                            }
                            if (activePage != 2 && activePage < 3) {
                                for (var i = activePage; i <= activePage + 4; i++) {
                                    if (activePage === i) {
                                        pages.push({
                                            number: i
                                        });
                                    } else {
                                        pages.push({
                                            number: i
                                        });
                                    }
                                }
                            }
                        } else {
                            for (var i = 1; i <= parseInt(users.length / limit) + 1; i++) {
                                if (activePage === i) {
                                    pages.push({
                                        number: i
                                    });
                                } else {
                                    pages.push({
                                        number: i
                                    });
                                }
                            }
                        }

                        query
                            .limit(limit)
                            .skip(offset)
                            .find({
                                success: function(users) {
                                    self.$el.append(self.template({
                                        pages: pages,
                                        activePage: activePage,
                                        previous: previous,
                                        next: next
                                    }));
                                    _.each(users, function (user) {
                                        self.collection.add(user);
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
        },
        pageChanged: function (event) {
            var targetPage = this.$el.find(event.target).text();
            var currentPage = parseInt(this.$el.find('li.active > a').text());
            var targetElement = this.$el.find(event.currentTarget);

            if (targetElement.hasClass('previous')) {
                targetPage = currentPage - 1;
            }
            if (targetElement.hasClass('next')) {
                targetPage = currentPage + 1;
            }

            if (!targetElement.hasClass('active')) {
                this.collection.reset();
                this.$el.find('div.grid ul > li.active').removeClass('active');
                this.$el.html('');
                this.render({activePage: targetPage});
            }
        },
        disabled: function () {
            return false;
        }
    });
});