<?php

// Load the config.json file and parse it's contents
if (file_exists($configJSONPath)) {
    $configJSON = file_get_contents($configJSONPath);
} else {
    $setupDomain = '/setup/frontend/';
    exit('"config.json" does not exist. Please install uptimon by visiting <a href="' . $setupDomain . '">' . $setupDomain . '</a>');
}
$configJSON = json_decode($configJSON, true);

// Set your time zone (Use the value of "TZ database name" from the table https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
date_default_timezone_set($configJSON['timezone']);

// Toggle debug (if this is deployed in production, set to false)
define("IS_DEBUG", $configJSON['debug']);

// Timeout for response time in seconds, use 0 to wait indefinitely (not recommended)
define("CURL_TIMEOUT", $configJSON['curl_timeout']);

// The maximum execution time, in seconds. If set to zero, no time limit is imposed.
define("PHP_TIMEOUT", $configJSON['php_timeout']);

// Database info
define("DATABASE_HOST", $configJSON['database_host']); // IP/Domain of your database server
define("DATABASE_NAME", $configJSON['database_name']); // Database name
define("DATABASE_USER", $configJSON['database_user']); // User for the database
define("DATABASE_PASSWORD", $configJSON['database_pass']); // Database password for the respective User
define("ADMIN_EMAIL", $configJSON['admin_email']); // Uptimon backend admin account email
define("ADMIN_PASSWORD", $configJSON['admin_password']); // Uptimon backend admin account password

// If debug mode is enabled, show errors
if (IS_DEBUG) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// Set the time limit
set_time_limit(PHP_TIMEOUT);

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