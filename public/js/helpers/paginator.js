/**
 * Created by alexander on 4/1/15.
 */
define([
    'backbone',
    'jquery',
    'underscore',
    'bluz.notify',
    'text!helpers/templates/paginator.html',
    'bootstrap',
    'json2'
], function (Backbone, $, _, notify, PaginatorTemplate) {
    return Backbone.View.extend({
        template: _.template(PaginatorTemplate),
        events: {
            'click li.page': 'pageChanged',
            'click li.disabled > a.disabled': 'disabled'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'unrender',
                'pageChanged'
            );

            this.collection = options.collection;
            this.that = options.that;
            this.objects = options.objects;
            this.limit = options.limit;
            this.activePage = options.activePage;

            if ("undefined" !== typeof options.objectClass) {
                this.objectClass = options.objectClass;
            }
        },
        render: function(){
            var next = true;
            var previous = true;
            var pages = [];

            if (this.activePage == parseInt(this.objects.length / this.limit) + 1) {
                next = false;
            }
            if (this.activePage == 1) {
                previous = false;
            }
            if (parseInt(this.objects.length / this.limit) + 1 >= 5) {
                if (this.activePage >= 3) {
                    if (false === next) {
                        for (var i = this.activePage - 4; i <= this.activePage; i++) {
                            if (this.activePage === i) {
                                pages.push({
                                    number: i
                                });
                            } else {
                                pages.push({
                                    number: i
                                });
                            }
                        }
                    } else if (this.activePage + 1 == parseInt(this.objects.length / this.limit) + 1) {
                        for (var i = this.activePage - 3; i <= this.activePage + 1; i++) {
                            if (this.activePage === i) {
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
                        for (var i = this.activePage - 2; i <= this.activePage + 2; i++) {
                            if (this.activePage === i) {
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
                if (this.activePage == 2) {
                    for (var i = this.activePage - 1; i <= this.activePage + 3; i++) {
                        if (this.activePage === i) {
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
                if (this.activePage != 2 && this.activePage < 3) {
                    for (var i = this.activePage; i <= this.activePage + 4; i++) {
                        if (this.activePage === i) {
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
                for (var i = 1; i <= parseInt(this.objects.length / this.limit) + 1; i++) {
                    if (this.activePage === i) {
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
            this.$el.append(this.template({
                pages: pages,
                activePage: this.activePage,
                previous: previous,
                next: next
            }));

            return this;
        },
        unrender: function(options){
            this.$el.html('');
            this.$el.unbind();
            if ("undefined" === typeof this.objectClass) {
                this.that.render({activePage: options.activePage});
            } else {
                this.that.render({activePage: options.activePage, objectClass: this.objectClass});
            }
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
                this.unrender({activePage: targetPage});
            }
        },
        disabled: function () {
            return false;
        }
    });
});