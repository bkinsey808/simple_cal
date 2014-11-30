// AstroTools - eventhandlers.js

// various functions for handling events of user interface

function rewrite2() {
// rewrite2 updates table1 date/time info
	tbl.local_date.value = datestring(observer);
//	tbl.local_time.value = hmstring2(observer.hours,observer.minutes,0);
}		// end rewrite2()


function reset1() {
// reset1 restores the input table to its default settings
	// initialize date from system clock
	setNow();			
	tbl.Place.selectedIndex = 0;
	updateplace(true);
}		// end reset1()


function setDateTime(rel) {
	// handles changes to the time and date fields in table1. Also handles time step buttons.
	// 'rel' is relative adjustment in minutes. If rel = 0 evaluate date and time fields.
	if (rel != 0) {
		adjustTime(observer,rel);
		rewrite2();
		return;
	}
	var vald = tbl.local_date.value;
	// date field
	var col1 = vald.indexOf(":");
	var col2 = vald.lastIndexOf(":");
	var col3 = vald.length;
	observer.year = parseInt(vald.substring(0,col1),10);
	month_length[1] = leapyear(observer.year)?29:28;
	observer.month = parseInt(vald.substring(col1+1,col2),10);
	observer.day = parseInt(vald.substring(col2+1,col3),10);
	if (observer.day > month_length[observer.month-1]) {
		observer.day = month_length[observer.month-1];
	}
	// time field
	var valt = tbl.local_time.value;
	col1 = valt.indexOf(":");
	col2 = valt.length;
   	if (col1 <= 0) col1 = col2;
   	observer.hours = parseInt(valt.substring(0,col1),10);
   	if (col2 > (col1+1)) {
   		observer.minutes = parseInt(valt.substring(col1+1,col2),10);
   	} else {
		observer.minutes = 0;
    }
	observer.seconds = 0;
	rewrite2();
}	// setDateTime()


function setNow(settimezone,changeDST) {
	// Handles 'Now' button
	var now = new Date();
	observer.year = now.getFullYear();
	month_length[1]=leapyear(observer.year)?29:28;
	observer.month = now.getMonth()+1;
	observer.day = now.getDate();
	observer.hours = now.getHours();
	observer.minutes = now.getMinutes();
	observer.seconds = 0;
	rewrite2();
}		// setNow()


function set12(noon) {
// set to noon or midnight
	if (noon) {
		observer.hours = 12;
		observer.minutes = 0;
	}
	else {
		observer.hours = 0;
		observer.minutes = 0;
	}
	rewrite2();
}	// set12()


function jd2dt() {
	// handle julian day input
	var zdt=jdtocd(parseFloat(tbl.julian.value)-observer.tz/1440.0);
	tbl.local_date.value=zdt[0]+":"+zdt[1]+":"+zdt[2];
	tbl.local_time.value=zdt[4]+":"+zdt[5]+":"+zdt[6];
	setDateTime(0);
}		// end jd2dt()


function setUTCOff() {
	observer.tz=-60.0*parsecol(tbl.ut_offset.value);
	rewrite2();
	rewritePlace();
}


function setTZ(changeDST) {
	// handles 'Set TZ from computer' buttons and DST checkbox
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
	tbl.West.selectedIndex = observer.longitude>0?0:1;
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


function setAll(checked) {
	tbl.season.checked = tbl.perihelion.checked = checked;
	tbl.phase.checked = tbl.perigee.checked = checked;
	tbl.solconj.checked = tbl.moonconj.checked = tbl.planconj.checked = checked;
	tbl.elong.checked = tbl.quadrature.checked = checked;
}


function switchboard(funct) {
	// find out what has been requested and call corresponding page maker
	var starttime = new Date();	// if timer_on: Measure execution time
	var sel = {
				season: (tbl.season.checked),
				sol_peri: (tbl.perihelion.checked),
				phase: (tbl.phase.checked),
				moon_peri: (tbl.perigee.checked),
				conj_sol: (tbl.solconj.checked),
				conj_moon: (tbl.moonconj.checked),
				conj_planet: (tbl.planconj.checked),
				maxelong: (tbl.elong.checked),
				quadrature: (tbl.quadrature.checked),
				pl_peri: false
				}
	if (funct==SEASON) {
		sel.season = true;
		sel.sol_peri = sel.phase = sel.moon_peri = sel.conj_sol = sel.conj_moon = sel.conj_planet = false;
		sel.maxelong = sel.quadrature = sel.pl_peri = false;
	}
	if (funct==PHASE) {
		sel.phase = true;
		sel.sol_peri = sel.season = sel.moon_peri = sel.conj_sol = sel.conj_moon = sel.conj_planet = false;
		sel.maxelong = sel.quadrature = sel.pl_peri = false;
	}
	var dspan = datecount[tbl.Times.selectedIndex];
	doPlanetEvents(observer, dspan, sel);
	var endtime = new Date();
	if (timer_on) alert("Function executed in " + ((endtime.getTime() - starttime.getTime())/1000) + "seconds");
}


