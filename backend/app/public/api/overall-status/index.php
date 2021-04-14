<?php

$configJSONPath = '../../../../config.json';
require realpath('../../../../config.php');
require realpath('../../../db/database.php');
require realpath('../../../../vendor/autoload.php');
require realpath('../../../includes/api-output.php');

$db = new Database;

$extract = new LayerShifter\TLDExtract\Extract();

if (!empty(is_array($checks))) {
    $output = '[';

    foreach ($checks as $key => $check) {
        $parsedUrl = $extract->parse($check[1]);

        if ($parsedUrl->isValidDomain()) {
            // Gets value of the target= param from the url, strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-), respectively.
            $url = str_replace('.', '-', $parsedUrl->getFullHost());
        } elseif ($parsedUrl->isIp()) {
            // Gets value of the target= param from the url and replaces the dots (.) with dashes (-).
            $url = str_replace('.', '-', $parsedUrl->getFullHost());
        }

        $serviceStatus = $db->serviceStatus($url);

        if (!$serviceStatus) {
            $output .= '"N/A",';
        } else {
            $output .= '"' . $serviceStatus . '",';
        }
    }
    // Remove trailing comma
    $output = substr($output, 0, -1);
    $output .= ']';

    echo $output;
} else {
    exit("N/A");
}