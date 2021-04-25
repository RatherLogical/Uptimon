<?php

$configJSONPath = '../../../../config.json';
require realpath('../../../../config.php');
require realpath('../../../db/database.php');
require realpath('../../../../vendor/autoload.php');
require realpath('../../../includes/api-output.php');

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

    $SSL_Status = $db->SSL_Status($url);

    if (!$SSL_Status) {
        exit("N/A");
    } else {
        echo $SSL_Status;
    }
} else {
    exit("Domain not given");
}