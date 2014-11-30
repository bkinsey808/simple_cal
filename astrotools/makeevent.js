// Javascript Event Tool
// FUNCTIONS FOR creating event display

// Copyright Ole Nielsen 2002-2005


var head1="<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
var head2="</TITLE><style>\npre {font-size:12px}\n</style></HEAD><BODY>";


function nextDate(obs1,dstep,origday) {
	// update date and time, origday is day of month at start (some months may not allow this day)
	if (dstep < 0) { 	// dstep is in months (integer!)
		dstep = -dstep;
		if (dstep >= 12) {
			obs1.year += Math.floor(dstep/12); 
		}
		else {
			obs1.month += dstep;
			if (obs1.month > 12) {
				obs1.year++;
				obs1.month -= 12;
			}
		}
		month_length[1]=leapyear(obs1.year)?29:28;	// check for leapyear
		obs1.day = ( origday>month_length[obs1.month-1] ? month_length[obs1.month-1] : origday);
	}
	else {	// dstep is in days (max 31)
		var m = Math.round(1440*(dstep-Math.floor(dstep)));
		obs1.minutes += m - 60*(Math.floor(m/60));
		obs1.hours += Math.floor(m/60);
		obs1.day += Math.floor(dstep);
		if (obs1.minutes > 59) {
			obs1.minutes -= 60;
			obs1.hours++;
		}
		if (obs1.hours > 23) {
			obs1.hours -= 24;
			obs1.day++;
		}
		month_length[1]=leapyear(obs1.year)?29:28;	// check for leapyear
		while (obs1.day > month_length[obs1.month-1]) {
			obs1.day -= month_length[obs1.month-1];
			obs1.month++; 
			if (obs1.month == 13) {
				obs1.year++;
				obs1.month = 1;
			}
		}
	}
}		// end nextDate()


function pheader(doc,obj,obs,title,descrip,line1,line2) {
	// common code for page header
	var str = head1 + "Javascript: " + title + head2;
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "<h2>" + title + "</h2><p><b>" + descrip + "</b></p>";
	if (obj>=0 && obj<100) str += "<h3>Object: " + bodies[obj].name + "</h3>";
	if (obj==100) str += "<h3>Object: All planets</h3>";
	str += "<p>Observer location: "+sitename();
	str += " (UT "+hmstring(-obs.tz/60.0,true)+")</p>\n";
	var line3="";
	for (var i=0; i<line2.length; i++) line3 += "-";
	str += "<pre>" + line1 + "\n" + line2 + "\n" + line3 + "\n";
	doc.write(str);
}		//	end pheader()


function pbottom(doc,pwin,line2) {
	// finish the page
	var line3="";
	for (var i=0; i<line2.length; i++) line3 += "-";
	var str = line3 + "</pre>\n";
	str += "<p><A HREF=\"javascript:window.close()\">close window</A></p>\n";
	str += "</CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
}		// end pbottom()


// 'l_events' is array of records holding all detected events. Each record comprising:
// 1. time in JD format; 2. first object; 3. second object; 
// 4. event type: 0=conj, 1=summer solstice/1st quarter/quadrature, 2=aut. equinox/oppos./Full Moon, 
//		3=winter solstice/last quarter/quadrature, 4=max elong, 8=peri/apo event; 
// 5. angle or distance; 6. position angle or peri/apo flag

