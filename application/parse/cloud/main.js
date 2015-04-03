/**
 * All cloud functions to be deployed
 */

/**
 * Deletes an user
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
            response.error('User not found');
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
            response.error('Role not found');
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
                            response.error('Error occured while removing child role from a parent role!');
                        }
                    });
                },
                error: function () {
                    response.error('Child role not found');
                }
            });
        },
        error: function () {
            response.error('Parent role not found');
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
                            response.success(childRole);
                        },
                        error: function (error) {
                            response.error('Error occured while adding child role to a parent role!');
                        }
                    });
                },
                error: function () {
                    response.error('Child role not found');
                }
            });
        },
        error: function () {
            response.error('Parent role not found');
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
                            response.success('Child user has been added to a parent role!');
                        },
                        error: function (error) {
                            response.error('Error occured while adding child user to a parent role!');
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
                            response.error('Error occured while removing child user from a parent role');
                        }
                    });
                },
                error: function () {
                    response.error('Child user not found');
                }
            });
        },
        error: function () {
            response.error('Parent role not found');
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
                success: function(user) {
                    response.success(user);
                },
                error: function () {
                    response.error('Error occured while editing user');
                }
            });
        },
        error: function () {
            response.error('User has not been found');
        }
    });
});




/**
 * Fetches All Child Roles
 */
Parse.Cloud.define('getChildRoles', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo('name', request.params.parentName).find({
        success: function(result) {
            var parentRole = result[0];
            parentRole.getRoles().query().find({
                success: function (results) {
                    response.success(results);
                },
                error: function (error) {
                    response.error("Problems with fetching child roles!");
                }
            });
        },
        error: function () {
            response.error('Problems with getting parent role!');
        }
    });
});


/**
 * Fetches All Roles
 */
Parse.Cloud.define('getRoles', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).find({
        success: function(results) {
            response.success(results);
        },
        error: function () {
            response.error('Problems with getting roles!');
        }
    });
});


/**
 * Edits an object
 */
Parse.Cloud.define('editObject', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.objectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.objectId, {
        success: function(object) {
            request.params.objectFields.forEach(function (param) {
                object.set(param.key, param.value);
            });

            object.save(null, {
                success: function(object) {
                    response.success(object);
                },
                error: function () {
                    response.error('Error occured while editing object');
                }
            });
        },
        error: function(object, error) {
            response.error('Object has not been found');
        }
    });
});

/**
 * Deletes an object
 */
Parse.Cloud.define('deleteObject', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.objectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.objectId, {
        success: function(object) {
            object.destroy({
                success: function() {
                    response.success('Object deleted');
                },
                error: function() {
                    response.error('Object has not been deleted');
                }
            });
        },
        error: function(object, error) {
            response.error('Object has not been found');
        }
    });
});

/**
 * Adds user to an ACL
 */
Parse.Cloud.define('addUserToACL', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.objectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.objectId, {
        success: function(object) {
            var query = new Parse.Query(Parse.User);
            query.get(request.params.userId, {
                success: function (user) {
                    var newACL = object.getACL();
                    switch (request.params.selectedRights) {
                        case 'Read Access':
                            newACL.setReadAccess(user.toJSON().objectId, true);
                            break;
                        case 'Write Access':
                            newACL.setWriteAccess(user.toJSON().objectId, true);
                            break;
                        case 'Both':
                            newACL.setWriteAccess(user.toJSON().objectId, true);
                            newACL.setReadAccess(user.toJSON().objectId, true);
                            break;
                        default:
                            break;
                    }
                    object.setACL(newACL);
                    object.save({
                        success: function () {
                            response.success('Yahoo');
                        },
                        error: function () {
                            response.error('Dammit');
                        }
                    });
                },
                error: function (user) {
                    response.error("User has not been found!");
                }
            });
        },
        error: function(object, error) {
            response.error('Object has not been found');
        }
    });
});

/**
 * Adds role to an ACL
 */
Parse.Cloud.define('addRoleToACL', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.objectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.objectId, {
        success: function(object) {
            var query = new Parse.Query(Parse.Role);
            query.get(request.params.roleId, {
                success: function (role) {
                    var newACL = object.getACL();
                    switch (request.params.selectedRights) {
                        case 'Read Access':
                            newACL.setRoleReadAccess(role.toJSON().name, true);
                            break;
                        case 'Write Access':
                            newACL.setRoleWriteAccess(role.toJSON().name, true);
                            break;
                        case 'Both':
                            newACL.setRoleWriteAccess(role.toJSON().name, true);
                            newACL.setRoleReadAccess(role.toJSON().name, true);
                            break;
                        default:
                            break;
                    }
                    object.setACL(newACL);
                    object.save({
                        success: function () {
                            response.success('Yahoo');
                        },
                        error: function () {
                            response.error('Dammit');
                        }
                    });
                },
                error: function (user) {
                    response.error("Role has not been found!");
                }
            });
        },
        error: function(object, error) {
            response.error('Object has not been found');
        }
    });
});

