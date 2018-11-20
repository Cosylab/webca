// called on page unload so the page will be refreshed on back button actions
function cleanup() {}

function drawLegend( waveforms ) {

	var canvas = document.getElementById( "legend" );
	var context = canvas.getContext( "2d" );
	context.clearRect( 0, 0, canvas.width, canvas.height );

	var n = waveforms.length;
	if (n == 0)
		return;
		
// TODO only once
CanvasTextFunctions.enable(context);

	var space = 32;
	var width = canvas.width - space;
	var xscale = width / n;
	var offset = space / 2;

	var py = offset;
	var fs = 10;
	var fsDiv2 = fs/2;
	
	for ( var iWaveform = 0 ; iWaveform < n ; iWaveform++ ) {
		var waveform = waveforms[iWaveform];
		
		var px = offset + iWaveform * xscale;
		
		context.fillStyle = waveform.color;
		context.strokeStyle = waveform.color;
		context.fillRect(px, py - fsDiv2, space, fs);
		
		context.drawText("sans", fs, px + space + fs, py + fsDiv2, waveform.name);
	}

}




var yaxisDrawnMin = -1/0;
var yaxisDrawnMax = 1/0;
function drawYAxis( mintime, maxtime ) {

	// check limits
	if (!mintime || !maxtime || isNaN(mintime) || isNaN(maxtime) || mintime==(1/0) || maxtime==(-1/0) || mintime == maxtime)
		return;
		
	// if we really need to redraw
	if (yaxisDrawnMin == mintime && yaxisDrawnMax == maxtime)
		return;
		
	yaxisDrawnMin = mintime;
	yaxisDrawnMax = maxtime;

	var canvas = document.getElementById( "xAxis" );
	var context = canvas.getContext( "2d" );
	context.clearRect( 0, 0, canvas.width, canvas.height );


// TODO only once
CanvasTextFunctions.enable(context);

	var free_space = 10.0;
	var width = canvas.width - free_space;
	if (width < free_space)
		return;
	var ltc = new LinearTickCollector(mintime, maxtime, 100 /*tickSpacing*/, width, false);
	var ticks = ltc.calculateTicks();

	// any ticks to draw...
	if ((ticks == null) || (ticks.length < 1)) {
		return;
	}


	var n = ticks.length;
	
	var span = maxtime - mintime;
	var scale = (canvas.width + 0.0) / span;

	context.strokeStyle = "black";
	
	// find max. length text
	var tick; var i; 
	var space = 3;
	var ticklen = 10;
	var ticklenDiv2 = ticklen / 2;
    
	var fs = 10;
	var dist = ticklen + space + fs;

	var x, val;
	
	for(i = 0; i < n; i++) {
		tick = ticks[i];

		val = tick.proportional * span;
		x = scale * val;
	
		if(tick.major) {
			
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, ticklen);
			context.stroke();
			
			if (tick.text != "" || tick.text == "0")
			{
				var date = new Date(); date.setTime(Number(tick.text));
				var strTime = "";
				if (date.getHours() < 10)
					strTime += "0"
				strTime += date.getHours() + ":";
				if (date.getMinutes() < 10)
					strTime += "0";
				strTime += date.getMinutes() + ":";
				if (date.getSeconds() < 10)
					strTime += "0";
				strTime += date.getSeconds();
				context.drawTextCenter("sans", fs, x, dist, strTime);
			}
				
		} else {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, ticklenDiv2);
			context.stroke();
		}
	}
}



