// Functions for jupiter

// Copyright Ole Nielsen 2002-2005
// Please read copyright notice in astrotools2.html source

var jupiter = {	lon:0,	// geocentric long/lat
				lat:0,
				lon0:0,	// heliocentric long/lat
				lat0:0,
				tau:5,	// light time to Earth
				dist:0,	// distance earth
				r:0, 		// distance jup-sun
				mag:0,	// magnitude
				psi:0,	// phase angle of Jupiter
				DS:0,	// planetocentric declination of the Sun
				DE:0,	// planetocentric declination of the Earth
				sys1:0,	// System I central meridian longitude
				sys2:0,	// System II central meridian longitude
				grs_lon:98.0,	// longitude of grs, get from S&T (default for May 2005)
				grs_a:180.0,	// distance from central meridian in degrees
				grs_vis:false,	// visible?
				grs_displayed:false	// already displayed?
			};
			
var sun = {	az: 0,
			alt: 0,
			rise: 0,	// as fraction of day
			set: 0
			};

var sat = new Array();
sat[1] = {	no:1, vis:true, displayed:false, eclipsed:false, shad_vis:false, shad_displayed:false};
sat[2] = {	no:2, vis:true, displayed:false, eclipsed:false, shad_vis:false, shad_displayed:false};
sat[3] = {	no:3, vis:true, displayed:false, eclipsed:false, shad_vis:false, shad_displayed:false};
sat[4] = {	no:4, vis:true, displayed:false, eclipsed:false, shad_vis:false, shad_displayed:false};
		

