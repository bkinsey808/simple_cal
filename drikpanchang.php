<?php
require 'vendor/autoload.php';


function initDrik() {
  $ckfile = tempnam ("/tmp", "CURLCOOKIE");
  $ch = curl_init ("http://www.drikpanchang.com/location/panchang-city-finder.html?l=8592");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt ($ch, CURLOPT_COOKIEJAR, $ckfile);
  curl_exec ($ch);
  return $ch;
}

$ch = initDrik();

//honolulu: http://www.drikpanchang.com/location/panchang-city-finder.html?l=21970

//http://www.drikpanchang.com/panchang/day-panchang.html?date=12/03/2014

$uri = "http://www.drikpanchang.com/panchang/day-panchang.html?date=02/03/2014";
curl_setopt($ch, CURLOPT_URL, $uri);

        $output = curl_exec($ch);

        // close curl resource to free up system resources
        curl_close($ch);      

//echo $output;

// sunsign: 
echo qp($output, 'tr:nth(5) td:nth(2)')->text();

// moonsign: 
echo "<br>\n" . qp($output, 'tr:nth(5) td:nth(4)')->text();

// surya nakshatra: 
echo "<br>\n" . qp($output, 'tr:nth(6) td:nth(2)')->text();

// drik ayana: 
echo "<br>\n" . qp($output, 'tr:nth(7) td:nth(2)')->text();

// drik ritu: 
echo "<br>\n" . qp($output, 'tr:nth(7) td:nth(4)')->text();

// vedic ayana: 
echo "<br>\n" . qp($output, 'tr:nth(8) td:nth(2)')->text();

// vedic ritu: 
echo "<br>\n" . qp($output, 'tr:nth(8) td:nth(4)')->text();

// shaka samvat: 
echo "<br>\n" . qp($output, 'tr:nth(10) td:nth(2)')->text();

// amanta chandramasa: 
echo "<br>\n" . qp($output, 'tr:nth(10) td:nth(4)')->text();

// vikram samvat: 
echo "<br>\n" . qp($output, 'tr:nth(11) td:nth(2)')->text();

// purnimanta chandramasa: 
echo "<br>\n" . qp($output, 'tr:nth(11) td:nth(4)')->text();

// gujarati samvat: 
echo "<br>\n" . qp($output, 'tr:nth(12) td:nth(2)')->text();

// paksha: 
echo "<br>\n" . qp($output, 'tr:nth(12) td:nth(4)')->text();

// tithi: 
echo "<br>\n" . qp($output, 'tr:nth(13) td:nth(2)')->text();

// nakshatra: 
echo "<br>\n" . qp($output, 'tr:nth(15) td:nth(2)')->text();

// yoga: 
echo "<br>\n" . qp($output, 'tr:nth(15) td:nth(4)')->text();

// anandadi yoga: 
echo "<br>\n" . qp($output, 'tr:nth(25) td:nth(2)')->text();

// tamil yoga: 
echo "<br>\n" . qp($output, 'tr:nth(25) td:nth(4)')->text();




