<?php

include "Hijri_GregorianConvert.class.php";

$DateConv=new Hijri_GregorianConvert;


echo "<br>";



$format="YYYY/MM/DD";
$date="1400/03/22";
echo "src: $date<br>";
$result=$DateConv->HijriToGregorian($date,$format);

echo "Hijri to Gregorian Result: ".$result."<br> gre to hijri:<br>";



$format="YYYY/MM/DD";
$date="1988/07/24";
echo "src: $date<br>";

echo $DateConv->GregorianToHijri($date,$format);



?>