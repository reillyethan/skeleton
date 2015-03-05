<?php
/**
 * Example of Mailer usage
 *
 * @author   Anton Shevchuk
 * @created  07.09.12 18:28
 */
namespace Application;

use Bluz\Proxy\Layout;
use Bluz\Proxy\Mailer;
use Bluz\Proxy\Messages;
use Bluz\Proxy\Request;

return
/**
 * @param string $email
 * @return \closure
 */
function ($email = "no-reply@nixsolutions.com") use ($view) {
    /**
     * @var Bootstrap $this
     * @var \Bluz\View\View $view
     */
    Layout::breadCrumbs(
        [
            $view->ahref('Test', ['test', 'index']),
            'Mailer Example',
        ]
    );
    if (Request::isPost()) {
        try {
            $mail = Mailer::create();
            // subject
            $mail->Subject = "Example of Bluz Mailer";
            $mail->MsgHTML("Hello!<br/>How are you?");
            $mail->AddAddress($email);
            Mailer::send($mail);
            Messages::addSuccess("Email was send");
        } catch (\Exception $e) {
            Messages::addError($e->getMessage());
        }
    }
    $view->email = $email;
};
