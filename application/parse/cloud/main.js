/**
 * All cloud functions to be deployed
 */

/**
 * Deletes a user
 */
Parse.Cloud.define('deleteUser', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User).equalTo("username", request.params.username).find({
        success: function (results) {
            var user = results[0];
            user.destroy({
                success: function() {
                    response.success('User deleted');
                },
                error: function() {
                    response.error('User has not been deleted');
                }
            });
        },
        error: function () {
            response.error('User has not been found');
        }
    });
});

/**
 * Deletes a role
 */
Parse.Cloud.define('deleteRole', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo("name", request.params.name).find({
        success: function (results) {
            var role = results[0];
            role.destroy({
                success: function() {
                    response.success('Role deleted');
                },
                error: function() {
                    response.error('Role has not been deleted');
                }
            });
        },
        error: function () {
            response.error('Role has not been found');
        }
    });
});


/**
 * Deletes a child role
 */
Parse.Cloud.define('deleteChildRole', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo("name", request.params.parentName).find({
        success: function (results) {
            var parentRole = results[0];
            var query = new Parse.Query(Parse.Role).equalTo("name", request.params.childName).find({
                success: function (results) {
                    var childRole = results[0];
                    parentRole.getRoles().remove(childRole);
                    parentRole.save({
                        success: function () {
                            response.success('Child role removed from a parent role!');
                        },
                        error: function (error) {
                            response.error('Error occured while removing child role from a parent role! Message: ' + error.message);
                        }
                    });
                },
                error: function () {
                    response.error('Child role has not been found');
                }
            });
        },
        error: function () {
            response.error('Parent role has not been found');
        }
    });
});

/**
 * Adds a child role
 */
Parse.Cloud.define('addChildRole', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo("name", request.params.parentName).find({
        success: function (results) {
            var parentRole = results[0];
            var query = new Parse.Query(Parse.Role).equalTo("name", request.params.childName).find({
                success: function (results) {
                    var childRole = results[0];
                    parentRole.getRoles().add(childRole);
                    parentRole.save({
                        success: function () {
                            response.success('Child role added to a parent role!');
                        },
                        error: function (error) {
                            response.error('Error occured while adding child role to a parent role! Message: ' + error.message);
                        }
                    });
                },
                error: function () {
                    response.error('Child role has not been found');
                }
            });
        },
        error: function () {
            response.error('Parent role has not been found');
        }
    });
});

/**
 * Adds a child user
 */
Parse.Cloud.define('addChildUser', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo("name", request.params.parentName).find({
        success: function (results) {
            var parentRole = results[0];
            var query = new Parse.Query(Parse.User).equalTo("username", request.params.childUsername).find({
                success: function (results) {
                    var childUser = results[0];
                    parentRole.getUsers().add(childUser);
                    parentRole.save({
                        success: function () {
                            response.success('Child user added to a parent role!');
                        },
                        error: function (error) {
                            response.error('Error occured while adding child user to a parent role! Message: ' + error.message);
                        }
                    });
                },
                error: function () {
                    response.error('Child user has not been found');
                }
            });
        },
        error: function () {
            response.error('Parent role has not been found');
        }
    });
});

/**
 * Deletes a child user
 */
Parse.Cloud.define('deleteChildUser', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo("name", request.params.parentName).find({
        success: function (results) {
            var parentRole = results[0];
            var query = new Parse.Query(Parse.User).equalTo("username", request.params.childUsername).find({
                success: function (results) {
                    var childUser = results[0];
                    parentRole.getUsers().remove(childUser);
                    parentRole.save({
                        success: function () {
                            response.success('Child user removed from a parent role!');
                        },
                        error: function (error) {
                            response.error('Error occured while removing child user from a parent role! Message: ' + error.message);
                        }
                    });
                },
                error: function () {
                    response.error('Child user has not been found');
                }
            });
        },
        error: function () {
            response.error('Parent role has not been found');
        }
    });
});

/**
 * Edits an user
 */
Parse.Cloud.define('editUser', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User).equalTo("username", request.params.username).find({
        success: function (results) {
            var user = results[0];

            request.params.userFields.forEach(function (param) {
                user.set(param.key, param.value);
            });

            user.save(null, {
                success: function(user, error) {
                    if (error) {
                        response.error('Error occured while saving! Message: ' + error.message);
                    }
                    response.success('User has been successfully edited!');
                }
            });
        },
        error: function () {
            response.error('User has not been found');
        }
    });
});