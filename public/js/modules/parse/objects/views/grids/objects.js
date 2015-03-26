/**
 * Created by alexander on 3/26/15.
 */
define([
    'jquery',
    'backbone',
    'parse',
    'bluz.notify',
    'underscore',
    //'modules/parse/objects/views/grids/elements/object',
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
    //ObjectView,
    //ObjectCreateView,
    GridTemplate) {
    return Backbone.View.extend({
        template: _.template(GridTemplate),
        events: {
            //'click button.create-object': 'createObject'
        },
        initialize: function(options){
            _.bindAll(
                this,
                'render'
                //'appendObject',
                //'createObject'
            );
            var self = this;
            this.objectClassName = options.objectClassName;

            var Object = Parse.Object.extend(this.objectClassName);

            var ObjectCollection = Backbone.Collection.extend({
                model: Object
            });
            this.collection = new ObjectCollection();
            //this.collection.bind('add', this.appendObject);

            var queryObject = new Parse.Query(Object);
            queryObject.find({
                success: function(results) {
                    for (i in results) {
                        self.collection.add(results[i]);
                    }
                    console.log(self.collection);
                },
                error: function(myObject, error) {
                    notify.addError("Error while fetching objects: " + error.code + " " + error.message);
                }
            });
        },
        render: function () {
            this.$el.append(this.template());
            var self = this;
            //_(this.collection.models).each(function(object){
            //    self.find('table > tbody').appendObject(object);
            //}, this);
        }
        //appendObject: function (object) {
        //    this.$el.find('table > tbody').append('<tr></tr>');
        //    var objectView = new ObjectView({
        //        grid: this,
        //        model: object,
        //        el: this.$el.find('table > tbody > tr').last()
        //    });
        //    objectView.render();
        //},
        //createObject: function () {
        //    var objectCreateView = new ObjectCreateView({'collection': this.collection, 'el': 'div.col-lg-9'});
        //    objectCreateView.render();
        //}
    });
});