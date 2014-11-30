// drawing functions

var  winw = 700, winh = 220;
var jupx = winw/2, jupy = winh/2;	// jupiter fixed position
var xbig = 75; xsmall = 12;	// pixels per jup radius
var zoom = false;	// true if zoomed-in
var satvisible = "#fff", sateclipsed = "#03a";	// colours of satellites
var cont;	// shortcut to container <div> node
var jup,jupi,grs,grsi;	// <div> and <img> nodes
var moon = new Array();	// <div> nodes for satellites
var shad = new Array();	// <div> nodes for shadows


function textelem(label,x,y,l,d) {	// constructor for text-elements
	this.label = label;
	this.x = x;
	this.y = y;
	this.l = l;	// lenght of value
	this.d = d;	// digits after comma
	this.node = document.createElement("p");
	this.node.style.position = "absolute";
	this.node.style.margin = 0 + "px";
	this.node.style.left = x + "px";
	this.node.style.top = y + "px";
	this.node.style.color = "#fff";
	this.node.style.fontFamily = "monospace";
	this.node.style.fontSize = "12px";
	this.node.style.whiteSpace = "pre";
	this.t = document.createTextNode(label);
	this.node.appendChild(this.t);
}

var ALT = 0, AZ = 1, SUNALT = 2, SYS1 = 3, SYS2 = 4, DE = 5, TIMER = 5;

var texts = new Array(
				new textelem("Jup Alt:",5,winh-30,6,1),
				new textelem("Jup Az: ",5,winh-45,6,1),
				new textelem("Sun Alt:",5,winh-15,6,1),
				new textelem("CM System I :",winw-140,winh-30,6,1),
				new textelem("CM System II:",winw-140,winh-15,6,1)
//				,new textelem("dt  :",winw-120,winh-45,6,3)	// uncomment to enable timer
				);


function drawJup() {
	if (!jup) {	// if node doesn't exist, create it
		jup = document.createElement("div");
		jup.style.position = "absolute";
		jup.style.zIndex = "5";
		jupi = document.createElement("img");
		jup.appendChild(jupi);
		cont.appendChild(jup);
	}
	jupi.setAttribute("src",zoom?"jupiter-150.png":"jupiter-24.png");
	jup.style.left = jupx - (zoom?xbig+5:xsmall+1) + "px";
	jup.style.top = jupy - (zoom?xbig+5:xsmall+1) + "px";
}

	
function drawGRS() {	// draw the Great Red Spot
	var scale = zoom?xbig:xsmall;
	if (!grs) {	// if element doesn't exist
		grs = document.createElement("div");
		grs.style.position = "absolute";
		grs.style.zIndex = "6";
		grs.style.top = jupy+13 + "px";
		grsi = document.createElement("img");
		grsi.setAttribute("src","grs.png");
		grs.appendChild(grsi);
		cont.appendChild(grs);
	}
	if (!zoom) {
		grs.style.visibility = "hidden"; 
		return;
	}	// only show on zoomed image
	var sqz = cosd(jupiter.grs_a);	// how much is the GRS 'squeezed'?
	var xg = 0.94*sind(jupiter.grs_a);	// 0.94 = half width of Jupiter at GRS latitude
	grs.style.left = Math.round(jupx+xg*scale-14*sqz) + "px";
	grs.style.visibility = jupiter.grs_vis?"visible":"hidden";
	if (jupiter.grs_vis) {	// IE6 errors if width set for hidden image
		grsi.style.width = Math.round(27*sqz) + "px";	// squeeze GRS if off-center
		grsi.style.height = "17px";
	}
}


