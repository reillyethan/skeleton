<?php
/**
 * Created by PhpStorm.
 * User: alexander
 * Date: 3/4/15
 * Time: 5:14 PM
 */

namespace Application;

use Bluz\Controller;
use Bluz\Proxy\Layout;

return
    /**
     * @privilege Management
     */
    function () use ($view){
        /**
         * @var \Bluz\View\View $view
         * @var Bootstrap $this
         */
        Layout::setTemplate('dashboard.phtml');
        Layout::breadCrumbs([
            $view->ahref('Dashboard', ['dashboard', 'index']),
            __('Parse Objects')
        ]);
    };