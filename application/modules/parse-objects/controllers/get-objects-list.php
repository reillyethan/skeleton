<?php
/**
 * Created by PhpStorm.
 * User: alexander
 * Date: 3/30/15
 * Time: 1:32 PM
 */
namespace Application;

use Bluz\Controller;
use Application\ParseObjects;

return
    function () {
        /**
         * @var Bootstrap $this
         */
        $this->useJson();
        return ParseObjects\Table::fetchAll();
    };