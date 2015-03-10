/**
 * Created by alexander on 3/5/15.
 */
define(['jquery', 'backbone', 'parse', 'bluz.notify', 'json2', 'bootstrap'], function ($, Backbone, Parse, notify) {
    Parse.initialize("v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe", "F2Um4CQ8uyB52vuZe8TDHrGagXMyiM8zDgYajg20");
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

    var body = $('body');

    //FETCHING ALL USERS
    fetchUsers();
    //UPDATING CURRENT USER
    updateCurrentUser();

    function fetchUsers() {
        if ($('.grid>table>tbody>tr>td').length) {
            $('.grid>table>tbody>tr').remove();
        }

        var query = new Parse.Query('User');
        query.find({
            success: function(results) {
                for (i in results) {
                    keysArray = [];
                    valuesArray = [];
                    $.map(results[i].attributes, function (values, keys) {
                        keysArray.push(keys);
                        valuesArray.push(values);
                    });

                    var authData = '';
                    if (results[i].attributes['authData'] != undefined) {
                        authData = results[i].attributes['authData'];
                    }

                    $('.grid>table>tbody').append('<tr></tr>');
                    var currentRow = $('.grid>table>tbody>tr');
                    currentRow.last().append('<td class="authData">'+ authData +'</td>');
                    currentRow.last().append('<td class="email">'+ results[i].attributes['email'] +'</td>');
                    currentRow.last().append('<td class="username">'+ results[i].attributes['username'] +'</td>');

                    var dl = '<td class="other"><dl>';
                    for (var j=0; j<keysArray.length; j++) {
                        if (keysArray[j] != 'authData' &&
                            keysArray[j] != 'username' &&
                            keysArray[j] != 'email') {
                                dl += '<dt>' + keysArray[j] + '</dt><dd>' + valuesArray[j] + '</dd>';
                        }
                    }
                    currentRow.last().append(dl + '</dl></td>');
                    currentRow.last().append('<td class="blank"><div class="btn-group btn-group-xs" role="group"><button type="button" class="edit-user btn btn-primary btn-xs"><i class="fa fa-pencil"></i></button><button type="button" class="reset-password btn btn-default btn-xs"><i class="fa fa-lock"></i></button><button type="button" class="delete-user btn btn-danger btn-xs"><i class="fa fa-remove"></i></button></div></td>');

                }
            },
            error: function(myObject, error) {
                notify.addError("Error while fetching users: " + error.code + " " + error.message);
            }
        });
    }


    //CREATING USER
    var fieldsCounter = 0;
    body.on('click', '.more-fields-button', function(){
        fieldsCounter++;

        if (fieldsCounter > 0) {
            if (!$('.less-fields-button').length) {
                $(this).closest('ul.list-group').find('div.row').append('<div class="col-sm-1 col-sm-offset-2"><button class="less-fields-button btn btn-xs btn-warning" type="button">Less fields</button></div>');
            }
        }

        $(this).closest('ul.list-group').find('li.list-group-item').first().clone().appendTo($(this).closest('ul.list-group'));
        $(this).closest('div.row').appendTo($(this).closest('ul.list-group'));
    });

    body.on('click', '.less-fields-button', function () {
        fieldsCounter--;

        $(this).closest('ul.list-group').find('li.list-group-item').last().remove();

        if (fieldsCounter == 0) {
            $(this).remove();
        }
    });

    body.on('click', '.create-user-button-submit', function(){
        var username = $('input.username').val();
        var password = $('input.password').val();
        var email = $('input.email').val();

        var customFields = [];
        $('div.add-fields-form>ul>li').each(function (counter, element) {
            var key = $(element).find('div.form-group>input.key').val();
            var value = $(element).find('div.form-group>input.value').val();
            if (key && value) {
                customFields.push({
                    key: key,
                    value: value
                });
            }
        });

        if (username && password && email) {
            var user = new Parse.User();
            user.set("username", username);
            user.set("password", password);
            user.set("email", email);

            // other fields can be set just like with Parse.Object
            customFields.forEach(function (field) {
                user.set(field.key, field.value);
            });

            user.signUp(null, {
                success: function(user) {
                    $('input.username').val('');
                    $('input.password').val('');
                    $('input.email').val('');
                    $('div.add-fields-form>ul>li').each(function (counter, element) {
                        $(element).find('div.form-group>input.key').val('');
                        $(element).find('div.form-group>input.value').val('');
                    });
                    fetchUsers();
                    updateCurrentUser();
                    notify.addSuccess('User ' + username + ' is successfully created');
                },
                error: function(user, error) {
                    notify.addError("Error: " + error.code + " " + error.message);
                }
            });
        }
    });

    body.on('click', 'button.login-user-submit', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            notify.addError('You are already logged in!');
        } else {
            login(
                $('input.log-in-username').val(),
                $('input.log-in-password').val()
            );
        }
    });

    body.on('click', 'button.login-user-facebook', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            notify.addError('You are already logged in!');
        } else {
            Parse.FacebookUtils.logIn(null, {
                success: function(user) {
                    updateCurrentUser();
                    fetchUsers();
                    if (!user.existed()) {
                        notify.addSuccess("User signed up and logged in through Facebook!");
                    } else {
                        notify.addSuccess("User logged in through Facebook!");
                    }
                },
                error: function(user, error) {
                    notify.addError("User cancelled the Facebook login or did not fully authorize.");
                }
            });
        }
    });

    body.on('click', 'button.logout-user', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            logout();
            updateCurrentUser();
            notify.addSuccess('You are successfully logged out!');
        } else {
            notify.addError('You are already logged out!');
        }
    });

    body.on('click', 'button.edit-user', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if ($(this).closest('td').prev('td').prev("td.username:contains('" + currentUser.attributes.username + "')").length) {
                $('div.modal').find('h4.modal-title').text('Edit user');
                $('div.modal').find('button.submit').addClass('edit-user-submit');
                var keysArray = [];
                var valuesArray = [];
                $.map(currentUser.attributes, function(values, keys){
                    keysArray.push(keys);
                    valuesArray.push(values);
                });

                if ($('div.modal-body>div.form-group').length) {
                    $('div.modal-body>div.form-group').remove();
                }

                $('div.modal-body').append('<div class="form-group"></div>');
                for (var i=0; i<keysArray.length; i++) {
                    $('div.modal-body>div.form-group').append('<label for="' + keysArray[i] + '">' + keysArray[i] + '</label>');
                    $('div.modal-body>div.form-group').append('<input type="text" id="' + keysArray[i] + '" class="' + keysArray[i] + ' form-control" value="' + valuesArray[i] + '"/>');
                }

                $('div.modal-body>div.form-group').append('<label for="customFieldsKey">Custom fields</label>');
                $('div.modal-body>div.form-group').append('<div class="btn-group-xs"><button type="button" class="add-more-edit btn btn-warning btn-xs">Add more</button></div>');
                $('div.modal-body>div.form-group').append('<input type="text" id="customFieldsKey" class="custom-fields-key form-control" placeholder="Key"/>');
                $('div.modal-body>div.form-group').append('<input type="text" id="customFieldsValue" class="custom-fields-value form-control" placeholder="Value"/>');

                $('div.modal').modal('show');
            } else {
                notify.addError('Only user can edit himself!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    var fieldsEditCounter = 0;
    body.on('click', 'button.add-more-edit', function () {
            fieldsEditCounter++;

            if (fieldsEditCounter > 0) {
                if (!$('.less-fields-edit-button').length) {
                    $(this).closest('div.form-group').find('div.btn-group-xs').append('<button class="less-fields-edit-button btn btn-xs btn-warning" type="button">Less fields</button>');
                }
            }

            $(this).closest('div.form-group').find('input.custom-fields-key').first().clone().appendTo($(this).closest('div.form-group'));
            $(this).closest('div.form-group').find('input.custom-fields-value').first().clone().appendTo($(this).closest('div.form-group'));
    });

    body.on('click', '.less-fields-edit-button', function () {
        fieldsEditCounter--;

        $(this).closest('div.form-group').find('input.custom-fields-value').last().remove();
        $(this).closest('div.form-group').find('input.custom-fields-key').last().remove();

        if (fieldsEditCounter == 0) {
            $(this).remove();
        }
    });

    body.on('click', 'button.edit-user-submit', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            var keysArray = [];
            var valuesArray = [];
            $.map(currentUser.attributes, function(values, keys){
                keysArray.push(keys);
                valuesArray.push(values);
            });
            //TODO: validation and check if it is not changed? if it is needed
            for (var i=0; i<keysArray.length; i++) {
                var input = $(this).closest('div.modal').find('input.' + keysArray[i]).val();
                currentUser.set(keysArray[i], input);
            }

            var customFieldsKey = $(this).closest('div.modal').find('input.custom-fields-key');
            var customFieldsValue = $(this).closest('div.modal').find('input.custom-fields-value');
            for (var i=0; i<customFieldsKey.length; i++) {
                currentUser.set(
                    $(customFieldsKey[i]).val(),
                    $(customFieldsValue[i]).val()
                );
            }

            currentUser.save(null, {
                success: function(user, error) {
                    if (error) {
                        notify.addError('Error occured while saving! Message: ' + error.message);
                    }
                    notify.addSuccess('User has been successfully edited!');
                    $('div.modal').modal('hide');
                    fetchUsers();
                }
            });
        }
    });

    body.on('click', 'button.reset-password', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if ($(this).closest('td').prev('td').prev("td.username:contains('" + currentUser.attributes.username + "')").length) {
                $('div.modal').find('h4.modal-title').text('Reset password');
                $('div.modal').find('button.submit').addClass('reset-password-submit');
                if ($('div.modal-body>div.form-group').length) {
                    $('div.modal-body>div.form-group').remove();
                }
                $('div.modal-body').append('<div class="form-group"></div>');
                $('div.modal-body>div.form-group').append('<label for="emailReset">Custom fields</label>');
                $('div.modal-body>div.form-group').append('<input type="email" id="emailReset" class="email-reset form-control" placeholder="Your email"/>');
                $('div.modal').modal('show');
            } else {
                notify.addError('Only user can reset his password!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    body.on('click', 'button.reset-password-submit', function () {
        Parse.User.requestPasswordReset($('div.modal-body>div.form-group>input.email-reset').val(), {
            success: function() {
                $('div.modal').modal('hide');
                notify.addSuccess('Email for resetting password has been sent!');
            },
            error: function(error) {
                notify.addError("Error: " + error.code + " " + error.message);
            }
        });

    });

    body.on('click', 'button.delete-user', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if ($(this).closest('td').prev('td').prev("td.username:contains('" + currentUser.attributes.username + "')").length) {
                notify.addError('Not implemented yet');
            } else {
                notify.addError('Only user can delete himself!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    function login (username, password) {
        Parse.User.logIn(username, password, {
            success: function(user) {
                updateCurrentUser();
                notify.addSuccess('You have successfully logged in!');
            },
            error: function(user, error) {
                notify.addError('Authentication failed! Message: ' + error.message);
            }
        });
    }

    function logout () {
        Parse.User.logOut();
    }

    function updateCurrentUser() {
        var currentUser = Parse.User.current();
        if (currentUser) {
            $('.current-user').text(currentUser.attributes.username);
        } else {
            $('.current-user').text('You are not logged in!');
        }
    }
});