/**
 * Created by alexander on 3/13/15.
 */
define(['backbone', 'parse'], function (Backbone, Parse) {
    Backbone.sync = function(method, model, success, error){
        success();
    }

    var UserCollection = Backbone.Collection.extend({
        model: Parse.User
    });

    return UserCollection;
});