// heliocentric xyz for jupiter
// this is not from Meeus' book, but from Paul Schlyter http://hem.passagen.se/pausch/comp/ppcomp.html
// account for pertuberations of Jupiter
// returns heliocentric x, y, z, distance, longitude and latitude of object
function heliosjup(jday) {
	var d = jday-2451543.5;
	var w = 273.8777 + 1.64505E-5*d;		// argument of perihelion
	var e = 0.048498 + 4.469E-9*d; 
	var a = 5.20256;
	var i = 1.3030 + -1.557E-7*d;
	var N = 100.4542 + 2.76854E-5*d;
	var M = rev(19.8950 + 0.0830853001*d ); 	// mean anomaly
	var E0 = M + RAD2DEG*e*sind(M) * ( 1.0+e*cosd(M) );
	var E1 = E0 - ( E0-RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
	while (Math.abs(E0-E1) > 0.0005) {
		E0 = E1;
		E1 = E0 - ( E0 - RAD2DEG*e*sind(E0)-M ) / ( 1.0-e*cosd(E0) );
	}
	var xv = a*(cosd(E1) - e);
	var yv = a*Math.sqrt(1.0 - e*e) * sind(E1);
	var v = rev(atan2d( yv, xv ));		// true anomaly
	var r = Math.sqrt( xv*xv + yv*yv );	// distance
	var xh = r * ( cosd(N)*cosd(v+w) - sind(N)*sind(v+w)*cosd(i) );
	var yh = r * ( sind(N)*cosd(v+w) + cosd(N)*sind(v+w)*cosd(i) );
	var zh = r * ( sind(v+w)*sind(i) );
	var lonecl = atan2d(yh, xh);
	var latecl = atan2d(zh, Math.sqrt(xh*xh + yh*yh + zh*zh));
	// Jupiter pertuberations by Saturn
	var Ms = rev(316.9670 + 0.0334442282*d);
	lonecl += (-0.332)*sind(2*M-5*Ms-67.6) - 0.056*sind(2*M-2*Ms+21) + 0.042*sind(3*M-5*Ms+21) -
			0.036*sind(M-2*Ms) + 0.022*cosd(M-Ms) + 0.023*sind(2*M-3*Ms+52) - 0.016*sind(M-5*Ms-69);
	xh=r*cosd(lonecl)*cosd(latecl);		// recalc xh, yh
	yh=r*sind(lonecl)*cosd(latecl);
	return new Array(xh,yh,zh,r,lonecl,latecl);
}	// heliosjup()


// ecliptic position of the Sun relative to Earth (basically simplified version of planetxyz calc)
function sunxyz(jday) {
	// return x,y,z ecliptic coordinates, distance, true longitude
	// days counted from 1999 Dec 31.0 UT
	var d=jday-2451543.5;
	var w = 282.9404 + 4.70935E-5 * d;		// argument of perihelion
	var e = 0.016709 - 1.151E-9 * d; 
	var M = rev(356.0470 + 0.9856002585 * d); // mean anomaly
	var E = M + e*RAD2DEG * sind(M) * ( 1.0 + e * cosd(M) );
	var xv = cosd(E) - e;
	var yv = Math.sqrt(1.0 - e*e) * sind(E);
	var v = atan2d( yv, xv );		// true anomaly
	var r = Math.sqrt( xv*xv + yv*yv );	// distance
	var lonsun = rev(v + w);	// true longitude
	var xs = r * cosd(lonsun);		// rectangular coordinates, zs = 0 for sun 
	var ys = r * sind(lonsun);
	return new Array(xs,ys,0,r,lonsun,0);
}	// sunxyz()


function radecr(obj,sun,jday,obs) {
// radecr returns ra, dec and earth distance
// obj and sun comprise Heliocentric Ecliptic Rectangular Coordinates
// (note Sun coords are really Earth heliocentric coordinates with reverse signs)
		// Equatorial geocentric co-ordinates
		var xg=obj[0]+sun[0];
		var yg=obj[1]+sun[1];
		var zg=obj[2];
		// Obliquity of Ecliptic (exponent corrected, was E-9!)
		var obl = 23.4393 - 3.563E-7 * (jday-2451543.5);
		// Convert to eq. co-ordinates
		var x1=xg;
		var y1=yg*cosd(obl) - zg*sind(obl);
		var z1=yg*sind(obl) + zg*cosd(obl);
		// RA and dec (33.2)
		var ra=rev(atan2d(y1, x1));
		var dec=atan2d(z1, Math.sqrt(x1*x1+y1*y1));
		var dist=Math.sqrt(x1*x1+y1*y1+z1*z1);
		return new Array(ra,dec,dist);
} 	// radecr()


function radec2aa(ra,dec,jday,obs) {
// Convert ra/dec to alt/az, also return hour angle, azimut = 0 when north
// DOES NOT correct for parallax!
// TH0=Greenwich sid. time (eq. 12.4), H=hour angle (chapter 13)
		var TH0 = 280.46061837 + 360.98564736629*(jday-2451545.0);
		var H = rev(TH0-obs.longitude-ra);
		var alt = asind( sind(obs.latitude)*sind(dec) + cosd(obs.latitude)*cosd(dec)*cosd(H) );
		var az = atan2d( sind(H), (cosd(H)*sind(obs.latitude) - tand(dec)*cosd(obs.latitude)) );
		return new Array (alt, rev(az+180.0), H);
}	// radec2aa()


function SunDat(jday,obs) {
// just calc altitude for the moment 
	var sdat=sunxyz(jday);
	var ecl = 23.4393 - 3.563E-7 * (jday-2451543.5); 
	var xe = sdat[0];
	var ye = sdat[1]*cosd(ecl);
	var ze = sdat[1]*sind(ecl);
	var ra = rev(atan2d(ye,xe));
	var dec = atan2d(ze, Math.sqrt(xe*xe+ye*ye));
	var topo=radec2aa(ra,dec,jday,obs);
	sun.alt = topo[0];
}


function JupDat(jday,obs) {
// Alt/Az, diameter, brightness, JupSat should be called first to set lon/lat
	var lon = jupiter.lon;
	var lat = jupiter.lat;
	var obl = 23.4393 - 3.563E-7 * (jday-2451543.5);	// Schlyter
	var ra = atan2d((sind(lon)*cosd(obl) - tand(lat)*sind(obl)), cosd(lon));	// (13.3)
	var dec = asind(sind(lat)*cosd(obl) + cosd(lat)*sind(obl)*sind(lon));	// (13.4)
	var altaz = radec2aa(ra, dec, jday, obs);
	jupiter.alt = altaz[0]; 
	jupiter.az = altaz[1];
	var dist = jupiter.dist;
	jupiter.diam = 196.88/dist;
	jupiter.mag = -9.40 + 5*log10(jupiter.r*dist) + Math.abs(jupiter.psi)*0.005;	
}	// JupDat()


function JupPhys(jday) {
// calc central meridian longitudes of system I and II, planetocentric declinations of Earth and Sun
// uses 'lower accuracy' method in Meeus chap. 43
	var d = jday - 2451545.0;
	var V = rev(172.74 + 0.00111588*d);
	var M = rev(357.529 + 0.9856003*d);	// mean anomaly Earth
	var N = rev(20.020 + 0.0830853*d + 0.329*sind(V));	// mean anomaly Jup
	var J = rev(66.115 + 0.9025179*d - 0.329*sind(V));	// diff between heliocentr lon of E and J
	var A = 1.915*sind(M) + 0.020*sind(2*M);	// Equations of center of Earth
	var B = 5.555*sind(N) + 0.168*sind(2*N);	// of Jupiter
	var K = J + A - B;
	var R = 1.00014 - 0.01671*cosd(M) - 0.00014*cosd(2*M);	// Sun - Earth dist
	var r = 5.20872 - 0.25208*cosd(N) - 0.00611*cosd(2*N);	// Sun - Jup dist
	var dist = Math.sqrt(r*r + R*R - 2*r*R*cosd(K));	// E - J dist
	var psi = asind((R/dist)*sind(K));	// phase angle
	var om1 = rev(210.98 + 877.8169088*(d-dist/173) + psi - B);	// system 1 long of CM
	var om2 = rev(187.23 + 870.1869088*(d-dist/173) + psi - B);	// system 2
	var lamd = rev(34.35 + 0.083091*d + 0.329*sind(V) + B);	
	var DS = 3.12*sind(lamd + 42.8);	// planetocentric declination of Sun
	var DE = DS - 2.22*sind(psi)*cosd(lamd+22) - 1.30*(r-dist)/dist*sind(lamd-100.5);
	jupiter.dist = dist;
	jupiter.r = r;
	jupiter.psi = psi;
	jupiter.DE = DE;
	jupiter.DS = DS;
	jupiter.sys1 = om1;
	jupiter.sys2 = om2;	// the GRS is attached to this system
	jupiter.grs_a = rev2(om2-jupiter.grs_lon);	// angle from central meridean, positive if crossed mer.
}


function JupSat(jday,shadow) {
// updates positions of satellites in units of Jupiter eq. radius
// if shadow, positions as seen from Sun (for eclipse and shadow transit calc), must be called with shadow=false first
// high accuracy method (Meeus chap 44), but with truncated terms and other short cuts
	if (shadow) {	// heliocentric location at jday-light time 
		var tau = jupiter.tau;
		var jup_xyz = heliosjup(jday-tau);
		var x = jup_xyz[0];
		var y = jup_xyz[1];
		var z = jup_xyz[2];
	}
	else {	// geocentric position
		var dist = 5.0; 	// initial guess
		var tau = 0.005776*dist;	// light time (33.3)
		// using Schlyter's method
		var sun_xyz = shadow ? [0,0,0]: sunxyz(jday); // for shadows and eclipses see jup from Sun
		var jup_xyz = heliosjup(jday-tau);
		var x = jup_xyz[0]+sun_xyz[0];
		var y = jup_xyz[1]+sun_xyz[1];
		var z = jup_xyz[2]+sun_xyz[2];
		dist = Math.sqrt(x*x+y*y+z*z);	// back to Meeus
		tau = 0.005776*dist;
		jupiter.tau = tau;
		jup_xyz = heliosjup(jday-tau);	// recalc using better light time
		x = jup_xyz[0]+sun_xyz[0];
		y = jup_xyz[1]+sun_xyz[1];
		z = jup_xyz[2]+sun_xyz[2];
		dist = Math.sqrt(x*x+y*y+z*z);	
	}
	var lon = rev( atan2d(y, x) ); 
	if (shadow) jupiter.lon0 = lon; else jupiter.lon = lon;
	var sinlon = sind(lon); var coslon = cosd(lon);	// precalc sine/cosines, needed later
	var lat = atan2d(z, Math.sqrt(x*x+y*y)); 
	if (shadow) jupiter.lat0 = lat; else jupiter.lat = lat;
	var sinlat = sind(lat); var coslat = cosd(lat);
	var t = jday - 2443000.5 - tau;
	var l1 = rev(106.077 + 203.4889558*t);
	var l2 = rev(175.732 + 101.3747247*t);
	var l3 = rev(120.559 + 50.3176092*t);
	var l4 = rev(84.445 + 21.5710712*t);
	var pi1 = rev(97.088 + 0.1613859*t);
	var pi2 = rev(154.866 + 0.0472631*t);
	var pi3 = rev(188.184 + 0.0071273*t);
	var pi4 = rev(335.287 + 0.0018400*t);
	var om1 = rev(312.335 - 0.1327939*t);
	var om2 = rev(100.441 - 0.0326306*t);
	var om3 = rev(119.194 - 0.0071770*t);
	var om4 = rev(322.619 - 0.0017593*t);
	var GAM = 0.330*sind(163.7+0.00105*t) + 0.034*sind(34.5-0.01617*t);
	var G = 30.238 + 0.08309257*t + GAM;
	var psi = 316.52 - 0.0000021*t;
	var T0 = (jday-2433282.423)/36525;
	var P = 1.39666*T0 + 0.00031*T0*T0;
	var L1 = l1 + 0.473*sind(2*(l1-l2)) - 0.035*sind(pi3-pi4);
	var B1 = atand(0.0006*sind(L1-om1));
	var R1 = 5.9057*(1 - 0.0041*cosd(2*(l1-l2)));
	L1 += P;
	var L2 = l2 + 1.065*sind(2*(l2-l3)) + 0.043*sind(l1-2*l2+pi3) + 0.036*sind(l2-pi3) + 0.024*sind(l1-2*l2+pi4);
	var B2 = atand(0.0081*sind(L2-om2));
	var R2 = 9.3968*(1 + 0.0094*cosd(l1-l2));
	L2 += P;
	var L3 = l3 + 0.165*sind(l3-pi3) + 0.091*sind(l3-pi4) - 0.069*sind(l2-l3) + 0.038*sind(pi3-pi4) + 0.018*sind(2*(l3-l4));
	var B3 = atand(0.0032*sind(L3-om3) - 0.0017*sind(L3-psi) + 0.0007*sind(L3-om4));
	var R3 = 14.9883*(1 - 0.0014*cosd(l3-pi3) - 0.0008*cosd(l3-pi4) + 0.0006*cosd(l2-l3));
	L3 += P;
	var L4 = l4 + 0.843*sind(l4-pi4) + 0.034*sind(pi4-pi3) - 0.033*sind(psi-13.470) - 0.032*sind(G) - 0.019*sind(l4-pi3);
	var B4 = atand(-0.0077*sind(L4-psi) + 0.0044*sind(L4-om4) - 0.0005*sind(L4-om3));
	var R4 = 26.3627*(1 - 0.0074*cosd(l4-pi4));
	L4 += P;
	psi += P;
	var I = 3.1203 + 0.0006*(jday-2415020)/36525; var sinI = sind(I); var cosI = cosd(I);
	var Xi = [R1*cosd(L1-psi)*cosd(B1), R2*cosd(L2-psi)*cosd(B2), R3*cosd(L3-psi)*cosd(B3), R4*cosd(L4-psi)*cosd(B4), 0];
	var Yi = [R1*sind(L1-psi)*cosd(B1), R2*sind(L2-psi)*cosd(B2), R3*sind(L3-psi)*cosd(B3), R4*sind(L4-psi)*cosd(B4), 0];
	var Zi = [R1*sind(B1),R2*sind(B2),R3*sind(B3),R4*sind(B4),1];
	var T = (jday/2451545.0)/36525;	// (31.1)
	// get OM (longitude of node of Jup) and i (inclination) from table 31.A, precalc sines and cosines
	var OM = 100.464 + 1.0210*T + 0.0004*T*T; var sinOM = sind(OM); var cosOM = cosd(OM);
	var PHI = psi - OM; var sinPHI = sind(PHI); var cosPHI = cosd(PHI);
	var incl = 1.3033 - 0.0055*T; var sini = sind(incl); var cosi=cosd(incl);
	var Ai1 = new Array(), Ai2 = new Array(), Bi1 = new Array(), Bi2 = new Array(), Ci1 = new Array(), Ci2 = new Array();
	for (var i = 4; i>=0; i--) {	// do several rotations on 4 real sats and fifth fictious satellite 
		Ai1[i] = Xi[i];
		Bi1[i] = Yi[i]*cosI - Zi[i]*sinI;
		Ci1[i] = Yi[i]*sinI + Zi[i]*cosI;
		Ai2[i] = Ai1[i]*cosPHI - Bi1[i]*sinPHI;
		Bi2[i] = Ai1[i]*sinPHI + Bi1[i]*cosPHI;
		Ci2[i] = Ci1[i];
		Ai1[i] = Ai2[i];	// A3, B3, C3; reuse the arrays
		Bi1[i] = Bi2[i]*cosi - Ci2[i]*sini;
		Ci1[i] = Bi2[i]*sini + Ci2[i]*cosi;
		Ai2[i] = Ai1[i]*cosOM - Bi1[i]*sinOM;	// A4, B4, C4
		Bi2[i] = Ai1[i]*sinOM + Bi1[i]*cosOM;
		Ci2[i] = Ci1[i];
		Ai1[i] = Ai2[i]*sinlon - Bi2[i]*coslon;	// A5, B5, C5
		Bi1[i] = Ai2[i]*coslon + Bi2[i]*sinlon;
		Ai2[i] = Ai1[i];	// A6, B6, C6
		Bi2[i] = Ci1[i]*sinlat + Bi1[i]*coslat;
		Ci2[i] = Ci1[i]*coslat - Bi1[i]*sinlat;
	}
	var D = atan2d(Ai2[4], Ci2[4]); var sinD = sind(D); var cosD = cosd(D);
	for (var j = 0; j<4; j++) {	// finally calculate X, Y, Z in units of Jup. radius
		x = Ai2[j]*cosD - Ci2[j]*sinD;
		y = Ai2[j]*sinD + Ci2[j]*cosD;
		z = Bi2[j];
		if (shadow) {
			sat[j+1].shx = x; sat[j+1].shy = y; sat[j+1].shz = z; 
		}
		else {
			sat[j+1].x = x; sat[j+1].y = y; sat[j+1].z = z; 
		}
	}
}	// JupSat()


function JupSitu() {
	// detect situation (sat xyz, shadow xyz, eclipses, ..)
	var jday = jd(observer);
	JupPhys(jday);
	jupiter.grs_vis = (Math.abs(jupiter.grs_a)<73);	// practical limit of visibility of GRS 
	JupSat(jday,false);
	JupSat(jday,true);
	JupDat(jday,observer);
	SunDat(jday,observer);
	for (var i = 1; i<=4; i++) {
		sat[i].eclipsed = false; sat[i].shad_vis = false;
		var y1 = 1.0714*sat[i].shy;	// compensate for flattening of Jupiter
		var x = sat[i].shx;	// x AS SEEN from Sun, to be corrected for transits
		if (x*x + y1*y1 < 1) {	// either shadow transit or eclipse
			if (sat[i].shz < 0) {	// shadow transit, calculate earth  perspective of shadows
				// simplified rotation, rotate in longitude only, error small as lon-lon0 always less than 12 deg.
				var xlimb = Math.sqrt(1-y1*y1);
				var a = asind(x/xlimb);	// relative angle of shadow from central meridian (as seen from Sun)
				a = a - jupiter.lon + jupiter.lon0; // rotate to Earth 
				if (Math.abs(a)<90) {	// is visible from Earth
					sat[i].shad_vis = true;
					sat[i].shx = xlimb*sind(a);
				}
			}
			else {
				sat[i].eclipsed = true;
			}
		}
	}
}


function searchEvents(jday,span) {
	// search transit, shadow transits, eclipses, occultations and grs transits
	var events = new Array();	// store all events as records of jd,satnumber (0=GRS),type,true if begin
								// type: 0 = transit; 1 = occultation; 2 = shadow tr, 3 = eclipse
	var stepsize = 0.07; 
	var grs_step = 870.27*stepsize;	// angle rotated during stepsize
	var jd = jday-2*stepsize, jd1;
	var x0, x1, x2, y0, y1, y2;
	var sat0 = new Array(new Object(),new Object(),new Object(),new Object(),new Object());
	var sat1 = new Array(new Object(),new Object(),new Object(),new Object(),new Object());
	var oldsys2 = jupiter.sys2;
	JupPhys(jd);
	JupSat(jd,false);
	JupSat(jd,true);
	while (jd < jday+span) {
		for (var i=1; i<=4; i++) {	// save old state, in particular x,y,z,shx,shy,shz
			for (var j in sat1[i]) {sat0[i][j] = sat1[i][j]};
			for (var j in sat[i]) {sat1[i][j] = sat[i][j]};
		}
		oldsys2 = jupiter.sys2;
		jd1 = jd;
		jd += stepsize;
		JupPhys(jd);
		if (rev2(jupiter.sys2-jupiter.grs_lon) < 0) {	// rev2 normalizes to [-180:180]
			if (rev2(jupiter.sys2+grs_step-jupiter.grs_lon) > 0) {	// grs transits before next time step
				events[events.length] = new Array(jd+rev2(jupiter.grs_lon-jupiter.sys2)/870.27,0,0,true);
			}
		}
		JupSat(jd,false);
		JupSat(jd,true);
		for (var i = 1; i <= 4; i++) {
			x0 = sat0[i].x; x1 = sat1[i].x; x2 = sat[i].x;
			y0 = 1.0714*sat0[i].y; y1 = 1.0714*sat1[i].y; y2 = 1.0714*sat[i].y;
//			if (Math.abs(x1) <= Math.abs(x0) && Math.abs(x1) < Math.abs(x2)) {
			if (x1*x2 < 0) {
				var jc = nzero(x0,x1,x2);	// time relative [-1:1] at x=0
				var yc = interpol(jc,y0,y1,y2);	// y at x=0
				if (Math.abs(yc) < 1) {
					var xi = SGN(x0)*Math.sqrt(1-yc*yc);	// 1st guess at x for ingress
					var ji = nzero(x0-xi,x1-xi,x2-xi);
					var yi = interpol(ji,y0,y1,y2);
					xi = SGN(x0)*Math.sqrt(1-yi*yi);	// 2nd iter.
					ji = nzero(x0-xi,x1-xi,x2-xi);
					var je = jc + (jc-ji);	// egress time assuming symmetry
					events[events.length] = new Array(jd1+ji*stepsize,i,(sat[i].z<0?0:1),true);	// 
					events[events.length] = new Array(jd1+je*stepsize,i,(sat[i].z<0?0:1),false);	// 
				}
			}
			// check for shadow event in a similar way
			x0 = sat0[i].shx; x1 = sat1[i].shx; x2 = sat[i].shx;
			y0 = 1.0714*sat0[i].shy; y1 = 1.0714*sat1[i].shy; y2 = 1.0714*sat[i].shy;
			if (Math.abs(x1) <= Math.abs(x0) && Math.abs(x1) < Math.abs(x2)) {
				var jc = nzero(x0,x1,x2);	// time relative [-1:1] at x=0
				var yc = interpol(jc,y0,y1,y2);	// y at x=0
				if (Math.abs(yc) < 1) {
					var xi = SGN(x0)*Math.sqrt(1-yc*yc);	// 1st guess at x for ingress
					var ji = nzero(x0-xi,x1-xi,x2-xi);
					var yi = interpol(ji,y0,y1,y2);
					xi = SGN(x0)*Math.sqrt(1-yi*yi);	// 2nd iter.
					ji = nzero(x0-xi,x1-xi,x2-xi);
					var je = jc + (jc-ji);	// egress time assuming symmetry
					events[events.length] = new Array(jd1+ji*stepsize,i,(sat[i].shz<0?2:3),true);	// 
					events[events.length] = new Array(jd1+je*stepsize,i,(sat[i].shz<0?2:3),false);	// 
				}
			}
		}
	}

	isort(events);	// put in chronological order
	// filter some non-visible events
	var t, m;
	var occ = [false,false,false,false];	// track if occultation for moon i is in progress
	var ecl = [false,false,false,false];	// track if eclipse for moon i is in progress
	for (var i = 0; i < events.length; i++) {	// length may change!!
		t = events[i][2]; m = events[i][1];
		if (t==1) occ[m] = events[i][3];	// mark if occultation is in progress
		else if (t==3) ecl[m] = events[i][3];	// mark if eclipse in progress
		if ((occ[m] && t==3) || (ecl[m] && t==1)) {		// delete array element
			events.splice(i,1);
			i--;
		}
	}
	return events;
}

