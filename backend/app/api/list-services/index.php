<?php

require '../../../config.php';

$output = '[';

foreach ($checks as $key => $check) {
    $output .= '{"target":"' . $check[1] . '", "title":"' . $check[2] . '"},';
}
// Remove trailing comma
$output = substr($output, 0, -1);
$output .= ']';

header('Content-type: application/json');
echo $output;