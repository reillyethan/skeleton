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
    AddClassView,
    Paginator
    ) {
    var ObjectsGrid = Backbone.View.extend({
        template: _.template(GridTemplate),
        limit: 6,
        events: {
            'click button.create-object': 'createObject',
            'click button.create-new-class': 'createNewClass',
            "change .objectClassSelector": "objectClassSelected"
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendObject',
                'createObject',
                'createNewClass',
                'objectClassSelected'
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
                                                self.$el.find('select').val(self.comboboxDefaultText);
                                                self.$el.find('.objectClassSelector').bind('change', self.objectClassSelected);
                                                self.$el.find('button.create-object').bind('click', self.createObject);
                                                self.$el.find('button.create-new-class').bind('click', self.createNewClass);
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
                this.$el.html('');
                this.$el.unbind();

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
        }
    });

    Backbone.pubSub.on('createObjectsGrid', function (options) {
        console.log(options.activePage);
        new ObjectsGrid({
            el: options.el,
            limit: 4
        }).render({activePage: options.activePage, objectClass: options.objectClass});
    }, this);

    return ObjectsGrid;
});