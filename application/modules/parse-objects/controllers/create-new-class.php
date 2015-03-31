<?php
/**
 * Created by PhpStorm.
 * User: alexander
 * Date: 3/31/15
 * Time: 4:44 PM
 */
namespace Application;

use Bluz\Application\Exception\BadRequestException;
use Bluz\Controller;
use Application\ParseObjects;

return
    function () {
        /**
         * @var Bootstrap $this
         */
        $this->useJson();
        if ($this->getRequest()->isPost() && $this->getRequest()->isXmlHttpRequest() && $this->getRequest()->getPost("className")) {
            $className = $this->getRequest()->getPost("className");
            ParseObjects\Table::insert(["className" => $className]);
            return ["className"=>$className];
        } else {
            throw new BadRequestException();
        }

    };