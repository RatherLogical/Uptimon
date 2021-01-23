<?php

// Load the config.json file and parse it's contents
$configJSON = file_get_contents($configJSONPath);
$configJSON = json_decode($configJSON, true);

// Set your time zone (Use the value of "TZ database name" from the table https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
date_default_timezone_set($configJSON['timezone']);

// Toggle debug (if this is deployed in production, set to false)
define("IS_DEBUG", $configJSON['debug']);

// Timeout for response time in seconds, use 0 to wait indefinitely (not recommended)
define("REQ_TIMEOUT", $configJSON['req_timeout']);

// Database info
define("DATABASE_HOST", $configJSON['db_host']); // IP/Domain of your database server
define("DATABASE_NAME", $configJSON['db_name']); // Database name
define("DATABASE_USER", $configJSON['db_user']); // User for the database
define("DATABASE_PASSWORD", $configJSON['db_pass']); // Password for the respective User

// If debug mode is enabled, show errors
if (IS_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// New domains that are added here will automatically have a database table created for themselves (it may take up to 3 mins for any new services to show up in the interface; live reload does not get new services, a page reload is required to see any newly added services on the frontend)
// Available check intervals (in minutes) = 1, 2, 3, 4, 5, 6, 10, 15, 20, 30, 60
$checks = array();

// Loop through JSON config array
foreach ($configJSON as $key => $value) {
    if ($key == "checks") {
        foreach ($value as $key => $value) {
            // Build $checks array
            $check = array();
            foreach ($value as $key => $value) {
                array_push($check, $value);
            }
            array_push($checks, $check);
        }
    }
}