function drawSat(sat) {
// paint sat n (dark blue if eclipsed), occult true if sat further away than jup (then potentially occulted)
	var n = sat.no-1;
	var scale = zoom?xbig:xsmall;
	if (!moon[n]) {		// create elements
		moon[n] = new Array();	// two divs needed to draw round moon, and a <p> for the text
		for (var i=0;i<3;i++) {
			moon[n][i] = document.createElement(i==2?"p":"div");
			moon[n][i].style.position = "absolute";
			moon[n][i].style.zIndex = "8";
			if (i==2) {	// create <p> element with sat number
				moon[n][2].style.margin = 0 + "px";
				moon[n][2].appendChild(document.createTextNode(n+1+""));
				moon[n][2].style.color = "#f00";
				moon[n][2].style.fontSize = "12px";
			}
			else {
				if (n==2 || n==3) var a1=1;	// Callisto and Ganym. are bigger than the two inner sats.
				else var a1=0;
				moon[n][i].style.width = 2+2*i+a1 + "px";
				moon[n][i].style.height = 4-2*i+a1 + "px";
				moon[n][i].style.fontSize = "1px";	// ie6 bug fix
			}	
			cont.appendChild(moon[n][i]);
		}
	}
	for (var i=0;i<2;i++) {
		moon[n][i].style.visibility = (sat.vis?"visible":"hidden");
		if (!sat.vis) continue;
		moon[n][i].style.zIndex = (sat.z>0) ? "1" : "8";	// sat is further away than jup
		moon[n][i].style.left = (jupx+sat.x*scale-1-i) + "px";
		moon[n][i].style.top = (jupy-sat.y*scale-2+i) + "px";
		moon[n][i].style.background = sat.eclipsed?sateclipsed:satvisible;		
	}
	moon[n][2].style.visibility = (sat.vis?"visible":"hidden");
	if (!sat.vis) return;
	moon[n][2].style.zIndex = (sat.z>0?"1":"8");	// sat is further away than jup
	moon[n][2].style.left = (jupx+sat.x*scale) + "px";
	moon[n][2].style.top = (jupy-sat.y*scale+3) + "px";
}	// drawSat()
	

function drawShad(sat) {
// paint black shadow for sat n
	var n = sat.no-1;
	var scale = zoom?xbig:xsmall;
	if (!shad[n]) {		// create elements
		shad[n] = new Array();	// two divs needed to draw round shadow
		for (var i=0;i<3;i++) {
			shad[n][i] = document.createElement(i==2?"p":"div");
			shad[n][i].style.position = "absolute";
			shad[n][i].style.zIndex = "7";
			if (i==2) {
				shad[n][2].style.margin = 0 + "px";
				shad[n][2].appendChild(document.createTextNode(n+1+""));
				shad[n][2].style.color = "#444";
				shad[n][i].style.fontSize = "12px";
			}
			else {
				if (n==2 || n==3) var a1=1;
				else var a1=0;
				shad[n][i].style.background = "black";		
				shad[n][i].style.width = 2+2*i+a1 + "px";
				shad[n][i].style.height = 4-2*i+a1 + "px";
				shad[n][i].style.fontSize = "1px";	// ie6 bug fix
			}
			cont.appendChild(shad[n][i]);
		}
	}
	for (var i=0;i<2;i++) {
		shad[n][i].style.visibility = (sat.shad_vis?"visible":"hidden");
		shad[n][i].style.left = jupx+sat.shx*scale-1-i + "px";
		shad[n][i].style.top = jupy-sat.shy*scale-2+i + "px";
	}
	shad[n][2].style.visibility = (sat.shad_vis?"visible":"hidden");
	shad[n][2].style.left = jupx+sat.shx*scale + "px";
	shad[n][2].style.top = jupy-sat.shy*scale+3 + "px";
}


function writeDat() {
// write data to window
	for (var i=0; i<texts.length; i++) {
		var n = texts[i];
		if (!n.init) {
			cont.appendChild(n.node);
			n.init=true;
		}
		switch (i) {
			case ALT: var v = jupiter.alt; break;
			case AZ: var v = jupiter.az; break;
			case SUNALT: var v = sun.alt; break;
			case SYS1: var v = jupiter.sys1; break;
			case SYS2: var v = jupiter.sys2; break;
			case TIMER: var v = dt; break;	// used for performence measurement
			default: v = 0; break;
		}
		n.t.data = n.label + fixnum(v,n.l,n.d);
	}
}


function updateDisplay() {
	JupSitu();
	if (jupiter.grs_vis || jupiter.grs_displayed) {
		drawGRS();
		jupiter.grs_displayed = jupiter.grs_vis;
	}
	for (var i=1; i<=4; i++) {
		sat[i].vis = (zoom && (sat[i].x<-4.66 || sat[i].x>4.66)) ? false : true;	// clip if zoomed
		if (sat[i].vis || sat[i].displayed) {	// if displayed it may need to be hidden
	 		drawSat(sat[i]);
	 	}
	 	sat[i].displayed = sat[i].vis;
	 	if (sat[i].shad_vis || sat[i].shad_displayed) {
	 		drawShad(sat[i]);
	 	}
	 	sat[i].shad_displayed = sat[i].shad_vis;
	}
	writeDat();
//	tbl.iox.value = fixnum(sat[1].x,6,2);
//	tbl.ioy.value = fixnum(sat[1].y,6,2);
//	tbl.ioz.value = fixnum(sat[1].z,6,2);
//	tbl.iosx.value = sat[1].shx;
//	tbl.iosy.value = sat[1].shy;
//	tbl.iosz.value = sat[1].shz;
}


function j_init() {
	cont = document.getElementById("container");
	drawJup();
}

