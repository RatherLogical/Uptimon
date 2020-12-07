<?php

require '../../../config.php';

header('Content-type: application/json');

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