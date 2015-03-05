<?php
/**
 * Test of file download
 *
 * @author   Anton Shevchuk
 * @created  29.01.15 15:23
 */
namespace Application;

use Bluz\Proxy\Response;

return
/**
 * @return \closure
 */
function () {
    /**
     * @var Bootstrap $this
     */
    $this->useLayout(false);

    Response::addHeader('Content-Description', 'File Transfer');
    Response::addHeader('Content-Type', 'application/octet-stream');
    Response::addHeader('Content-Disposition', 'attachment; filename=loading.gif');
    Response::addHeader('Expires', '0');
    Response::addHeader('Cache-Control', 'must-revalidate');
    Response::addHeader('Pragma', 'public');

    return function() {
        readfile(PATH_PUBLIC .'/img/loading.gif');
    };
};
