<?php
/**
 * Session configuration
 *
 * @link https://github.com/bluzphp/framework/wiki/Session
 * @return array
 */
return array(
    "adapter" => "files",
    "settings" => array(
        "cache" => array(),
        "files" => array(
            "save_path" => PATH_DATA . '/sessions'
        ),
        "redis" => array(
            "host" => 'localhost'
        )
    )
);
