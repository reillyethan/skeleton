/**
 * Created by alexander on 3/17/15.
 */
define(['backbone', 'parse', 'roles-grid-view'], function (Backbone, Parse, GridView) {
    var APP_ID = "v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe";
    var JAVASCRIPT_KEY = "F2Um4CQ8uyB52vuZe8TDHrGagXMyiM8zDgYajg20";

    Parse.initialize(APP_ID, JAVASCRIPT_KEY);
    window.fbAsyncInit = function() {
        Parse.FacebookUtils.init({ // this line replaces FB.init({
            appId      : '529681820505144', // Facebook App ID
            status     : true,  // check Facebook Login status
            cookie     : true,  // enable cookies to allow Parse to access the session
            xfbml      : true,  // initialize Facebook social plugins on the page
            version    : 'v2.2' // point to the latest Facebook Graph API version
        });
        // Run code after the Facebook SDK is loaded.
    };
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    var gridView = new GridView({'el': 'div.grid'});
    gridView.render();
});