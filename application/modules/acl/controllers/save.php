<?php
/**
 * @author   Anton Shevchuk
 * @created  10.10.11 16:48
 */

/**
 * @namespace
 */
namespace Application;

use Bluz\Proxy\Cache;
use Bluz\Proxy\Db;
use Bluz\Proxy\Messages;

return
/**
 * @privilege Management
 *
 * @param array $acl
 * @return void
 */
function ($acl) use ($view) {
    /**
     * @var Bootstrap $this
     * @var \Bluz\View\View $view
     */
    $callback = function () use ($acl) {
        /**
         * @var Bootstrap $this
         */
        Db::query('DELETE FROM acl_privileges');

        foreach ($acl as $roleId => $modules) {
            foreach ($modules as $module => $privileges) {
                foreach ($privileges as $privilege => $flag) {
                    Db::query(
                        'INSERT INTO acl_privileges SET roleId = ?, module = ?, privilege = ?',
                        array($roleId, $module, $privilege)
                    );
                }
            }
        }
    };

    if (empty($acl)) {
        Messages::addError('Privileges set is empty. You can\'t remove all of them');
    } elseif (Db::transaction($callback)) {
        Cache::deleteByTag('privileges');
        Messages::addSuccess('All data was saved');
    } else {
        Messages::addError('Internal Server Error');
    }

    $this->redirectTo('acl', 'index');
};
