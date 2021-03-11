<?php

// This file is ran by a cron job at certain intervals to perform uptime/status checks
// This file should be outside of the document root (I.e. not publicly accessible via a url)

chdir(__DIR__);

$configJSONPath = realpath('config.json');
require realpath('config.php');
require realpath('app/db/database.php');
require realpath('vendor/autoload.php');

$cliInt = getopt("t:"); // Gets cli param from the crontab
if (isset($cliInt['t'])) {
    if ($cliInt['t'] == 1) {
        $targetInt = 1;
    } elseif ($cliInt['t'] == 2) {
        $targetInt = 2;
    } elseif ($cliInt['t'] == 3) {
        $targetInt = 3;
    } elseif ($cliInt['t'] == 4) {
        $targetInt = 4;
    } elseif ($cliInt['t'] == 5) {
        $targetInt = 5;
    } elseif ($cliInt['t'] == 6) {
        $targetInt = 6;
    } elseif ($cliInt['t'] == 10) {
        $targetInt = 10;
    } elseif ($cliInt['t'] == 15) {
        $targetInt = 15;
    } elseif ($cliInt['t'] == 20) {
        $targetInt = 20;
    } elseif ($cliInt['t'] == 30) {
        $targetInt = 30;
    } elseif ($cliInt['t'] == 60) {
        $targetInt = 60;
    } else {
        exit("Invalid interval\n");
    }
} else {
    exit("No interval defined\n");
}

function serverResponseTime($checks, $tInt)
{
    $unconfiguredDomainFound = false;

    $check_targets = array();

    $extract = new LayerShifter\TLDExtract\Extract();
    $db = new Database;

    foreach ($checks as $key => $check) { // Runs checks for each Domain/IP in the config file
        $interval = $check[0];

        // If the interval the cron job is targeting matches an interval listed in the config file it checks the respective domain
        if ($tInt == $interval) {
            $parsedUrl = $extract->parse($check[1]);
            $url = str_replace('.', '-', $parsedUrl->getFullHost());

            // If the domain has a database
            if ($db->isDomainConfigured($url)) {
                array_push($check_targets, $check[1]);
            } else {
                echo "found an unconfigured domain";
                $unconfiguredDomainFound = true;
            }
        }
    }

    // Array of curl handles
    $multiCurl = array();
    $mh = curl_multi_init();
    $check_targets_count = count($check_targets);

    $curl_transfer = array(); // Normal cURL handles
    $curl_multi = curl_multi_init(); // cURL multi handle

    for($i = 0; $i < $check_targets_count; $i++) {
        $url = $check_targets[$i];
        $curl_transfer[$i] = curl_init($url); // Initialize a cURL session
        curl_setopt($curl_transfer[$i], CURLOPT_HEADER, false); // TRUE to include the header in the output
        curl_setopt($curl_transfer[$i], CURLOPT_RETURNTRANSFER, false); // TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it directly
        curl_setopt($curl_transfer[$i], CURLOPT_NOBODY, true); // Does the download request without getting the body
        curl_setopt($curl_transfer[$i], CURLOPT_TIMEOUT, 5); // CURL_TIMEOUT set in config.php

        curl_multi_add_handle($curl_multi, $curl_transfer[$i]); // Assign a normal cURL handle to a cURL multi handle
    }

    do {
        curl_multi_exec($curl_multi, $running);
    } while($running > 0);

    // get content and remove handles
    for($i = 0; $i < $check_targets_count; $i++) {
        $date = date("Y-m-d H:i:s");

        $remote_response  = curl_getinfo($curl_transfer[$i]);

        $remote_HTTP_status = $remote_response['http_code'];
        $remote_SSL_status = $remote_response['ssl_verify_result'];
        $remote_response_time = $remote_response['starttransfer_time'] * 1000;
        $remote_scheme = $remote_response['scheme'];

        $parsedUrl = $extract->parse($check_targets[$i]);
        // Strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-).
        $url = str_replace('.', '-', $parsedUrl->getFullHost());

        if ($remote_scheme === 'HTTP') { // If connection scheme is HTTP
            $remote_SSL_status = NULL; // SSL Status is not applicable for non-ssl checks
            if ($remote_HTTP_status <= 301) { // Service offline, ssl invalid
                $db->insertLastUptimeInfo(round($remote_response_time, 0), $remote_SSL_status, 1, $date, $url);
            } else if ($remote_HTTP_status === 0 || $remote_HTTP_status > 301) { // Service offline
                $db->insertLastUptimeInfo(0, $remote_SSL_status, 0, $date, $url);
            }
        } else if ($remote_scheme === 'HTTPS') { // If connection scheme is HTTPS
            if ($remote_HTTP_status <= 301 && $remote_SSL_status === 0) { // Service online, ssl valid
                $remote_SSL_status = 1; // A valid SSL certificate was discovered
                $db->insertLastUptimeInfo(round($remote_response_time, 0), $remote_SSL_status, 1, $date, $url);
            } else if ($remote_HTTP_status <= 301 && $remote_SSL_status !== 0) { // Service offline, ssl invalid
                $remote_SSL_status = 0; // An invalid SSL certificate was discovered
                $db->insertLastUptimeInfo(0, $remote_SSL_status, 0, $date, $url);
            }
        } else { // Service offline, connection scheme unknown
            $remote_SSL_status = NULL; // SSL Status is not known
            $db->insertLastUptimeInfo(0, $remote_SSL_status, 0, $date, $url);
        }

        curl_multi_remove_handle($curl_multi, $curl_transfer[$i]);
    }

    // close
    curl_multi_close($curl_multi);

    // Create a database for any domains that don't have one
    if ($unconfiguredDomainFound) {
        echo "creating tables for domains";

        foreach ($checks as $key => $check) { // Runs checks for each Domain/IP in the config file
            $parsedUrl = $extract->parse($check[1]);

            if ($parsedUrl->isValidDomain() || $parsedUrl->isIp()) {
                // Strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-).
                $url = str_replace('.', '-', $parsedUrl->getFullHost());
            }

            $db->createTablesFromConfig($url);
        }
    }
}

serverResponseTime($checks, $targetInt);
