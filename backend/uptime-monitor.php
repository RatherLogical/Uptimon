<?php

// This file is ran by a cron job at certain intervals to perform uptime/status checks
// This file should be outside of the document root (I.e. not publicly accessable via a url)

require 'config.php';
require 'app/db/database.php';
require 'vendor/autoload.php';

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
    $extract = new LayerShifter\TLDExtract\Extract();

    foreach ($checks as $key => $check) { // Runs checks for each Domain/IP in the config file
        $interval = $check[0];
        $parsedUrl = $extract->parse($check[1]);

        // If the interval the cron job is targeting matches an interval listed in the config file it checks the respective domain
        if ($tInt == $interval) {
            // Used for response time
            $ch0 = curl_init($check[1]);
            curl_setopt($ch0, CURLOPT_HEADER, false); // TRUE to include the header in the output
            curl_setopt($ch0, CURLOPT_RETURNTRANSFER, false); // TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it directly
            curl_setopt($ch0, CURLOPT_NOBODY, true); // Does the download request without getting the body
            curl_setopt($ch0, CURLOPT_CONNECTTIMEOUT, REQ_TIMEOUT); // REQ_TIMEOUT set in config.php
            curl_exec($ch0);
            $resp0 = curl_getinfo($ch0);
            curl_close($ch0);

            // Used for online/offline detection
            $ch1 = curl_init($check[1]);
            curl_setopt($ch1, CURLOPT_HEADER, true); // TRUE to include the header in the output
            curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true); // TRUE to return the transfer as a string of the return value of curl_exec() instead of outputting it directly
            curl_setopt($ch1, CURLOPT_NOBODY, true); // Does the download request without getting the body
            curl_setopt($ch1, CURLOPT_CONNECTTIMEOUT, REQ_TIMEOUT); // REQ_TIMEOUT set in config.php
            $resp1 = curl_exec($ch1);
            curl_close($ch1);

            $date = date("Y-m-d H:i:s");

            $db = new Database;

            if ($resp1) {
                $rt = $resp0['starttransfer_time'] * 1000;
                if ($parsedUrl->isValidDomain()) {
                    // Strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-), respectively.
                    $url = str_replace('.', '-', $parsedUrl->getFullHost());
                    $db->insertLastUptimeInfo(round($rt, 0), 1, $date, $url);
                } elseif ($parsedUrl->isIp()) {
                    // Replaces the dots (.) with dashes (-).
                    $url = str_replace('.', '-', $parsedUrl->getFullHost());
                    $db->insertLastUptimeInfo(round($rt, 0), 1, $date, $url);
                }
            } else {
                if ($parsedUrl->isValidDomain()) {
                    // Strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-), respectively.
                    $url = str_replace('.', '-', $parsedUrl->getFullHost());
                    $db->insertLastUptimeInfo(0, 0, $date, $url);
                } elseif ($parsedUrl->isIp()) {
                    // Replaces the dots (.) with dashes (-).
                    $url = str_replace('.', '-', $parsedUrl->getFullHost());
                    $db->insertLastUptimeInfo(0, 0, $date, $url);
                }
            }
        }
    }
}

serverResponseTime($checks, $targetInt);