/**
 * Deletes role from an ACL
 */
Parse.Cloud.define('deleteRoleFromACL', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.parentObjectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.parentObjectId, {
        success: function(object) {
            var query = new Parse.Query(Parse.Role);
            query.get(request.params.roleId, {
                success: function (role) {
                    var newACL = object.getACL();
                    newACL.setRoleWriteAccess(role.toJSON().name, false);
                    newACL.setRoleReadAccess(role.toJSON().name, false);

                    object.setACL(newACL);
                    object.save({
                        success: function () {
                            response.success('Yahoo');
                        },
                        error: function () {
                            response.error('Dammit');
                        }
                    });
                },
                error: function () {
                    response.error("Child role has not been found!");
                }
            });
        },
        error: function() {
            response.error('Object has not been found');
        }
    });
});

/**
 * Deletes user from an ACL
 */
Parse.Cloud.define('deleteUserFromACL', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.parentObjectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.parentObjectId, {
        success: function(object) {
            var query = new Parse.Query(Parse.Role);
            query.get(request.params.userId, {
                success: function (user) {
                    var newACL = object.getACL();

                    newACL.setWriteAccess(user.toJSON().objectId, false);
                    newACL.setReadAccess(user.toJSON().objectId, false);

                    object.setACL(newACL);
                    object.save({
                        success: function () {
                            response.success('Yahoo');
                        },
                        error: function () {
                            response.error('Dammit');
                        }
                    });
                },
                error: function () {
                    response.error("Child role has not been found!");
                }
            });
        },
        error: function() {
            response.error('Object has not been found');
        }
    });
});

/**
 * Sets public rights from an ACL
 */
Parse.Cloud.define('setObjectPublicRights', function(request, response) {
    Parse.Cloud.useMasterKey();
    var Object = Parse.Object.extend(request.params.objectClassName);
    var query = new Parse.Query(Object);
    query.get(request.params.objectId, {
        success: function(object) {
            var newACL = object.getACL();

            switch (request.params.selectedRights) {
                case 'Read Access':
                    newACL.setPublicReadAccess(true);
                    newACL.setPublicWriteAccess(false);
                    break;
                case 'Write Access':
                    newACL.setPublicWriteAccess(true);
                    newACL.setPublicReadAccess(false);
                    break;
                case 'Both':
                    newACL.setPublicWriteAccess(true);
                    newACL.setPublicReadAccess(true);
                    break;
                case 'None':
                    newACL.setPublicWriteAccess(false);
                    newACL.setPublicReadAccess(false);
                    break;
                default:
                    break;
            }

            object.setACL(newACL);
            object.save({
                success: function () {
                    response.success('Yahoo');
                },
                error: function () {
                    response.error('Dammit');
                }
            });
        },
        error: function() {
            response.error('Object has not been found');
        }
    });
});

/**
 * Fetches single role
 */
Parse.Cloud.define('getRole', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo('name', request.params.name).find({
        success: function(results) {
            response.success(results[0]);
        },
        error: function () {
            response.error('Problems with getting roles!');
        }
    });
});


/**
 * Fetches user's roles
 */
Parse.Cloud.define('getUserRoles', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User).equalTo("username", request.params.username).find({
        success: function (results) {
            var user = results[0];
            var query = new Parse.Query(Parse.Role).equalTo("users", user).find({
                success: function (allRoles) {
                    response.success(allRoles);
                },
                error: function (error) {
                    response.error('Error while fetching users roles');
                }
            });
        }
    });
});


/**
 * Fetches All Child Users
 */
Parse.Cloud.define('getChildUsers', function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.Role).equalTo('name', request.params.parentName).find({
        success: function(result) {
            var parentRole = result[0];
            parentRole.getUsers().query().find({
                success: function (results) {
                    response.success(results);
                },
                error: function (error) {
                    response.error("Problems with fetching child roles!");
                }
            });
        },
        error: function () {
            response.error('Problems with getting parent role!');
        }
    });
});