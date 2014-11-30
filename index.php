<html>
<meta charset="UTF-8">
<body>

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





date_default_timezone_set('Pacific/Honolulu');

include "Hijri_GregorianConvert.class.php";
include "cdate.php";

if (array_key_exists('d', $_GET)) {
  $date = new DateTime($_GET['d']);
} else {
  $date = new DateTime();
}
if (array_key_exists('l', $_GET)) {
  $l = $_GET['l'];
} else {
  $l = 10;
}

//$format="YYYY/MM/DD";
//echo $DateConv->GregorianToHijri($date->format('Y/m/d'),$format);
  $DateConv=new Hijri_GregorianConvert;


$first_fri = new DateTime($date->format('Y-m') . " second thu");
//o $first_fri->format('Y-m-d');

//echo "Easter Days:" . easter_days();
//echo "Jewish month: " 

//echo "julian days: " . gregoriantojd($date->

$columns = array(
  "Date" => "Date",
  //  "Month Name" => "MName",
  //"Day of Week Position" => "DPos",
  //"Last Day of Week Position" => "LDP",
  //"Day of Week Number" => "D#",
  //  "Easter Days" => "ED",
  "Day of Week Name" => "DWName",
  //"Chinese Date" => "Chinese Date",
  //"Hebrew Date"=> "Hebrew Date",
  //"Islam Date"=>"Islam Date",
  //"Day of Year" => "DY",
  //"ISO Week of Year" => "IW",
  //"Last Week of Month" => "LW",
  "Fixed Holidays" => "Fixed Holidays",
  "Floating Holidays" => "Floating Holidays",
  "Amanta Chandramas" => "Am. Ch.",
  "Tithi" => "Tithi",
  "Paksha" => "Paksha",
  "Nakshatra" => "Nakshatra",
  "Yoga" => "Yoga"
);

echo "<table border=1><tr>";
foreach ($columns as $column_name => $column_abbr) {
  echo "<th title=\"$column_name\">$column_abbr</th>";
}
echo "</tr>";
for ($i = 0; $i<$l; $i++) {

  $hindu_cal = get_hindu_cal($date);

  echo "<tr>";

  foreach ($columns as $column_name => $column_abbr) {


    if ($column_name == "Date") {
      echo "<td>" . $date->format('Y-m-d') . "</td>\n";
    }
    if ($column_name == "Month Name") {
      echo "<td>" . $date->format('F') . "</td>\n";
    }
    if ($column_name == "Day of Week Position") {
      echo "<td>" . get_day_of_week_position($date) . "</td>\n";
    }
    if ($column_name == "Last Day of Week Position") {
      echo "<td>" . get_last_day_of_week_position($date) . "</td>\n";
    }
    if ($column_name == "Last Week of Month") {
      echo "<td>" . is_last_week_of_month($date) . "</td>\n";
    }
    if ($column_name == "Day of Week Number") {
      echo "<td>" . $date->format('w') . "</td>\n";
    }
    if ($column_name == "Day of Week Name") {
      echo "<td>" . $date->format('l') . "</td>\n";
    }
    if ($column_name == "Day of Year") {
      echo "<td>" . $date->format('z') . "</td>\n";
    }
    if ($column_name == "ISO Week of Year") {
      echo "<td>" . $date->format('W') . "</td>\n";
    }
    if ($column_name == "Chinese Date") {
      echo "<td>" . get_chinese_date($date) . "</td>\n";
    }
    if ($column_name == "Hebrew Date") {
      echo "<td>" . get_hebrew_date($date) . "</td>\n";
    }
    if ($column_name == "Islam Date") {
      echo "<td>" . get_islam_date($date) . "</td>\n";
    }
    if ($column_name == "Jewish Month Name") {
      echo "<td>" . jdmonthname($date->format('z'), 4) . "</td>\n";
    }
    if ($column_name == "Fixed Holidays") {
      echo "<td>" . fixed_holidays($date) . "</td>\n";
    }
    if ($column_name == "Floating Holidays") {
      echo "<td>" . floating_holidays($date, $hindu_cal) . "</td>\n";
    }
    if ($column_name == "Easter Days") {
      echo "<td>" . get_easter_days($date) . "</td>\n";
    }
    if ($column_name == "Amanta Chandramas") {
      echo "<td>" . $hindu_cal['amanta_chandramas'] . "</td>\n";
    }
    if ($column_name == "Tithi") {
      echo "<td>" . $hindu_cal['tithi'] . "</td>\n";
    }
    if ($column_name == "Paksha") {
      echo "<td>" . $hindu_cal['paksha'] . "</td>\n";
    }
    if ($column_name == "Nakshatra") {
      echo "<td>" . $hindu_cal['nakshatra'] . "</td>\n";
    }
    if ($column_name == "Yoga") {
      echo "<td>" . $hindu_cal['yoga'] . "</td>\n";
    }
  }
  $date->add(new DateInterval("P1D"));
  echo "</tr>\n";
}
echo "</tr></table></html>\n";

