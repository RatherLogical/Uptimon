<?php

// Remove the entire setup directory after you configure the software

require '../../config.php';
require '../db/database.php';
require '../../vendor/autoload.php';

$extract = new LayerShifter\TLDExtract\Extract();

// Creates database tables for each of the url/ips in the config.php file
foreach ($checks as $url) {
    $parsedUrl = $extract->parse($_GET['target']);

    if ($parsedUrl->isValidDomain()) {
        // Gets value of the target= param from the url, strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-), respectively.
        $url = str_replace('.', '-', $parsedUrl->getFullHost());
    } elseif ($parsedUrl->isIp()) {
        // Gets value of the target= param from the url and replaces the dots (.) with dashes (-).
        $url = str_replace('.', '-', $parsedUrl->getFullHost());
    } else {
        exit("Domain/IP invalid");
    }

    $db = new Database;

    $db->createTablesFromConfig($url);
}
