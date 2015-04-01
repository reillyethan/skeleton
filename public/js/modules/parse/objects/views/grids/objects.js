/**
 * Created by alexander on 3/26/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    'modules/parse/objects/views/grids/elements/object',
    'modules/parse/objects/views/forms/add-object',
    'text!modules/parse/objects/views/templates/grid.html',
    'modules/parse/objects/views/forms/add-class',
    'json2',
    'bootstrap'
], function (
    $,
    Backbone,
    Parse,
    notify,
    _,
    ObjectView,
    ObjectCreateView,
    GridTemplate,
    AddClassView
    ) {
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.create-object': 'createObject',
            'click button.create-new-class': 'createNewClass',
            "change .objectClassSelector": "objectClassSelected",
            'click li.page': 'pageChanged',
            'click li.disabled > a.disabled': 'disabled'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendObject',
                'createObject',
                'createNewClass',
                'pageChanged'
            );
            this.selectedObjectClass = null;
            this.comboboxDefaultText = 'Choose Class Name';
            this.limit = options.limit;
        },
        render: function (options) {
            var self = this;

            $.ajax({
                url: '/parse-objects/get-objects-list',
                success: function (data) {
                    data.push({className: self.comboboxDefaultText});
                    if ("undefined" === typeof options || "undefined" === typeof options.objectClass) {
                        self.$el.append(self.template({
                            objects: data,
                            status: false,
                            pages: 'none',
                            activePage: 'none',
                            previous: 'none',
                            next: 'none'
                        }));
                        self.$el.find('select').val(self.comboboxDefaultText);
                    } else {
                        var limit = self.limit;
                        var activePage = 1;
                        if ("undefined" !== typeof options.activePage) {
                            activePage = parseInt(options.activePage);
                        }
                        var offset = (activePage - 1) * limit;
                        var next = true;
                        var previous = true;
                        var pages = [];

                        var Object = Parse.Object.extend(options.objectClass);
                        var ObjectCollection = Parse.Collection.extend({
                            model: Object
                        });
                        self.collection = new ObjectCollection();
                        self.collection.bind('add', self.appendObject);
                        var queryObject = new Parse.Query(Object);
                        queryObject.find({
                            success: function(objects) {
                                if (activePage == parseInt(objects.length / limit) + 1) {next = false;}
                                if (activePage == 1) {previous = false;}
                                if (parseInt(objects.length / limit) + 1 >= 5) {
                                    if (activePage >= 3) {
                                        if (false === next) {
                                            for (var i = activePage - 4; i <= activePage; i++) {
                                                if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});}
                                            }
                                        } else if (activePage + 1 == parseInt(objects.length / limit) + 1) {
                                            for (var i = activePage - 3; i <= activePage + 1; i++) {
                                                if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});}
                                            }
                                        } else {
                                            for (var i = activePage - 2; i <= activePage + 2; i++) {
                                                if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});}
                                            }
                                        }
                                    }
                                    if (activePage == 2) {
                                        for (var i = activePage - 1; i <= activePage + 3; i++) {
                                            if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});}
                                        }
                                    }
                                    if (activePage != 2 && activePage < 3) {
                                        for (var i = activePage; i <= activePage + 4; i++) {
                                            if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});}
                                        }
                                    }
                                } else {
                                    for (var i = 1; i <= parseInt(objects.length / limit) + 1; i++) {
                                        if (activePage === i) {pages.push({number: i});} else {pages.push({number: i});
                                        }
                                    }
                                }

                                queryObject
                                    .limit(limit)
                                    .skip(offset)
                                    .find({
                                        success: function(objects) {
                                            self.$el.append(self.template({
                                                status: true,
                                                objects: data,
                                                pages: pages,
                                                activePage: activePage,
                                                previous: previous,
                                                next: next
                                            }));
                                            _.each(objects, function (object) {
                                                self.collection.add(object);
                                            });
                                            self.$el.find('select').val(self.comboboxDefaultText);
                                        },
                                        error: function(error) {
                                            notify.addError("Error while fetching page: " + error.code + " " + error.message);
                                        }
                                    });
                            },
                            error: function(error) {
                                notify.addError("Error while fetching objects: " + error.code + " " + error.message);
                            }
                        });
                    }
                },
                error: function () {
                    notify.addError('Problems while getting objects list');
                }
            });
        },
        objectClassSelected: function () {
            if ("undefined" !== typeof this.$el.find('table tbody > tr')) {
                this.selectedObjectClass = this.$el.find('select.objectClassSelector option:selected').text();
                this.$el.html('');
                if (this.comboboxDefaultText !== this.selectedObjectClass) {
                    this.render({objectClass: this.selectedObjectClass});
                }
            }
        },
        appendObject: function (object) {
            this.$el.find('table > tbody').append('<tr></tr>');
            var objectView = new ObjectView({
                model: object,
                el: this.$el.find('table > tbody > tr').last()
            });
            objectView.render();
        },
        createObject: function () {
            this.$el.find('button.create-object').addClass('disabled');
            if (null === this.selectedObjectClass) {
                notify.addError('At first, choose class!');
                this.$el.find('button.create-object').removeClass('disabled');
            } else {
                var objectCreateView = new ObjectCreateView({
                    'objectClassName': this.selectedObjectClass,
                    'collection': this.collection,
                    'el': 'div.col-lg-9'
                });
                objectCreateView.render();
            }
        },
        createNewClass: function () {
            this.$el.find('button.create-new-class').addClass('disabled');

            var addClassView = new AddClassView({
                'objectClassName': this.selectedObjectClass,
                'that': this,
                'el': 'div.col-lg-9'
            });
            addClassView.render();
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
                this.render({activePage: targetPage, objectClass: this.selectedObjectClass});
            }
        },
        disabled: function () {
            return false;
        }
    });
});