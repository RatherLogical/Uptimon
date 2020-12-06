<?php

$nodes = array('http://www.google.com', 'http://www.microsoft.com', 'http://www.rustyrazorblade.com');
$node_count = count($nodes);

$curl_arr = array();
$master = curl_multi_init();

for($i = 0; $i < $node_count; $i++)
{
$url =$nodes[$i];
$curl_arr[$i] = curl_init($url);
curl_setopt($curl_arr[$i], CURLOPT_RETURNTRANSFER, true);

curl_multi_add_handle($master, $curl_arr[$i]);
}

do {
curl_multi_exec($master,$running);
} while($running > 0);

echo "results: ";
for($i = 0; $i < $node_count; $i++)
{
$info[$i] = curl_getinfo($curl_arr[$i], CURLINFO_TOTAL_TIME);    
}
print_r($info);