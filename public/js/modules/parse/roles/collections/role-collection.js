/**
 * Created by alexander on 3/17/15.
 */
define(['backbone', 'parse'], function (Backbone, Parse) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var RoleCollection = Backbone.Collection.extend({
        model: Parse.Role
    });

    return RoleCollection;
});