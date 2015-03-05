<?php
/**
 * @copyright Bluz PHP Team
 * @link https://github.com/bluzphp/skeleton
 */

/**
 * @namespace
 */
namespace Application\Tests\Dashboard;

use Application\Tests\ControllerTestCase;
use Application\Users;
use Bluz\Proxy\Response;

/**
 * @package Application\Tests\Dashboard
 * @author   Anton Shevchuk
 * @created  28.03.14 17:08
 */
class IndexTest extends ControllerTestCase
{
    /**
     * Dispatch controller w/out application:
     *  - as guest
     *  - w/out permission
     * @expectedException \Bluz\Application\Exception\RedirectException
     */
    public function testRedirect()
    {
        $this->getApp()->dispatch('dashboard', 'index');
    }

    /**
     * Dispatch controller as guest w/out permissions
     */
    public function testRedirectByUri()
    {
        $this->dispatchUri('dashboard/index');
        $this->assertRedirect('users', 'signin');
    }

    /**
     * Dispatch controller w/out application:
     *  - as user
     *  - w/out permission
     * @expectedException \Bluz\Application\Exception\ForbiddenException
     */
    public function testForbidden()
    {
        $this->setupGuestIdentity();
        $this->getApp()->dispatch('dashboard', 'index');
    }

    /**
     * Dispatch controller w/out application as user w/out permission
     */
    public function testForbiddenByUri()
    {
        $this->setupGuestIdentity();
        $this->dispatchUri('dashboard/index');
        $this->assertForbidden();
    }

    /**
     * Dispatch controller
     *  - as user
     *  - w/out permission
     */
    public function testError()
    {
        $this->setupGuestIdentity();
        $this->dispatchUri('dashboard/index');

        $this->assertEquals(403, Response::getStatusCode());
    }

    /**
     * Dispatch controller
     *  - as user
     *  - with permission
     */
    public function testIndex()
    {
        $this->setupSuperUserIdentity();
        $this->dispatchUri('dashboard/index');

        $this->assertEquals(200, Response::getStatusCode());
    }
}
