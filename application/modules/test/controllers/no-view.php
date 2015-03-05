<?php
/**
 * Disable view, like for backbone.js
 *
 * @author   Anton Shevchuk
 * @created  22.08.12 17:14
 */
namespace Application;

use Bluz\Proxy\Layout;

return
/**
 * @return \closure
 */
function () {
    Layout::breadCrumbs(
        [
            Layout::ahref('Test', ['test', 'index']),
            'Without view',
        ]
    );
    return function () {
    };
};
