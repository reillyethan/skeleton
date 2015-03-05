<?php
/**
 * @copyright Bluz PHP Team
 * @link https://github.com/bluzphp/skeleton
 */

/**
 * @namespace
 */
namespace Application\Tests\Cache;

use Application\Tests\ControllerTestCase;
use Bluz\Proxy\Request;

/**
 * @package  Application\Tests\Cache
 * @author   Anton Shevchuk
 * @created  15.05.14 12:24
 */
class CleanTest extends ControllerTestCase
{
    /**
     * Dispatch module/controller
     *
     * @todo test functionality
     */
    public function testControllerPage()
    {
        $this->setupSuperUserIdentity();

        $this->dispatchRouter('/cache/clean/', [], Request::METHOD_GET, true);
        $this->assertOk();
        $this->assertNoticeMessage();
    }
}
