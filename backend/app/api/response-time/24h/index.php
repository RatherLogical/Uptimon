<?php

// This API endpoint returns all of the non-zero response times over the last 24 hours
// A request would look like: https://status.example.com/response-time/24h/?target=www.example.com
require '../../../../config.php';
require '../../../db/database.php';
require '../../../../vendor/autoload.php';

header('Content-type: application/json');

use Phpfastcache\Helper\Psr16Adapter;

$defaultDriver = 'Files';
$Psr16Adapter = new Psr16Adapter($defaultDriver);
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

$db = new Database;

if (!$Psr16Adapter->has($url)) {
    $intervalTTL = '';
    foreach ($checks as $key => $check) {
        $interval = $check[0];
        $parsedCheckUrl = $extract->parse($check[1]);

        if ($parsedCheckUrl == $parsedUrl) {
            $intervalTTL = $interval * 60;
        }
    }

    $data = $db->responseTime24H($url);

    if ($data !== false) {
        $output = '[';
        foreach($data as $result) {
            $output .= '[' . $result[0] . ',' . $result[1] . '],';
        }
        // Remove trailing comma
        $output = substr($output, 0, -1);
        $output .= ']';
        $Psr16Adapter->set($url, $output, $intervalTTL);
        echo $output;
    } else {
        exit("N/A");
    }
} else {
   echo $Psr16Adapter->get($url);
}