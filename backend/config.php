<?php

// Set your time zone
date_default_timezone_set('America/New_York');

// Toggle debug
define("IS_DEBUG", true);

// Timeout for response time in seconds, use 0 to wait indefinitely (not recommended)
define("REQ_TIMEOUT", 5);

$checks = array( // Available check intervals (in minutes) = 1, 2, 3, 4, 5, 6, 10, 15, 20, 30, 60
//  Intervals | Domains/IPs
    array('1', 'https://www.motorsportdiesel.com', 'Motorsport Diesel Website'),
    array('2', 'https://media.motorsportdiesel.com', 'Motorsport Diesel Images'),
    array('3', 'https://cdn.motorsportdiesel.com', 'Motorsport Diesel GP CDN'),
    array('4', 'https://jsonplaceholder.typicode.com/users', 'Random Site'),
    array('1', 'https://www.wickeddiesels.com', 'Wicked Diesels Website'),
    array('1', '96.33.2.182', 'A Dead IP'),
    array('1', '1.1.1.1', 'CloudFlare DNS'),
);

if (IS_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}
