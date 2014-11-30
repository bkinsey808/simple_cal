// AstroTools - handlers.js

// various functions for handling events of user interfaces

var anim=false;
var timer0, jday0, speed;	// used by animation
var counter,dt=0; // for benchmarking
var speeds = new Array(1,60,180,600,1800,3600,3600*3,3600*10,3600*24);
var timespans = [1,3,7,14,31,62];

function rewrite2() {
// rewrite2 updates table1 date/time info and redraws Jupiter objects
	tbl.local_date.value = datestring(observer);
	tbl.local_time.value = hmstring2(observer.hours,observer.minutes,0);
	updateDisplay();
}		// end rewrite2()


function reset1() {
// reset1 restores the input table to its default settings
// initialize date from system clock
	tbl.grs.value = jupiter.grs_lon;
	setNow();			
	tbl.Place.selectedIndex=0;
	updateplace(true);
	j_init();
}		// end reset1()


function setDateTime(rel) {
	// handles changes to the time, date and tz fields in table1. Also handles time step buttons.
	// 'rel' is relative adjustment in minutes. If rel = 0 read date and time fields.
	anim = false;	// stop any ongoing animation;
	if (rel != 0) {
		adjustTime(observer,rel);
		rewrite2();
		return;
	}
	var vald=tbl.local_date.value;
	// date field
	var col1=vald.indexOf(":");
	var col2=vald.lastIndexOf(":");
	var col3=vald.length;
	observer.year=parseInt(vald.substring(0,col1),10);
	month_length[1]=leapyear(observer.year)?29:28;
	observer.month=parseInt(vald.substring(col1+1,col2),10);
	observer.day=parseInt(vald.substring(col2+1,col3),10);
	if (observer.day > month_length[observer.month-1]) {
		observer.day = month_length[observer.month-1];
	}
	// time field
	var valt=tbl.local_time.value;
	col1=valt.indexOf(":");
	col2=valt.length;
   	if (col1 <= 0) col1=col2;
   	observer.hours=parseInt(valt.substring(0,col1),10);
   	if (col2 > (col1+1)) {
   		observer.minutes=parseInt(valt.substring(col1+1,col2),10);
   	} else {
		observer.minutes=0;
    }
	observer.seconds=0;
	rewrite2();
}	// setDateTime()


function setNow(settimezone,changeDST) {
	// Handles 'Now' button
	var now = new Date();
	anim = false;	// stop animation if running
	observer.year = now.getFullYear();
	month_length[1]=leapyear(observer.year)?29:28;
	observer.month = now.getMonth()+1;
	observer.day = now.getDate();
	observer.hours = now.getHours();
	observer.minutes = now.getMinutes();
	observer.seconds = 0;
	rewrite2();
}		// end clockhandler()


function set12(noon) {
// set to noon or midnight next day
	anim = false;	// stop animation if running
	if (noon) {
		observer.hours = 12;
		observer.minutes = 0;
	}
	else {
		observer.hours = 0;
		observer.minutes = 0;
	}
	rewrite2();
}


function setUTCOff() {
	anim = false;	// stop any ongoing animation;
	observer.tz=-60.0*parsecol(tbl.ut_offset.value);
	rewrite2();
	rewritePlace();
}


function setTZ(changeDST) {
	// handles 'Set TZ from computer' buttons and DST checkbox
	anim = false;	// stop animation if running
	if (changeDST) {	// toggle DST
		observer.dst = tbl.DSTactive.checked;
		observer.tz -= (observer.dst?60:-60);
	} 
	else {	// set time zone to computer time zone
		var now = new Date();
		observer.tz = now.getTimezoneOffset();
		// find out if this is DST (idea picked from a discussion forum about javascript)
		var winter = new Date(020101);
		var summer = new Date(020701);
		var off = Math.min(summer.getTimezoneOffset(),winter.getTimezoneOffset());
		observer.dst = (observer.tz==off?false:true)
	}
	rewritePlace();
	rewrite2();
}


function updateplace(fromtable) {
	// updateplace handles the place selection in table1
	// if 'fromtable' is true get data from 'selected' table entry, else just read Placename field
	var ndx=tbl.Place.selectedIndex;
	if (fromtable) {
		if ((ndx >= 0) && (ndx <= atlas.length)) {
			observer.name=atlas[ndx].name;
			var lat=parsecol(atlas[ndx].latitude);
			observer.latitude=atlas[ndx].ns==0?lat:-lat;
			var lon=parsecol(atlas[ndx].longitude);
			observer.longitude=atlas[ndx].we==0?lon:-lon;
			observer.tz = atlas[ndx].zone;
			// This code makes a lot of assumptions about typical rules
			observer.dst = (checkdst(observer)==-60);
			observer.tz += (observer.dst?-60:0);
			rewritePlace();
			rewrite2();
		} 
	}
	else {
		observer.name=tbl.Placename.value;
	}
}	// end updateplace()