var xaxisDrawnMin = -1/0;
var xaxisDrawnMax = 1/0;
function drawXAxis( minval, maxval ) {

	// check limits
	if (!minval || !maxval || isNaN(minval) || isNaN(maxval) || minval==(1/0) || maxval==(-1/0) || minval == maxval)
		return;
		
	// if we really need to redraw
	if (xaxisDrawnMin == minval && xaxisDrawnMax == maxval)
		return;
		
	xaxisDrawnMin = minval;
	xaxisDrawnMax = maxval;

	var canvas = document.getElementById( "yAxis" );
	var context = canvas.getContext( "2d" );
	context.clearRect( 0, 0, canvas.width, canvas.height );


// TODO only once
CanvasTextFunctions.enable(context);

	var free_space = 10.0;
	var height = canvas.height - free_space;
	if (height < free_space)
		return;
	var ltc = new LinearTickCollector(minval, maxval, 10 /*tickSpacing*/, height, false);
	var ticks = ltc.calculateTicks();

	// any ticks to draw...
	if ((ticks == null) || (ticks.length < 1)) {
		return;
	}


	var n = ticks.length;
	
	var span = maxval - minval;
	var scale = - (height / span);
	var vertical_shift = (canvas.height-free_space/2) - scale * minval;

	context.strokeStyle = "black";
	var digits = 3; // precision
	
	// find max. length text
	var tick;
    var i; var maxi = 0; var s, maxs = 0;
	for(i = 0; i < n; i++) {
		tick = ticks[i];
		if (tick.text != "" || tick.text == "0")
		{
			// format
			tick.text = Number(tick.text).toPrecision(digits);
			
			s = context.measureText("sans",10,tick.text);
			if (s > maxs) { maxs=s; maxi = i; }
		}
	}
	
    var space = 3;
	var ticklen = 10;
	var ticklenDiv2 = ticklen / 2;
	var dist = ticklen + space;
	var len = canvas.width - dist;
	
	// find max. font size
	var str = "." + ticks[maxi].text + " ";
	for(i = 4; i < 12; i++) {
		s = context.measureText("sans",i,str);
		if (s > len)
		{
			i = i - 1;
			break;
		}
	}

	var fs = i;
	var fsDiv2 = fs / 2;

	var y, val;
	var x1l = canvas.width - ticklen;
	var x1s = canvas.width - ticklenDiv2;
	var x2 = canvas.width;
	
	for(i = 0; i < n; i++) {
		tick = ticks[i];

		val = tick.proportional * span + minval;
		y = scale * val + vertical_shift;
	
		if(tick.major) {
			
			context.beginPath();
			context.moveTo(x1l, y);
			context.lineTo(x2, y);
			context.stroke();
			
			if (tick.text != "" || tick.text == "0")
				context.drawTextRight("sans", fs, len, y + fsDiv2, tick.text);
				
		} else {
			context.beginPath();
			context.moveTo(x1s, y);
			context.lineTo(x2, y);
			context.stroke();
		}
	}
}

function plot( waveforms ) {
	var canvas = document.getElementById( "Plot" );
	var context = canvas.getContext( "2d" );
	context.clearRect( 0, 0, canvas.width, canvas.height );
	context.save();
	
	if (waveforms.length == 0)
		return;
	
	var time_min = waveforms[0].oldestTime;
	var time_max = waveforms[0].latestTime;
	var value_min = waveforms[0].min;
	var value_max = waveforms[0].max;
	for ( var iWaveform = 1 ; iWaveform < waveforms.length ; iWaveform++ ) {
		var waveform = waveforms[iWaveform];

		if (waveform.oldestTime > time_min) time_min = waveform.oldestTime;	// we are searching for max min
		if (waveform.latestTime > time_max) time_max = waveform.latestTime;

		if (waveform.max > value_max) value_max = waveform.max;
		if (waveform.min < value_min) value_min = waveform.min;
	}
	
	// no data...
	if (value_min == 1/0)
		return;

	drawXAxis(value_min, value_max);
	drawYAxis(time_min, time_max);

	var free_space = 10.0;
	var scale, vertical_shift;
	if (value_max == value_min)
	{
		scale = 0;
		vertical_shift = (canvas.height-free_space/2) / 2.0;
	}
	else
	{
		scale = - ((canvas.height-free_space) / (value_max - value_min));
		vertical_shift = (canvas.height-free_space/2) - scale * value_min;
	}
	
	var xScale;
	if (time_max == time_min)
		xScale = 0;
	else
		xScale = (canvas.width + 0.0) / (time_max - time_min);

	
	for ( var iWaveform = 0 ; iWaveform < waveforms.length ; iWaveform++ ) {
		var waveform = waveforms[iWaveform];
		var x_max = waveform.elements;
		if (x_max == 0)
			continue;
		//var xScale = canvas.width / (x_max - 1);	// not right w/ timestamps!
		var pos = (waveform.elements == waveform.data.length) ? waveform.pos : 0;
		
		context.strokeStyle = waveform.color;
		context.beginPath();
		context.moveTo( xScale * (waveform.time[pos] - time_min), scale * waveform.data[pos] + vertical_shift );
		for ( var x = 1 ; x < x_max ; x++ ) {
			pos = (pos + 1) % x_max;
			var y = scale * waveform.data[pos] + vertical_shift;
//			context.lineTo( x * xScale, y );

			var px = xScale * (waveform.time[pos] - time_min);
			context.lineTo( px, y );
		}
		context.stroke();
	}
	
	/* 
	// scatter
	var px,py;
	for ( var iWaveform = 0 ; iWaveform < waveforms.length ; iWaveform++ ) {
		var waveform = waveforms[iWaveform];
		var x_max = waveform.elements;
		if (x_max == 0)
			continue;
		//var xScale = canvas.width / (x_max - 1);	// not right w/ timestamps!
		var pos = (waveform.elements == waveform.data.length) ? waveform.pos : 0;
		
	//	context.strokeStyle = waveform.color;
		context.fillStyle = waveform.color;
		px = xScale * (waveform.time[0] - time_min);
		py = scale * waveform.data[0] + vertical_shift;
		context.fillRect(px-3, py-3, 7, 7);
//		context.beginPath();
//		context.moveTo( ,  );
		for ( var x = 1 ; x < x_max ; x++ ) {
			pos = (pos + 1) % x_max;
			py = scale * waveform.data[pos] + vertical_shift;
//			context.lineTo( x * xScale, y );

			px = xScale * (waveform.time[pos] - time_min);
			context.fillRect(px-3, py-3, 7, 7);
		}
//		context.stroke();
	}
*/
	context.restore();
}


