<?php

$configJSONPath = '../../../../config.json';
require realpath('../../../../config.php');
require realpath('../../../db/database.php');
require realpath('../../../../vendor/autoload.php');
require realpath('../../../includes/api-output.php');

if (!empty(is_array($checks))) {
    $output = '[';

    foreach ($checks as $key => $check) {
        $output .= '{"target":"' . $check[1] . '", "title":"' . $check[2] . '"},';
    }
    // Remove trailing comma
    $output = substr($output, 0, -1);
    $output .= ']';

    echo $output;
} else {
    exit("N/A");
}