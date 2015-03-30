<?php
/**
 * @copyright Bluz PHP Team
 * @link https://github.com/bluzphp/skeleton
 */

/**
 * @namespace
 */
namespace Application\ParseObjects;

/**
 * Pages Table
 */
class Table extends \Bluz\Db\Table
{
    /**
     * Table
     *
     * @var string
     */
    protected $table = 'parse_objects';

    /**
     * Primary key(s)
     * @var array
     */
    protected $primary = array('id');
}
