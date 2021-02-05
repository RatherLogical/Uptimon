<?php

require realpath('../../../includes/api-output.php');

// Disable error reporting for cleaner output in case of incorrect db conn details
error_reporting(0);

// Location where the config.json file should be located
$configPath = '../../../../config.json';

// Ensure the config file is not already created
if (file_exists($configPath)) {
    exit('{"status":"failure", "message":"Config file already exists."}');
}

if (isset($_REQUEST['type'])) {
    if ($_REQUEST['type'] == "connCheck") {
        if (isset($_REQUEST['db_host']) && isset($_REQUEST['db_user']) && isset($_REQUEST['db_pass']) && isset($_REQUEST['db_name'])) {
            checkConnection($_REQUEST['db_host'], $_REQUEST['db_user'], $_REQUEST['db_pass'], $_REQUEST['db_name']);
        } else {
            echo '{"status":"failure", "message":"Missing db_host or db_user or db_pass or db_name."}';
        }
    } else if ($_REQUEST['type'] == "validateEmail") {
        validateEmail($_REQUEST['admin_email']);
    } elseif ($_REQUEST['type'] == "createConfig") {
        // Convert the base64 encoded JSON into an associative array
        $configData = json_decode(base64_decode($_REQUEST['config_data']));
        // Prettify the JSON
        $configData = json_encode($configData, JSON_PRETTY_PRINT);
        createConfigFile($configData);
    } else {
        echo '{"status":"failure", "message":"Invalid type."}';
    }
} else {
    echo '{"status":"failure", "message":"Missing type."}';
}

// Determines whether or not the supplied database connection details are correct
function checkConnection($db_host, $db_user, $db_pass, $db_name) {
    // Create connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    // Check connection
    if ($conn->connect_error) {
        echo '{"status":"failure", "message":"' . $conn->connect_error . '"}';
    } else {
        echo '{"status":"success", "message":"db_conn_good"}';
    }
}

function validateEmail($admin_email) {
    if (filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
        echo '{"status":"success", "message":"Email valid!"}';
    } else {
        echo '{"status":"failure", "message":"Invalid email!"}';
    }
}

function createConfigFile($configData) {
    global $configPath;

    $fd = fopen($configPath, "w") or exit('{"status":"failure", "message":"Unable to create config file."}');
    fwrite($fd, $configData);
    fclose($fd);
    // Notify the client that the application is fully installed
    echo '{"status":"success", "message":"Uptimon installed! The backend is now set up."}';
}