function rewritePlace() {
	tbl.Placename.value = observer.name;
	tbl.Latitude.value = dmstring(observer.latitude);
	tbl.Longitude.value = dmstring(observer.longitude);
	tbl.North.selectedIndex = observer.latitude>0?0:1;
//  	tbl.North[observer.latitude>0?0:1].checked = true;
//  	tbl.North[observer.latitude>0?1:0].checked = false;
	tbl.West.selectedIndex = observer.longitude>0?0:1;
//	 	tbl.West[observer.longitude>0?0:1].checked = true;
//	 	tbl.West[observer.longitude>0?1:0].checked = false;
  	tbl.ut_offset.value = hmstring(-observer.tz/60.0,true);
	tbl.DSTactive.checked = observer.dst;
}	// rewritePlace()


function updatell() {
	// updatell handles the latitude/longitude changes in table1
	var lat = parsecol(tbl.Latitude.value);
	observer.latitude = tbl.North.selectedIndex==0?lat:-lat;
	var lon = parsecol(tbl.Longitude.value);
	observer.longitude = tbl.West.selectedIndex==0?lon:-lon;
	rewrite2();
}		// end updatell()


function changeSpeed(faster) {	// handle faster and slower buttons
	if (faster && tbl.anispeed.selectedIndex < speeds.length-1) tbl.anispeed.selectedIndex++;
	else if (!faster && tbl.anispeed.selectedIndex > 0) tbl.anispeed.selectedIndex--;
	if (anim) startAnim(speed<0);
}


function startAnim(revers) {
	// start or reinitialize animation, revers=true if reverse
	var now = new Date();
	timer0 = now.getTime();
	if (debug) counter=0;
	jday0 = jd(observer);
	speed = speeds[tbl.anispeed.selectedIndex]*(revers?-1:1)/(24*3600*1000.0);	// in days per millisec
	if (!anim) {	// do not call if already running
		anim=true;
		animateJup();
	}
}
	
function animateJup() {	
	// run one iteration of the animation and call itself
	if (!anim) return;	// STOP pressed
	var now = new Date();
	var timer = now.getTime();
	if (debug) {counter++; dt = (timer-timer0)/counter-10;}	// average measured time
	var j = jday0 + (timer-timer0)*speed;
	var t = jdtocd(j-observer.tz/1440.0);
	tbl.local_date.value=datestring2(t[0],t[1],t[2]);
	tbl.local_time.value=hmstring2(t[4],t[5],0);
	observer.year = t[0];
	observer.month = t[1];
	observer.day = t[2];
	observer.hours = t[4];
	observer.minutes = t[5];
	observer.seconds = t[6];
	updateDisplay();
	setTimeout("animateJup()",10);	// do it again
}


var head1="<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
var head2="</TITLE><style>\npre {font-size:12px}\n</style></HEAD><BODY>";
var eventnames = new Array("Transit       ","Occultation   ","Shadow transit","Eclipse       ");
var satnames = ["GRS   ","Io (1)","Eur(2)","Gan(3)","Cal(4)"];

function listEvents(grs) {
	// list satellite and grs events
	var pwin=window.open("","events","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var str = head1 + "Jupiter Satellite Events" + head2;
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "<h2>Jupiter Satellite Events</h2><p></p>";
	str += "<p>Observatory: "+sitename();
	str += " (UT "+hmstring(-observer.tz/60.0,true)+")</p>\n";
	var line1="   Date       Time  Jup Alt  Satellite   Event               ";
	var line3="";
	for (var i=0; i<line1.length; i++) line3 += "-";
	str += "<pre>" + line1 + "\n" + line3 + "\n";
	var jday = jd(observer);
	var events = searchEvents(jday,timespans[tbl.spanselect.selectedIndex]);
	for (var i = 0; i<events.length; i++) {
		if (!grs && events[i][1]==0) continue;	// no listing of grs passages desired
		JupDat(events[i][0],observer);
		SunDat(events[i][0],observer);
		var vis = false;
		if (jupiter.alt > 3.0 && sun.alt < -3.0) vis=true;
		var t = jdtocd(events[i][0]-observer.tz/1440.0);
		if (vis) str += "<b>";
		str += datestring2(t[0],t[1],t[2]) + "   ";
		str += hmstring2(t[4],t[5],t[6]) + "  ";
		str += fixnum(jupiter.alt,6,1) + "     ";
		str += satnames[events[i][1]] + "    ";
		if (events[i][1]==0) str += "crosses central meridian";
		else {
			str += eventnames[events[i][2]] + " ";
			str += (events[i][3] ? "begins" : "ends");
		}
		if (vis) str += "</b>";
		str += "\n";
	}

	str += line3 + "</pre>\n";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "</CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
}