function get_chinese_date($date) {
  return implode(' ', getchinesedate(intval($date->format('Y')), intval($date->format('m')), intval($date->format('d'))));
}

function get_easter_days($date) {
  $easter_date = date('Y-m-d', easter_date($date->format('Y')));
  $date_day = new DateTime($date->format('Y-m-d'));
  $easter_datetime = new DateTime($easter_date);
  $date_diff = date_diff($easter_datetime, $date_day);
  return $date_diff->format('%r%a');
}

function get_hebrew_date($date) {
  $jdDate = gregoriantojd ( $date->format('m'), $date->format('d'), $date->format('Y'));

  $gregorianMonthName = jdmonthname ( $jdDate, 1 );

  $hebrewDate = jdtojewish ($jdDate);

  list ($hebrewMonth, $hebrewDay, $hebrewYear) = split ('/', $hebrewDate);

  $hebrewMonthName = jdmonthname ( $jdDate, 4); 
  return $hebrewDate;
  return "$hebrewDay $hebrewMonthName $hebrewYear"; 
}

function get_islam_date($date) {
  global $DateConv;
  $format="YYYY/MM/DD";
  return $DateConv->GregorianToHijri($date->format('Y/m/d'),$format);
  
}

function get_month_desc($month_num) {
  switch($month_num) {
    case 1:
      return "Beginnings and Transformations";
    case 2:
      return "Purification";
    case 3:
      return "War and Agriculture";
    case 4:
      return "Love, Beauty, Prosperity";
    case 5:
      return "Fertility, The Elders";
    case 6:
      return "Marriage, The Younger Ones";
    case 7:
      return "Conquest";
    case 8:
      return "Peace, Veneration";
    case 9:
      return "";
    case 10:
      return "";
    case 11:
      return "";
    case 12:
      return "";
  }
}

function get_day_of_week_position($date, $return_int = false) {
  $day_part = strtolower($date->format('D'));
  $ordinals = array('first', 'second', 'third', 'fourth', 'fifth');
  foreach ($ordinals as $ordinal_key => $ordinal) {
    $new_date_time = new DateTime("$ordinal $day_part of " . $date->format('Y-m'));
    if ($new_date_time->format('Y-m-d') == $date->format('Y-m-d')) {
      if ($return_int) {
        return $ordinal_key + 1;
      }
      return ucwords($ordinal);
    }
  }
  return $day_part;
}

function get_last_day_of_week_position($date) {
  $day_part = strtolower($date->format('D'));
  $new_date_time = new DateTime("last $day_part of " . $date->format('Y-m'));
  if ($new_date_time->format('Y-m-d') == $date->format('Y-m-d')) {
    return 'Last';
  }
  return '&nbsp;';
}

 function getIsoWeeksInYear($year) {
    $date = new DateTime;
    $date->setISODate($year, 53);
    return ($date->format("W") === "53" ? 53 : 52);
}

function get_week($date) {
    $week = date('W',strtotime($date));
    $day  = date('N',strtotime($date));
    $max_weeks = getIsoWeeksInYear(date('Y',strtotime($date)));

    if($day == 7) {
        return ++$week;
    } else {
        return $week;
    }
}

function fixed_holidays($date) {
  $filename = "gregorian_day/" . $date->format('m_d') . ".txt";
  $contents = file_get_contents($filename);  
  $holidays = explode("\n", $contents);
  $holidays = array_map('trim', $holidays);
  $holidays = array_filter($holidays, 'strlen');
  $return_value = '';
  $holiday_names = array();
  foreach ($holidays as $holiday) {
    $holiday_name_array = explode(":", $holiday);
    $holiday_name = $holiday_name_array[0];
    $holiday_names []= $holiday_name;
  }
  
  return implode(', ', $holiday_names);
}

