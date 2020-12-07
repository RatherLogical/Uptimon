<?php

require '../../../config.php';
require '../../db/database.php';
require '../../../vendor/autoload.php';

header('Content-type: application/json');

$db = new Database;

$extract = new LayerShifter\TLDExtract\Extract();

if (isset($_GET['target'])) { // target can either be a domain or IPV4 address (no port)

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

    $serviceStatus = $db->serviceStatus($url);

    if (!$serviceStatus) {
        exit("N/A");
    } else {
        echo $serviceStatus;
    }
} else {
    exit("Domain not given");
}