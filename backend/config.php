<?php

// Set your time zone (Use the value of "TZ database name" from the table https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
date_default_timezone_set('America/New_York');

// Toggle debug (if this is deployed in production, set to false)
define("IS_DEBUG", true);

// Timeout for response time in seconds, use 0 to wait indefinitely (not recommended)
define("REQ_TIMEOUT", 5);

// Database info
define("DATABASE_HOST", "localhost"); // IP/Domain of your database server
define("DATABASE_NAME", "status"); // Database name
define("DATABASE_USER", "status"); // User for the database
define("DATABASE_PASSWORD", "password"); // Password for the respective User

// New domains that are added here will automatically have a database table created for themselves (it may take up to 3 mins for any new services to show up in the interface; live reload does not get new services, a page reload is required to see any newly added services on the frontend)
$checks = array( // Available check intervals (in minutes) = 1, 2, 3, 4, 5, 6, 10, 15, 20, 30, 60
//   Check Intervals |           Domains/IPs                          |           Service Name
    array('1',          'example.com',                                      'Random Site'),
    array('1',          '111.222.222.222',                                  'A Dead IP'),
    array('1',          '1.1.1.1',                                          'CloudFlare DNS'),
);

if (IS_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}
