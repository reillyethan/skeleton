/**
 * Created by alexander on 3/5/15.
 */
define(['jquery', 'backbone', 'parse', 'bluz.notify', 'json2', 'bootstrap'], function ($, Backbone, Parse, notify) {
    var APP_ID = "v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe";
    var JAVASCRIPT_KEY = "F2Um4CQ8uyB52vuZe8TDHrGagXMyiM8zDgYajg20";
    var REST_KEY = "FjGzHv8sQKjY9FH32Y4PFdEuwgFjWq03xm1i8Cc2";

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

    var body = $('body');

    fetchUsers();
    updateCurrentUser();

    //////////////////////////////////////////////////////////////////////
    /////////////////////////////SELECTORS////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    var modal = $('div.modal');
    var modalBody = $('div.modal-body');

    //////////////////////////////////////////////////////////////////////
    ///////////////////////MAIN FEATURES FORMS////////////////////////////
    //////////////////////////////////////////////////////////////////////
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
                    notify.addError("User cancelled the Facebook login or did not fully authorize. Message: " + error.message);
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
                clearModal();
                setModalTitle('Edit User');
                setModalSubmitButton('edit-user-submit');

                var keysArray = [];
                var valuesArray = [];
                $.map(currentUser.attributes, function(values, keys){
                    keysArray.push(keys);
                    valuesArray.push(values);
                });
                console.log(keysArray);
                console.log(valuesArray);
                modalBody.append('<div class="form-group"></div>');
                var modalBodyForm = $('div.modal-body>div.form-group');

                for (var i=0; i<keysArray.length; i++) {
                    if ('authData' == keysArray[i]) {
                        var accessToken = valuesArray[i].facebook.access_token;
                        var expirationDate = valuesArray[i].facebook.expiration_date;
                        var facebookId = valuesArray[i].facebook.id;

                        modalBodyForm.append('<div><h5>Facebook Auth Data</h5></div>');

                        modalBodyForm.append('<label for="accessToken">Access Token</label>');
                        modalBodyForm.append('<input type="text" id="accessToken" class="form-control" value="' + accessToken + '"disabled>');
                        modalBodyForm.append('<label for="expirationDate">Expiration Date</label>');
                        modalBodyForm.append('<input type="text" id="expirationDate" class="form-control" value="' + expirationDate + '"disabled>');
                        modalBodyForm.append('<label for="facebookId">Facebook Id</label>');
                        modalBodyForm.append('<input type="text" id="facebookId" class="form-control" value="' + facebookId + '"disabled>');
                    } else {
                        modalBodyForm.append('<label for="' + keysArray[i] + '">' + keysArray[i] + '</label>');
                        modalBodyForm.append('<input type="text" id="' + keysArray[i] + '" class="' + keysArray[i] + ' form-control" value="' + valuesArray[i] + '"/>');
                    }
                }

                modalBody.append('<div><h5>Facebook</h5></div>');
                modalBody.append('<div class="btn-group" id="facebook"><button type="button" class="btn btn-info fb-link">Link</button><button type="button" class="btn btn-warning fb-unlink">Unlink</button></div>');

                modalBodyForm.append('<label for="customFieldsKey">Custom fields</label>');
                modalBodyForm.append('<div class="btn-group-xs"><button type="button" class="add-more-edit btn btn-warning btn-xs">Add more</button></div>');
                modalBodyForm.append('<input type="text" id="customFieldsKey" class="custom-fields-key form-control" placeholder="Key"/>');
                modalBodyForm.append('<input type="text" id="customFieldsValue" class="custom-fields-value form-control" placeholder="Value"/>');

                modal.modal('show');
            } else {
                notify.addError('Only user can edit himself!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    body.on('click', 'button.reset-password', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if ($(this).closest('td').prev('td').prev("td.username:contains('" + currentUser.attributes.username + "')").length) {
                clearModal();

                setModalTitle('Reset password');
                setModalSubmitButton('reset-password-submit', 'Reset');

                $(modalBody).append('<div class="form-group"></div>');
                var modalBodyForm = $('div.modal-body>div.form-group');
                $(modalBodyForm).append('<label for="emailReset">Custom fields</label>');
                $(modalBodyForm).append('<input type="email" id="emailReset" class="email-reset form-control" placeholder="Your email"/>');

                $(modal).modal('show');
            } else {
                notify.addError('Only user can reset his password!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    body.on('click', 'button.delete-user', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if ($(this).closest('td').prev('td').prev("td.username:contains('" + currentUser.attributes.username + "')").length) {
                clearModal();

                setModalSubmitButton('delete-user-submit', 'Delete');
                $(modalBody).append('<div><h4>Are you sure?</h4></div>');
                $(modal).modal('show');
            } else {
                notify.addError('Only user can delete himself!');
            }
        } else {
            notify.addError('Log in!');
        }
    });

    body.on('click', 'button.fb-link', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            if (!Parse.FacebookUtils.isLinked(currentUser)) {
                Parse.FacebookUtils.link(currentUser, null, {
                    success: function(user) {
                        notify.addSuccess("Woohoo, user logged in with Facebook!");
                        $(modal).modal('hide');
                        fetchUsers();
                    },
                    error: function(user, error) {
                        notify.addError("User cancelled the Facebook login or did not fully authorize.");
                    }
                });
            }
        } else {
            notify.addError('Log in!');
        }
    });

    body.on('click', 'button.fb-unlink', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            Parse.FacebookUtils.unlink(currentUser, {
                success: function(user) {
                    notify.addNotice("The user is no longer associated with their Facebook account.");
                }
            });
            $(modal).modal('hide');
            fetchUsers();
        } else {
            notify.addError('Log in!');
        }
    });

    //////////////////////////////////////////////////////////////////////
    ////////////////////MAIN FEATURES SUBMIT FORMS////////////////////////
    //////////////////////////////////////////////////////////////////////
    body.on('click', '.create-user-button-submit', function(){
        var username = $('input.username').val();
        var password = $('input.password').val();
        var email = $('input.email').val();

        var customFields = [];
        $('div.add-fields-form>ul>li').each(function (counter, element) {
            var key = $(element).find('div.form-group>input.key').val();
            var value = $(element).find('div.form-group>input.value').val();
            if (key && value) {
                customFields.push({key: key, value: value});
            }
        });

        if (username && password && email) {
            var user = new Parse.User();
            user.set("username", username);
            user.set("password", password);
            user.set("email", email);

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
            login($('input.log-in-username').val(), $('input.log-in-password').val());
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
            //TODO: validation if it is needed
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
                    $(modal).modal('hide');
                    fetchUsers();
                }
            });
        }
    });

    body.on('click', 'button.reset-password-submit', function () {
        Parse.User.requestPasswordReset($('div.modal-body>div.form-group>input.email-reset').val(), {
            success: function() {
                $(modal).modal('hide');
                notify.addSuccess('Email for resetting password has been sent!');
            },
            error: function(error) {
                notify.addError("Error: " + error.code + " " + error.message);
            }
        });

    });

    body.on('click', 'button.delete-user-submit', function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            var sessiontoken = currentUser._sessionToken;
            $.ajax({
                url: 'https://api.parse.com/1/users/' + currentUser.id,
                type: 'DELETE',
                headers: {'X-Parse-Application-Id': APP_ID, 'X-Parse-REST-API-Key': REST_KEY, 'X-Parse-Session-Token': sessiontoken},
                success: function (result) {
                    Parse.User.logOut();
                    $(modal).modal('hide');
                    updateCurrentUser();
                    fetchUsers();

                    notify.addSuccess('User has been successfully deleted!');
                },
                error: function(xhr, status, error) {
                    notify.addError('Error occured while deleting a user! Message: ' + xhr.responseText);
                }
            });


        } else {
            notify.addError('Log in!');
        }
    });

    //////////////////////////////////////////////////////////////////////
    /////////////////////////HELPER FEATURES//////////////////////////////
    //////////////////////////////////////////////////////////////////////
    var editUserMoreFieldsCounter = 0;
    var createUserMoreFieldsCounter = 0;

    body.on('click', '.more-fields-button', function(){
        createUserMoreFieldsCounter++;

        if (createUserMoreFieldsCounter > 0) {
            if (!$('.less-fields-button').length) {
                $(this).closest('ul.list-group').find('div.row').append('<div class="col-sm-1 col-sm-offset-2"><button class="less-fields-button btn btn-xs btn-warning" type="button">Less fields</button></div>');
            }
        }

        $(this).closest('ul.list-group').find('li.list-group-item').first().clone().appendTo($(this).closest('ul.list-group'));
        $(this).closest('div.row').appendTo($(this).closest('ul.list-group'));
    });

    body.on('click', '.less-fields-button', function () {
        createUserMoreFieldsCounter--;

        $(this).closest('ul.list-group').find('li.list-group-item').last().remove();

        if (createUserMoreFieldsCounter == 0) {
            $(this).remove();
        }
    });

    body.on('click', 'button.add-more-edit', function () {
        editUserMoreFieldsCounter++;
        if (editUserMoreFieldsCounter > 0) {
            if (!$('.less-fields-edit-button').length) {
                $(this).closest('div.form-group').find('div.btn-group-xs').append('<button class="less-fields-edit-button btn btn-xs btn-warning" type="button">Less fields</button>');
            }
        }

        $(this).closest('div.form-group').find('input.custom-fields-key').first().clone().appendTo($(this).closest('div.form-group'));
        $(this).closest('div.form-group').find('input.custom-fields-value').first().clone().appendTo($(this).closest('div.form-group'));
    });

    body.on('click', '.less-fields-edit-button', function () {
        editUserMoreFieldsCounter--;

        $(this).closest('div.form-group').find('input.custom-fields-value').last().remove();
        $(this).closest('div.form-group').find('input.custom-fields-key').last().remove();

        if (editUserMoreFieldsCounter == 0) {
            $(this).remove();
        }
    });

    ////////////////////////////////////////////////////////////
    //////////////////////////HELPERS///////////////////////////
    ////////////////////////////////////////////////////////////
    function setModalTitle(text) {
        $(modal).find('h4.modal-title').text(text);
    }

    function setModalSubmitButton(buttonClasses, buttonText) {
        var modalSubmitButton = $(modal).find('div.modal-footer>button.submit');
        $(modalSubmitButton).addClass(buttonClasses);

        if (typeof buttonText === 'undefined') { buttonText = null; }
        if (buttonText != null) {
            $(modalSubmitButton).text(buttonText);
        }
    }

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

    function clearModal() {
        $('div.modal-body>div').remove();
        $('div.modal-header>h4').text('');
        $('div.modal-footer>button.submit')
            .attr('class', 'submit btn btn-primary')
            .text('Submit');
    }

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

                    var accessToken = null;
                    var expirationDate = null;
                    var facebookId = null;
                    if (results[i].attributes['authData'] != undefined) {
                        var authData = results[i].attributes['authData'];
                        accessToken = authData.facebook.access_token;
                        expirationDate = authData.facebook.expiration_date;
                        facebookId = authData.facebook.id;
                    }

                    $('.grid>table>tbody').append('<tr></tr>');
                    var currentRow = $('.grid>table>tbody>tr');
                    currentRow.last().append('<td class="authData"></td>');
                    if (accessToken != null && expirationDate != null && facebookId != null) {
                        currentRow.last().find('td.authData').append('<dl><dt>Access Token</dt><dd>' + accessToken + '</dd><dt>Expiration Date</dt><dd>' + expirationDate + '</dd><dt>Facebook ID</dt><dd>' + facebookId + '</dd></dl>');
                    }
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
});