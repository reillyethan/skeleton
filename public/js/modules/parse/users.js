/**
 * Created by alexander on 3/5/15.
 */
define(['jquery', 'backbone', 'parse', 'bluz.notify', 'json2', 'bootstrap'], function ($, Backbone, Parse, notify) {
    Parse.initialize("v0J2mglwXn35AbQfBC4qyFoRPXvRkGLPvHkblaMe", "F2Um4CQ8uyB52vuZe8TDHrGagXMyiM8zDgYajg20");

    var body = $('body');

    //FETCHING ALL USERS
    fetchUsers();

    function fetchUsers() {
        if ($('.grid>table>thead>tr>th').length) {
            $('.grid>table>thead>tr>th').remove();
            $('.grid>table>tbody>tr').remove();
        }

        var query = new Parse.Query('User');
        query.find({
            success: function(results) {
                // cycle through the results
                for (i in results) {
                    keysArray = [];
                    valuesArray = [];
                    $.map(results[i].attributes, function(values, keys){
                        keysArray.push(keys);
                        valuesArray.push(values);
                    });
                    $('.grid>table>tbody').append('<tr></tr>');
                    valuesArray.forEach(function (value) {
                        $('.grid>table>tbody>tr').last().append('<td>'+ value +'</td>');
                        if (value == valuesArray[valuesArray.length - 1]) {
                            $('.grid>table>tbody>tr').last().append('<td><button type="button" class="login-user btn btn-success btn-xs"><i class="fa fa-sign-in"></i></button><button type="button" class="logout-user btn btn-warning btn-xs"><i class="fa fa-sign-out"></i></button><button type="button" class="edit-user btn btn-primary btn-xs"><i class="fa fa-pencil"></i></button><button type="button" class="acl-user btn btn-default btn-xs"><i class="fa fa-lock"></i></button><button type="button" class="delete-user btn btn-danger btn-xs"><i class="fa fa-remove"></i></button></td>');
                        }
                    });
                }
                keysArray.forEach(function (key) {
                    $('.grid>table>thead>tr').append('<th>'+ key +'</th>')
                    if (key == keysArray[keysArray.length - 1]) {
                        $('.grid>table>thead>tr').append('<th class="blank"></th>')
                    }
                });

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
                    notify.addSuccess('User ' + username + ' is successfully created');
                },
                error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    notify.addError("Error: " + error.code + " " + error.message);
                }
            });
        }
    });

    body.on('click', 'button.edit-user', function () {

    });

    body.on('click', 'button.acl-user', function () {

    });

    body.on('click', 'button.delete-user', function () {

    });
});