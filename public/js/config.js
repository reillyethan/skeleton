/**
 * Configuration example
 * @author Anton Shevchuk
 */
/*global define,require*/
require.config({
    // why not simple "js"? Because IE eating our minds!
    baseUrl: '/js',
    // if you need disable JS cache
    //urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        "bootstrap": './bootstrap',
        "jquery": './vendor/jquery',
        "jquery-ui": './vendor/jquery-ui',
        "redactor": './../redactor/redactor',
        "redactor.imagemanager": './../redactor/plugins/imagemanager',
        // see more at https://cdnjs.com/
        "underscore": '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min',
        "backbone": '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        "json2": '//ajax.cdnjs.com/ajax/libs/json2/20110223/json2',
        //"parse": '//parse.com/downloads/javascript/parse-1.3.5.min',
        "parse": './parse-1.3.5',
        "tutorial": './tutorial',
        "users-grid-view": './modules/parse/users/views/grid-view',
        "user-view": './modules/parse/users/views/user-view',
        "user-edit-view": './modules/parse/users/views/user-edit-view',
        "user-create-view": './modules/parse/users/views/user-create-view',
        "user-reset-password-view": './modules/parse/users/views/user-reset-password-view',
        "user-collection": './modules/parse/users/collections/user-collection',
        "users":'./modules/parse/users',
        "roles": './modules/parse/roles',
        "roles-grid-view": './modules/parse/roles/views/grid-view',
        "role-view": './modules/parse/roles/views/role-view',
        "role-collection": './modules/parse/roles/collections/role-collection',
        "role-create-view": './modules/parse/roles/views/role-create-view',
        "grid-child-roles-view": './modules/parse/roles/views/grid-child-roles-view',
        "child-role-view": './modules/parse/roles/views/child-role-view',
        "grid-child-users-view": './modules/parse/roles/views/grid-child-users-view',
        "child-user-view": './modules/parse/roles/views/child-user-view',
        "child-user-add-view": './modules/parse/roles/views/child-user-add-view',
        "child-role-add-view": './modules/parse/roles/views/child-role-add-view'
    },
    shim: {
        "bootstrap": {
            deps: ['jquery'],
            exports: '$.fn.popover'
        },
        "redactor": {
            deps: ['jquery'],
            exports: '$.fn.redactor'
        },
        "redactor.imagemanager": {
            deps: ['redactor', 'jquery'],
            exports: 'RedactorPlugins'
        },
        "jquery-ui": {
            deps: ['jquery'],
            exports: '$.ui'
        },
        "json2": {
            exports: 'JSON'
        },
        "parse": {
            deps: ['backbone'],
            exports: 'Parse'
        }
    },
    enforceDefine: true
});

require(['bluz', 'bluz.ajax', 'bootstrap']);