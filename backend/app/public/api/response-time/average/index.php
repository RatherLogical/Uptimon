<?php

$configJSONPath = '../../../../../config.json';
require realpath('../../../../../config.php');
require realpath('../../../../db/database.php');
require realpath('../../../../../vendor/autoload.php');
require realpath('../../../../includes/api-output.php');

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
} else {
    exit("Domain not given");
}

if (isset($_GET['period'])) {
    $timePeriod = $_GET['period'];
} else {
    exit("Time period not specified");
}

$averageResponseTime = $db->averageResponseTime($url, $timePeriod);

if ($averageResponseTime) {
    echo $averageResponseTime;
} else {
    exit("N/A");
}