/**
 * Created by alexander on 3/13/15.
 */
define(['backbone', 'parse'], function (Backbone, Parse) {
    return Parse.Collection.extend({
        model: Parse.User
    });
});