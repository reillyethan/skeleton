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
    'helpers/paginator',
    'json2',
    'bootstrap',
    'bootstrap-datepicker'
], function (
    $,
    Backbone,
    Parse,
    notify,
    _,
    ObjectView,
    ObjectCreateView,
    GridTemplate,
    AddClassView,
    Paginator
    ) {
    var ObjectsGrid = Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.create-object': 'createObject',
            'click button.create-new-class': 'createNewClass',
            "change .objectClassSelector": "objectClassSelected",
            'click ul.dropdown-menu>li': 'selectField',
            'click button.search': 'search',
            'click input.datepicker': 'pickTheDate'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendObject',
                'createObject',
                'createNewClass',
                'objectClassSelected',
                'selectField',
                'search',
                'pickTheDate'
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
                            objects: data
                        }));
                        self.$el.find('select').val(self.comboboxDefaultText);
                    } else {
                        var limit = self.limit;
                        var activePage = 1;
                        if ("undefined" !== typeof options.activePage) {
                            activePage = parseInt(options.activePage);
                            self.activePage = activePage;
                        }
                        var offset = (activePage - 1) * limit;

                        var Object = Parse.Object.extend(options.objectClass);
                        var ObjectCollection = Parse.Collection.extend({
                            model: Object
                        });
                        self.collection = new ObjectCollection();
                        self.collection.bind('add', self.appendObject);

                        var queryObject = new Parse.Query(Object);
                        queryObject.find({
                            success: function(objects) {
                                var allObjects = objects;
                                queryObject
                                    .limit(limit)
                                    .skip(offset)
                                    .find({
                                        success: function(objects) {
                                            if (self.$el.find('table > tbody > tr').length === 0) {
                                                self.$el.append(self.template({objects: data}));
                                                self.$el.find('select').val(options.objectClass);
                                                _.each(objects, function (object) {
                                                    self.collection.add(object);
                                                });

                                                self.$el.append(new Paginator({
                                                    collection: self.collection,
                                                    objectClass: options.objectClass,
                                                    el: 'div.grid',
                                                    that: self,
                                                    limit: limit,
                                                    objects: allObjects,
                                                    activePage: activePage
                                                }).render().el);
                                            }
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
                if (this.comboboxDefaultText !== this.selectedObjectClass) {
                    if ("undefined" !== typeof self.activePage) {
                        Backbone.pubSub.trigger('objectClassSelected', {
                            objectClass: this.selectedObjectClass,
                            el: 'div.grid',
                            activePage: this.activePage,
                            that: this
                        });
                    } else {
                        Backbone.pubSub.trigger('objectClassSelected', {
                            objectClass: this.selectedObjectClass,
                            el: 'div.grid',
                            that: this
                        });
                    }
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
        selectField: function (event) {
            this.selectedField = $(event.target).text();
            if (("created" == this.selectedField || "updated" == this.selectedField ) &&
                !this.$el.find('input.search-input').hasClass('datepicker')) {
                this.$el.find('input.search-input').addClass('datepicker');
            } else if (this.$el.find('input.search-input').hasClass('datepicker')) {
                this.$el.find('input.search-input').removeClass('datepicker');
                this.$el.find('input.search-input').datepicker('remove');
            }
            if (this.$el.find('input.search-input').hasClass('shown')) {
                this.$el.find('input.search-input').removeClass('shown');
            }

            this.$el.find('button.dropdown-toggle').html(this.selectedField + ' <span class="caret"></span>');
        },
        search: function () {
            this.selectedObjectClass = this.$el.find('select.objectClassSelector option:selected').text();
            if (this.comboboxDefaultText === this.selectedObjectClass) {
                notify.addError('At first, choose class!');
                this.$el.find('button.create-object').removeClass('disabled');
            } else {
                var self = this;
                var Object = Parse.Object.extend(this.selectedObjectClass);
                var queryObject = new Parse.Query(Object);
                switch (this.selectedField) {
                    case 'objectId':
                        var objectId = this.$el.find('.search-input').val();
                        if (objectId) {
                            queryObject.get(objectId, {
                                success: function (object) {
                                    if ("undefined" !== typeof object) {
                                        self.$el.find('tbody').html('');
                                        self.appendObject(object);
                                    } else {
                                        notify.addNotice('No user found with such objectId!');
                                    }
                                }
                            });
                        }
                        break;
                    case 'created':
                        var date = this.$el.find('.search-input').val();
                        if (date) {
                            var searchDateStart = new Date(date);
                            searchDateStart.setHours(0, -searchDateStart.getTimezoneOffset(), 0, 0);
                            var dateGreater = searchDateStart.toISOString();
                            var searchDateFinish = new Date(date);
                            searchDateFinish.setHours(23, -searchDateStart.getTimezoneOffset()+59, 59, 999);
                            var dateLess = searchDateFinish.toISOString();

                            queryObject
                                .greaterThanOrEqualTo('createdAt', dateGreater)
                                .lessThanOrEqualTo('createdAt', dateLess)
                                .find({
                                    success: function(result) {
                                        if (result.length > 1) {
                                            self.$el.find('tbody').html('');
                                            _.each(result, function (object) {
                                                self.appendObject(object);
                                            });
                                        } else {
                                            notify.addNotice('No user found with such date on created!');
                                        }
                                    }
                                });
                        }
                        break;
                    case 'updated':
                        var date = this.$el.find('.search-input').val();
                        if (date) {
                            var searchDateStart = new Date(date);
                            searchDateStart.setHours(0, -searchDateStart.getTimezoneOffset(), 0, 0);
                            var dateGreater = searchDateStart.toISOString();
                            var searchDateFinish = new Date(date);
                            searchDateFinish.setHours(23, -searchDateStart.getTimezoneOffset()+59, 59, 999);
                            var dateLess = searchDateFinish.toISOString();

                            queryObject
                                .greaterThanOrEqualTo('updatedAt', dateGreater)
                                .lessThanOrEqualTo('updatedAt', dateLess)
                                .find({
                                    success: function(result) {
                                        if ("undefined" !== typeof result[0]) {
                                            self.$el.find('tbody').html('');
                                            _.each(result, function (object) {
                                                self.appendObject(object);
                                            });
                                        } else {
                                            notify.addNotice('No user found with such date on updated!');
                                        }
                                    }
                                });
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        pickTheDate: function () {
            if ($('input.datepicker').length) {
                if ($('input.datepicker').hasClass('shown')) {
                    $('input.datepicker').removeClass('shown');
                    $('input.datepicker').datepicker('hide');
                    $('input.datepicker').datepicker('remove');
                } else {
                    $('input.datepicker').datepicker('show');
                    $('input.datepicker').addClass('shown');
                }
            }
        }
    });

    Backbone.pubSub.on('createObjectsGrid', function (options) {
        new ObjectsGrid({
            el: options.el,
            limit: 4
        }).render({activePage: options.activePage, objectClass: options.objectClass});
    }, this);

    Backbone.pubSub.on('objectClassSelected', function (options) {
        var el = options.el;
        var objectClass = options.objectClass;
        var activePage = options.activePage;
        options.that.$el.remove();
        options.that.$el.unbind();
        $('div.col-lg-9').append('<div class=grid></div>');
        if ("undefined" !== typeof options.activePage) {
            new ObjectsGrid({
                el: el,
                limit: 4
            }).render({activePage: activePage, objectClass: objectClass});
        } else {
            new ObjectsGrid({
                el: el,
                limit: 4
            }).render({objectClass: objectClass});
        }
    }, this);

    return ObjectsGrid;
});
