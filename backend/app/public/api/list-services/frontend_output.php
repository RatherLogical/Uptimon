<?php

$configJSONPath = '../../../../config.json';
require realpath('../../../../config.php');
require realpath('../../../db/database.php');
require realpath('../../../../vendor/autoload.php');
require realpath('../../../includes/api-output.php');

$db = new Database;

$extract = new LayerShifter\TLDExtract\Extract();

if (isset($_GET['default_period'])) {
    $timePeriod = $_GET['default_period'];
} else {
    exit("Default time period not specified");
}

if (!empty(is_array($checks))) {
    $output = '[';

    foreach ($checks as $key => $check) {
        $parsedUrl = $extract->parse($check[1]);
        // Get domain/IP from checks array
        if ($parsedUrl->isValidDomain()) {
            // Gets value of the target= param from the url, strips everything except the domain & servername(s), and replaces the dots (.) with dashes (-), respectively.
            $url = str_replace('.', '-', $parsedUrl->getFullHost());
        } elseif ($parsedUrl->isIp()) {
            // Gets value of the target= param from the url and replaces the dots (.) with dashes (-).
            $url = str_replace('.', '-', $parsedUrl->getFullHost());
        } else {
            exit("Domain/IP invalid");
        }

        // Shows the last time this service was checked
        $lastChecked = $db->lastChecked($url);

        if (!$lastChecked) {
            $lastChecked = "N/A";
        }

        // Shows the avg response time
        $averageResponseTime = $db->averageResponseTime($url, $timePeriod);

        if (!$averageResponseTime) {
            $averageResponseTime = "N/A";
        }

        // Shows all of the response times for the specified period
        $response_times = $db->responseTime($url, $timePeriod);

        if ($response_times !== false) {
            $response_timesOutput = '[';
            foreach($response_times as $result) {
                $response_timesOutput .= '{' . $result[0] . ',' . $result[1] . '},';
            }
            // Remove trailing comma
            $response_timesOutput = substr($response_timesOutput, 0, -1);
            $response_timesOutput .= ']';
        } else {
            $response_timesOutput = "N/A";
        }

        // Shows the current status of the specified service
        $serviceStatus = $db->serviceStatus($url);

        if (!$serviceStatus) {
            $serviceStatus = "N/A";
        }

        // Shows the SSL status of the specified service
        $SSL_Status = $db->SSL_Status($url);

        if (!$SSL_Status) {
            $SSL_Status = "N/A";
        }

        // Get uptime for domain/IP
        $uptime = $db->uptime($url, $timePeriod);

        if (!$uptime) {
            $uptime = "N/A";
        }

        $output .= '{"target":"' . $check[1] . '", "title":"' . $check[2] . '", "last_checked":"' . $lastChecked . '", "avgResponseTime":"' . $averageResponseTime . '", "response_times":' . $response_timesOutput . ', "serviceStatus":"' . $serviceStatus . '", "SSL_Status":"' . $SSL_Status . '", "uptime":"' . $uptime . '"},';
    }
    // Remove trailing comma
    $output = substr($output, 0, -1);
    $output .= ']';

    echo $output;
} else {
    exit("N/A");
}