function longitudeEvents(obs,jdmax,l_events,sel) {
	// Find equinoxes, solstices, moon phases, oppositions, mutual and solar conjunctions
	// For each day in timespan detect if an event takes place by comparing longitudes
	if (!sel.conj_sol && !sel.conj_moon && !sel.conj_planet && !sel.quadrature) {
		var objects = [SUN];
		if (sel.phase) objects[1] = MOON;
	}
	else {
		var objects = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN, URANUS, NEPTUNE];
		if (!sel.phase && !sel.conj_moon) objects.splice(1,1);	// remove moon
	}
	var odat0 = new Array(); 	// positions of all objects at start of day
	var odat2 = new Array();	// positions at end of day
	var jday = jd0(obs.year,obs.month,obs.day) + obs.tz/1440.0;
	for (var i in objects) { var p = objects[i]; odat0[p] = PlanetAlt(p,jday,obs); }
	while (jday < jdmax) {
		for (i in objects) { p = objects[i]; odat2[p] = PlanetAlt(p, jday+1.0, obs);	}
		for (i in objects) {			// check for events relative to Sun
			p = objects[i]; 
			for (var a=0; a<360; a += 90) {	
				// a = desired difference in longitude, 0 = new Moon/vernal equinox or solar conjunction, 
				// 90 = 1st quarter/summer solstice/quadrature etc
				if (p == SUN) {
					dlon0 = rev2(odat0[p][5] - a); 
					dlon2 = rev2(odat2[p][5] - a);
				} else {
					dlon0 = rev2(odat0[p][5] - odat0[SUN][5] - a);	
					dlon2 = rev2(odat2[p][5] - odat2[SUN][5] - a);
				}
				if (SGN(dlon2)!=SGN(dlon0) && Math.abs(dlon2)<20 && Math.abs(dlon0)<20) {
					// the <20 test necessary, otherwise "oppositions" detected as well"
					odat1 = PlanetAlt(p,jday+0.5, obs);
					sdat1 = PlanetAlt(SUN,jday+0.5, obs);
					if (p == SUN) dlon1 = rev2(sdat1[5]-a);
					else dlon1 = rev2(odat1[5]-sdat1[5]-a);
					var n0 = nzero(dlon0,dlon1,dlon2);
					var jdzero = jday + 0.5 + n0/2;
					if ((p==MERCURY || p==VENUS) && dlon2<0) // detect if inferior conjunction
						l_events[l_events.length] = new Array(jdzero, p, SUN, 2, 0, 0);
					else 
						l_events[l_events.length] = new Array(jdzero, p, SUN, a/90, 0, 0);
				}
			}
		}
		if (sel.conj_moon || sel.conj_planet) {
			for (i = 1; i < objects.length-1; i++) {	// check for mutual conjunctions, Sun ignored
				p = objects[i];
				for (var j = i+1; j < objects.length; j++) {
					var q = objects[j];
					dlon2 = rev2(odat2[p][5] - odat2[q][5]);
					dlon0 = rev2(odat0[p][5] - odat0[q][5]);
					if (SGN(dlon2)!=SGN(dlon0) && Math.abs(dlon2)<20 && Math.abs(dlon0)<20) {
						odat1 = PlanetAlt(p,jday+0.5, obs);
						sdat1 = PlanetAlt(q,jday+0.5, obs);
						dlon1 = rev2(odat1[5] - sdat1[5]);
						n0 = nzero(dlon0,dlon1,dlon2);
						jdzero = jday + 0.5 + n0/2;
						odat1 = PlanetAlt(p, jdzero, obs); sdat1 = PlanetAlt(q, jdzero, obs);
						l_events[l_events.length] = new Array(jdzero, p, q, 0, odat1[6]-sdat1[6], 0);
					}	
				}	
			}
		}
		for (var i in objects) {p = objects[i]; odat0[p][5] = odat2[p][5];}
		jday += 1.0; 
	}
}	// end longitudeEvents()


function elongEvents(obs, jdmax, l_events) {
	// Detect max elongations for Mercury, Venus
	var e0 = new Array(); var e1 = new Array(); var e2 = new Array();
	var jdmin = jd0(obs.year,obs.month,obs.day) + obs.tz/1440.0;
	var jday = jdmin;
	bodies[MERCURY].elongupdate(jday-1.0,obs); e0[0]=bodies[MERCURY].elong;
	bodies[MERCURY].elongupdate(jday,obs); e1[0]=bodies[MERCURY].elong;
	bodies[VENUS].elongupdate(jday-1.0,obs); e0[1]=bodies[VENUS].elong;
	bodies[VENUS].elongupdate(jday,obs); e1[1]=bodies[VENUS].elong;
	while (jday < jdmax+1.0) {
		for (var i=0; i<=1; i++) {
			var p = (i==0 ? MERCURY : VENUS);
			bodies[p].elongupdate(jday+1.0,obs); e2[i]=bodies[p].elong;
			if (e1[i]>e0[i] && e1[i]>e2[i]) {
				n0 = nextrem(e0[i],e1[i],e2[i]);
				jdextr = jday + n0;
				if (jdextr>=jdmin && jdextr<=jdmax) {
					bodies[p].elongupdate(jdextr,obs);
					l_events[l_events.length] = new Array(jdextr, p, p, 4, bodies[p].elong, bodies[p].pa);
				}
			}
			e0[i]=e1[i]; e1[i]=e2[i];
		}
		jday+=1.0;
	}
}	// end elongEvents()


function distEvents(obs, jdmax, l_events,sel) {
	// Detect peri/aphelion peri/apogee
	var e0 = new Array(); var e1 = new Array(); var e2 = new Array();
	var jdmin = jd0(obs.year,obs.month,obs.day) + obs.tz/1440.0;
	var jday = jdmin;
	bodies[SUN].update(jday-1.0,obs); e0[0]=bodies[SUN].dist;
	bodies[SUN].update(jday,obs); e1[0]=bodies[SUN].dist;
	bodies[MOON].update(jday-1.0,obs); e0[1]=bodies[MOON].dist;
	bodies[MOON].update(jday,obs); e1[1]=bodies[MOON].dist;
	while (jday < jdmax+1.0) {
		for (var i=0; i<=1; i++) {
			var p = (i==0 ? SUN : MOON);
			bodies[p].update(jday+1.0,obs); e2[i]=bodies[p].dist;
			if ((e1[i]>e0[i] && e1[i]>e2[i]) || (e1[i]<e0[i] && e1[i]<e2[i])) {
				if (e1[i]>e0[i]) var apo=true;
				else var apo=false;
				n0 = nextrem(e0[i],e1[i],e2[i]);
				jdextr = jday + n0;
				if (jdextr>=jdmin && jdextr<=jdmax) {
					bodies[p].update(jdextr,obs);
					l_events[l_events.length] = new Array(jdextr, p, p, 8, bodies[p].dist, apo);
				}
			}
			e0[i]=e1[i]; e1[i]=e2[i];
		}
		jday+=1.0;
	}
}	// end distEvents()