function floating_holidays($date, $hindu_cal) {
  $day_of_week_position = get_day_of_week_position($date, true);
  $day_of_week_position = get_day_of_week_position($date, true);
  $contents = '';
  $filename = "floating/" 
    . $date->format('m') 
    . "_" 
    . $day_of_week_position
    . "_"
    . strtolower($date->format('D'))
    . "_0.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents;  
  }
  $last_day_of_week_position = get_last_day_of_week_position($date);
  if ($last_day_of_week_position == 'Last') {
    $filename = "floating/" 
      . $date->format('m') 
      . "_l_" 
      . strtolower($date->format('D'))
      . "_0.txt";
    $float_contents = @file_get_contents($filename);
    if ($float_contents) {
      $contents = $float_contents . "\n" . $contents;  
    }
  } 
  $yesterday = new DateTime($date->format('Y-m-d'));
  $yesterday->modify('-1 day');
  $yesterday_day_of_week_position = get_day_of_week_position($yesterday, true);
  $filename = "floating/" 
    . $yesterday->format('m') 
    . "_"
    . $yesterday_day_of_week_position
    . "_" 
    . strtolower($yesterday->format('D'))
    . "_1.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
  $num_easter_days = get_easter_days($date);
  $prefix = $num_easter_days < 0 ? 'b' : 'a';
  $filename = "easter/" . $prefix . sprintf('%02d', abs($num_easter_days)) . '.txt';
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }


