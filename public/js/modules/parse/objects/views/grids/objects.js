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
    //'modules/parse/objects/views/forms/add-object',
    'text!modules/parse/objects/views/templates/grid.html',
    'json2',
    'bootstrap'
], function (
    $,
    Backbone,
    Parse,
    notify,
    _,
    ObjectView,
    //ObjectCreateView,
    GridTemplate) {
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        events: {
            //'click button.create-object': 'createObject'
            "change .objectClassSelector": "objectClassSelected"
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render',
                'appendObject'
                //'createObject'
            );
        },
        render: function () {
            var self = this;
            $.ajax({
                url: '/parse-objects/get-objects-list',
                success: function (data) {
                    data.push({className: 'Choose Class Name'});
                    self.$el.append(self.template({objects: data}));
                    self.$el.find('select').val('Choose Class Name');
                },
                error: function () {
                    notify.addError('Problems while getting objects list');
                }
            });

            //_(this.collection.models).each(function(object){
            //    self.find('table > tbody').appendObject(object);
            //}, this);
        },
        objectClassSelected: function () {
            var self = this;
            var selectedObjectClass = this.$el.find('select.objectClassSelector option:selected').text();
            var Object = Parse.Object.extend(selectedObjectClass);
            var ObjectCollection = Parse.Collection.extend({
                model: Object
            });
            this.collection = new ObjectCollection();
            this.collection.bind('add', this.appendObject);
            var queryObject = new Parse.Query(Object);
            queryObject.find({
                success: function(results) {
                    _.each(results, function (item) {
                        self.collection.add(item);

                    });
                },
                error: function(error) {
                    notify.addError("Error while fetching objects: " + error.code + " " + error.message);
                }
            });
        },
        appendObject: function (object) {
            this.$el.find('table > tbody').append('<tr></tr>');
            var objectView = new ObjectView({
                model: object,
                el: this.$el.find('table > tbody > tr').last()
            });
            objectView.render();
        }
        //createObject: function () {
        //    var objectCreateView = new ObjectCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
        //    objectCreateView.render();
        //}
    });
});