function doPlanetEvents(obs,dspan,sel) {
	// Search lunar, solar and planetary events (conjunctions, quadratures, oppositions)
	// Incl. Moon phases, Earth equinoxes, solstices etc
	var obscopy=new Object(); var obsmax=new Object();
	for (var i in obs) {
		obscopy[i] = obs[i]; obsmax[i] = obs[i];
	}
	obscopy.hours = 0;	obscopy.minutes = 0;	// set to local midnight
	var pwin=window.open("","planetevents","menubar,scrollbars,resizable");
	var doc=pwin.document;
	var title="Lunar and Solar Events";
	if (planets) title="Planetary Events";
	var descrip="Geocentric positions!";
	var line1="";
	var line2="   Date       Time                Event             ";
	pheader(doc,-1,obs,title,descrip,line1,line2);
	nextDate(obsmax, dspan, obs.day);	// 'abuse' nextdate to calculate end time
	var jdmax = jd(obsmax);
	var pevents = new Array();
	longitudeEvents(obscopy, jdmax, pevents, sel);
	if (sel.maxelong) elongEvents(obscopy, jdmax, pevents);
	if (sel.sol_peri || sel.moon_peri) distEvents(obscopy, jdmax, pevents);		// peri/apo things
	isort(pevents);	// bring out-of-order events into place
	for (var i=0; i<pevents.length; i++) {
		var doprint=true; var descr = "";
		var dt = jdtocd(pevents[i][0]-obs.tz/1440);
		var date = datestring2(dt[0],dt[1],dt[2]);
		var time = hmstring2(dt[4],dt[5],dt[6]);
		var p = pevents[i][1]; var q = pevents[i][2]; var sep = pevents[i][4]; var ang = pevents[i][5];
		switch(pevents[i][3]) {
		case 0:		// same longitude
			if (sel.season && p==SUN) descr = "Vernal Equinox"; 
			else if (sel.phase && p==MOON && q==SUN) descr = "New Moon";
			else if (sel.conj_sol && (p==MERCURY || p==VENUS) && q==SUN) 
				descr = bodies[p].name + " at superior conjunction";
			else if (sel.conj_sol && p<SUN && q==SUN)	
				descr = bodies[p].name + " at conjunction";
			else if ((sel.conj_moon && p==MOON && !(q==SUN || q==URANUS || q==NEPTUNE)) || 
						(sel.conj_planet && p<SUN && q<SUN))	{
				descr = bodies[p].name + " in conjunction with " + bodies[q].name;
				if (q!=SUN) descr += "," + fixnum(Math.abs(sep),5,2) + "&deg; " + 
					(sep>=0 ? "N" : "S") + " of " + bodies[q].name; 
			}
			else doprint=false;
			break;
		case 1:		// 90 deg difference
			if (sel.season && p==SUN) descr = "Solstice"; 
			else if (sel.phase && p==MOON) descr = "First Quarter";
			else if (sel.quadrature && p<SUN) descr = bodies[p].name + " at quadrature";
			else doprint=false;
			break;
		case 2:		// 180 deg difference
			if (sel.season && p==SUN) descr = "Autumnal Equinox"; 
			else if (sel.phase && p==MOON) descr = "Full Moon";
			else if (sel.conj_sol && (p==MERCURY || p==VENUS)) descr = bodies[p].name + " at inferior conjunction";
			else if (sel.conj_sol && p<SUN) descr = bodies[p].name + " at opposition";
			else doprint=false;
			break;
		case 3:		// 270 deg difference
			if (sel.season && p==SUN) descr = "Solstice"; 
			else if (sel.phase && p==MOON) descr = "Last Quarter";
			else if (sel.quadrature && p<SUN) descr = bodies[p].name + " at quadrature";
			else doprint=false;
			break;
		case 4:		// max elongation
			descr = bodies[p].name + " greatest " + (ang<180 ? "eastern" : "western") + " elongation (" +
				fixnum(sep,5,2) + "&deg;)";
			break;
		case 8:		// max or min distance
			if (sel.sol_peri && p==SUN) 
				descr = "Earth at " + (ang?"ap":"peri")+ "helion (" + fixnum(sep,5,3) + " AU)";
			else if (sel.moon_peri && p==MOON) 
				descr = "Moon at " + (ang?"apo":"peri")+ "gee (" + fixnum(sep,5,0) + " km)";
			else doprint=false;
			break; 
		default:
			doprint=false;
		}		
		if (doprint) 
			doc.writeln(date + "   " + time + "      " + descr);
	}
	pbottom(doc,pwin,line2);
} 	// end doPlanetEvents()

