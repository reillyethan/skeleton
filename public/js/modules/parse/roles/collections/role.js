/**
 * Created by alexander on 3/17/15.
 */
define(['backbone', 'parse'], function (Backbone, Parse) {
    return Backbone.Collection.extend({
        model: Parse.Role
    });
});