$christmas = new DateTime($date->format('Y') . "/12/25");
if ($christmas->format('D') == 'Sun') {
  $christmas_sunday = $christmas;
} else {
  $christmas_sunday = new DateTime();
  $christmas_sunday->setTimestamp(strtotime('this Sunday', strtotime($christmas->format('Y-m-d'))));
}
if ($date->format('Y-m-d') == $christmas_sunday->format('Y-m-d')) {
  $filename = "christmas/a_1.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

  $sunday_before_christmas = new DateTime();
  $sunday_before_christmas->setTimestamp(strtotime('last Sunday', strtotime($christmas->format('Y-m-d'))));

$gaudete_sunday = $sunday_before_christmas;
$gaudete_sunday->modify("-7 day");
if ($date->format('Y-m-d') == $gaudete_sunday->format('Y-m-d')) {
  $filename = "christmas/b_2.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

$advent_sunday = $sunday_before_christmas;
$advent_sunday->modify("-28 day");
if ($date->format('Y-m-d') == $advent_sunday->format('Y-m-d')) {
  $filename = "christmas/b_4.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

$totensonntag = $advent_sunday;
$advent_sunday->modify("-7 day");
if ($date->format('Y-m-d') == $totensonntag->format('Y-m-d')) {
  $filename = "christmas/b_5.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

if ($date->format('z') == '255') {
  $filename = "floating/programmer_day.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

if ($date->format('D') == 'Fri' && $date->format('d') == '13') {
  $filename = "floating/friday_the_thirteenth.txt";
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
}

$adjusted_date = new DateTime($date->format('Y-m-d'));
$adjusted_date->modify("+1 day");

  $jdDate = gregoriantojd ( $adjusted_date->format('m'), $adjusted_date->format('d'), $adjusted_date->format('Y'));
  $hebrewDate = jdtojewish ($jdDate);
  list ($hebrew_month, $hebrew_day, $hebrew_year) = split ('/', $hebrewDate);
  if (!isJLeapYear($hebrew_year) && $hebrew_month > 6) {
    $hebrew_month++;
  }
  $filename = sprintf('jewish/%02d_%02d.txt', $hebrew_month, $hebrew_day);
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }

  $islam_date = get_islam_date($date);
  $islam_date_parts = explode('-', $islam_date);
  $islam_day = $islam_date_parts[0];
  $islam_month = $islam_date_parts[1];
  $filename = sprintf('islam/%02d_%02d.txt', $islam_month, $islam_day);
  // return $filename;
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }

  list($chinese_year, $chinese_month, $chinese_day, $chinese_leap_year, $chinese_year_stem, $chinese_year_branch) = getchinesedate(intval($date->format('Y')), intval($date->format('m')), intval($date->format('d')));
  $filename = sprintf('chinese/%02d_%02d.txt', $chinese_month, $chinese_day);
  // return $filename;
  $float_contents = @file_get_contents($filename);
  if ($float_contents) {
    $contents = $float_contents . "\n" . $contents;  
  }
  

  $holidays = explode("\n", $contents);
  $holidays = array_map('trim', $holidays);
  $holidays = array_filter($holidays, 'strlen');
  $return_value = '';
  $holiday_names = array();
  foreach ($holidays as $holiday) {
    $holiday_name_array = explode(":", $holiday);
    $holiday_name = $holiday_name_array[0];
    $holiday_names []= $holiday_name;
  }


  return implode(', ', $holiday_names);


}
function isJLeapYear($JYear) {
    if ( ((7 * $JYear + 1) % 19) < 7 )
        return true;
    else
        return false;
}

function is_last_week_of_month($date) {
  $last_sunday = new DateTime();
  $last_sunday->setTimestamp(strtotime('last Sunday', strtotime($date->format('Y-m-d'))));
  $this_saturday = new DateTime();
  $this_saturday->setTimestamp(strtotime('this Saturday', strtotime($date->format('Y-m-d'))));
  $next_saturday = new DateTime();
  $next_saturday->setTimestamp(strtotime('+1week', strtotime($this_saturday->format('Y-m-d'))));
  $last_sunday_m = $last_sunday->format('m-d');
  $this_saturday_m = $this_saturday->format('m-d');
  $next_saturday_m = $next_saturday->format('m-d');
  //  return "$last_sunday_m $this_saturday_m $next_saturday_m";
  return (($last_sunday->format('m') == $this_saturday->format('m')) && ($this_saturday->format('m') != $next_saturday->format('m')));
}

function get_hindu_cal($date) {
  global $ch;

  $filename = $date->format("Y_m_d") . ".txt";

  $uri = "http://www.drikpanchang.com/panchang/day-panchang.html?date=" . $date->format('d/m/Y');
  curl_setopt($ch, CURLOPT_URL, $uri);

        $output = curl_exec($ch);

  $hindu_cal = array();
  $hindu_cal['tithi'] = remove_upto(qp($output, 'tr:nth(13) td:nth(2)')->text());
  $hindu_cal['paksha'] = remove_upto(qp($output, 'tr:nth(12) td:nth(4)')->text());
  $hindu_cal['nakshatra'] = remove_upto(qp($output, 'tr:nth(15) td:nth(2)')->text());
  $hindu_cal['yoga'] = remove_upto(qp($output, 'tr:nth(15) td:nth(4)')->text());
  $hindu_cal['amanta_chandramas'] = remove_amanta(qp($output, 'tr:nth(10) td:nth(4)')->text());

  switch ($hindu_cal['amanta_chandramas']) {
    case 'Chaitra':
      $hindu_cal['month_num'] = 1; break;
    case 'Vaishakha':
      $hindu_cal['month_num'] = 2; break;
    case 'Jyaishta':
      $hindu_cal['month_num'] = 3; break;
    case 'Ashadha':
      $hindu_cal['month_num'] = 4; break;
    case 'Shravana':
      $hindu_cal['month_num'] = 5; break;
    case 'Bhadrapada':
      $hindu_cal['month_num'] = 6; break;
    case 'Ashwin':
      $hindu_cal['month_num'] = 7; break;
    case 'Kartik':
      $hindu_cal['month_num'] = 8; break;
    case 'Margarshirsha':
      $hindu_cal['month_num'] = 9; break;
    case 'Paush':
      $hindu_cal['month_num'] = 10; break;
    case 'Magha':
      $hindu_cal['month_num'] = 11; break;
    case 'Phalguna':
      $hindu_cal['month_num'] = 12; break;
    defaut:
      echo "unknown month: " . $hindu_cal['amanta_chaitra'];
  }
  switch ($hindu_cal['tithi']) {
    case 'Pratipada':
      $hindu_cal['day_num'] = 1; break;
    case 'Dwitiya':
      $hindu_cal['day_num'] = 2; break;
    case 'Tritiya':
      $hindu_cal['day_num'] = 3; break;
    case 'Chaturthi':
      $hindu_cal['day_num'] = 4; break;
    case 'Panchami':
      $hindu_cal['day_num'] = 5; break;
    case 'Shashthi':
      $hindu_cal['day_num'] = 6; break;
    case 'Saptami':
      $hindu_cal['day_num'] = 7; break;
    case 'Ashtami':
      $hindu_cal['day_num'] = 8; break;
    case 'Navami':
      $hindu_cal['day_num'] = 9; break;
    case 'Dashami':
      $hindu_cal['day_num'] = 10; break;
    case 'Ekadashi':
      $hindu_cal['day_num'] = 11; break;
    case 'Dwadashi':
      $hindu_cal['day_num'] = 12; break;
    case 'Trayodashi':
      $hindu_cal['day_num'] = 13; break;
    case 'Chaturdashi':
      $hindu_cal['day_num'] = 14; break;
    case 'Purnima':
      $hindu_cal['day_num'] = 15; break;
    case 'Amavasya':
      $hindu_cal['day_num'] = 15; break;
    default:
      echo "Unknown tithi: " . $hindu_cal['tithi'];
  }
  if ($hindu_cal['paksha'] == 'Krishna Paksha') {
    $hindu_cal['day_num'] += 15;
  }
  echo sprintf('%02d_%02d', $hindu_cal['month_num'], $hindu_cal['day_num']) . ".txt<br>";
  return $hindu_cal;
}

function remove_upto($string) {
  $pattern = '/(.*) upto (.*)/';
  $replacement = '${1}';
  return trim(preg_replace($pattern, $replacement, $string));
}

function remove_amanta($string) {
  $pattern = '/(.*) - (.*)/';
  $replacement = '${1}';
  return trim(preg_replace($pattern, $replacement, $string));
}