function Waveform( name, n, color ) {
	this.name = name;
	this.data = new Array(n);
	this.time = new Array(n);
	this.oldestTime = 0;
	this.latestTime = 0;
	this.color = color;
	this.min = 1.0/0;
	this.max = -1.0/0;
	this.pos = 0;	// next index to be used, oldest
	this.elements = 0; 
}

var waveforms = new Array();

function handleMonitor( userInfo, pvName, values, status, severity, timestamp )
{
	var wf = waveforms[userInfo];

	if (wf.data[wf.pos] == wf.max)
	{
		// we are removing max element, find new one
		var l = wf.elements;
		var vmax = -1.0/0;
		var pos = (wf.elements == wf.data.length) ? wf.pos : 0;
		for ( var x = 1 ; x < l ; x++ ) {
			pos = (pos + 1) % l;
			if (wf.data[pos] > vmax) vmax = wf.data[pos];
		}
		wf.max = vmax;
	}
	if (values > wf.max) wf.max = values;


	if (wf.data[wf.pos] == wf.min)
	{
		// we are removing min element, find new one
		var l = wf.elements;
		var vmin = 1.0/0;
		var pos = (wf.elements == wf.data.length) ? wf.pos : 0;
		for ( var x = 1 ; x < l ; x++ ) {
			pos = (pos + 1) % l;
			if (wf.data[pos] < vmin) vmin = wf.data[pos];
		}
		wf.min = vmin;
	}
	if (values < wf.min) wf.min = values;
	
	var wrapped = (wf.elements == wf.data.length);
	wf.data[wf.pos] = values;
	wf.time[wf.pos] = timestamp;
	wf.pos = (wf.pos + 1) % wf.data.length;
	wf.oldestTime = wrapped ? wf.time[wf.pos] : wf.time[0];
	if (!wrapped) wf.elements++; 
	wf.latestTime = timestamp;
		
	plot(waveforms);

	return true;
} 

function handleEvents(epicsPlugin) {
	epicsPlugin.pendEvents();

    // 50Hz
    setTimeout(function() { handleEvents(epicsPlugin); }, 20);
}

function run() {
	
	// get scriptable object
	var epicsPlugin = document.getElementById("EPICSPlugin");

	// handle events
	handleEvents(epicsPlugin);


	// initialize 2
	var points = 100;
	waveforms.push(new Waveform("gen01:noise", points, "red"));
	waveforms.push(new Waveform("MEBT_Mag:QH01:B", points, "blue"));
	waveforms.push(new Waveform("MEBT_Mag:QH03:B", points, "green"));
	plot(waveforms);

	drawLegend(waveforms);

	var i;
	for (i = 0; i < waveforms.length; i++)
		epicsPlugin.monitorPV(waveforms[i].name, "handleMonitor", i);

}

