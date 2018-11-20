XyChartFastImpl = function(elementId, width, height, xAxisStyle, pvNames) {

    XyChartFastImpl.superclass.constructor.call(this, elementId);
    
    this.yaxisDrawnMin = Number.NEGATIVE_INFINITY;
    this.yaxisDrawnMax = Number.POSITIVE_INFINITY;
    this.xaxisDrawnMin = Number.NEGATIVE_INFINITY;
    this.xaxisDrawnMax = Number.POSITIVE_INFINITY;
    
    this.xAxisStyle = xAxisStyle;
    this.pvNames = pvNames;
    this.isTrend = (this.xAxisStyle == 'time');
    this.xyType = (pvNames && pvNames.length && pvNames[0]["xName"]);
    
    this.waveforms = new Array();
	this.topElement = document.getElementById(elementId);

	var table = document.createElement("table");
	table.setAttribute("cellspacing", "0");
	table.setAttribute("cellpadding", "0");
	this.topElement.appendChild(table);
	
	var tableBody = document.createElement("tbody");
	table.appendChild(tableBody);

	var row1 = document.createElement("tr");
	var row2 = document.createElement("tr");
	var row3 = document.createElement("tr");
	tableBody.appendChild(row1);
	tableBody.appendChild(row2);
	tableBody.appendChild(row3);

	var cell11 = document.createElement("td");
	var cell12 = document.createElement("td");
	var cell21 = document.createElement("td");
	var cell22 = document.createElement("td");
	var cell31 = document.createElement("td");
	var cell32 = document.createElement("td");
	row1.appendChild(cell11);
	row1.appendChild(cell12);
	row2.appendChild(cell21);
	row2.appendChild(cell22);
	row3.appendChild(cell31);
	row3.appendChild(cell32);
	
    this.yAxisContainer = cell11;
    this.plotContainer = cell12;
    this.xAxisContainer = cell22;
    this.legendContainer = cell32;

	this.resize(width, height);
	
	this.drawXAxisTicked = function(canvas,minval,maxval) {
		var context = canvas.context2d;
		context.clearRect( 0, 0, canvas.width, canvas.height );

		// TODO only once
		//CanvasTextFunctions.enable(context);

		var free_space = 10.0;
		var width = canvas.width - free_space;
		if (width < free_space)
			return;
		var ltc = new LinearTickCollector(minval, maxval, (this.isTrend ? 100 : 5) /*tickSpacing*/, width, false);
		var ticks = ltc.calculateTicks();

		// any ticks to draw...
		if ((ticks == null) || (ticks.length < 1)) {
			return;
		}

		var n = ticks.length;
		
		var span = maxval - minval;
		var scale = (canvas.width + 0.0) / span;

		context.strokeStyle = "black";
		
		// find max. length text
		var tick; var i; 
		var space = 3;
		var ticklen = 10;
		var ticklenDiv2 = ticklen / 2;
	    
		var fs = 9;
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
				
				if (tick.text != "" || tick.text == "0") {
					if (this.isTrend) {
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
					} else
						context.drawTextCenter("sans", fs, x, dist, ""+tick.text);
				}
			} else {
				context.beginPath();
				context.moveTo(x, 0);
				context.lineTo(x, ticklenDiv2);
				context.stroke();
			}
		}
	};

	this.drawXAxisIndexed = function(canvas,minval,maxval) {
		var context = canvas.context2d;
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.strokeStyle = "black";
		
		var span = maxval - minval;
		var scale = 0;
		var majorStep = 1;
		if (minval < maxval) {
			scale = (canvas.width + 0.0) / span;
		
			if (span > 10) {
				var t = 10;
				do {
					majorStep = Math.round(span / t--);
				} while (t > 0 && majorStep < 4);
			}
		}
		
		var x = 0;
		var majorTickLen = 10;
		var minorTickLen = majorTickLen/2;
		var majorIndex = minval;
		var fs = 10;
		var maxMajorX = canvas.width - context.measureText("sans", fs, "" + maxval) * 1.5; 
		
		for (var i = minval; i <= maxval; i++) {
			var ticklen = minorTickLen;
			if (i == majorIndex || i == maxval) {
				ticklen = majorTickLen;
				majorIndex += majorStep;

				var drawText = new String(i);
				var drawX = x;
				if (i == minval) 
					context.drawText("sans", fs, x, majorTickLen * 2 + minorTickLen, drawText);
				else if (i == maxval)
					context.drawTextRight("sans", fs, x, majorTickLen * 2 + minorTickLen, drawText);
				else if (x < maxMajorX || majorStep == 1) 
					context.drawTextCenter("sans", fs, x, majorTickLen * 2 + minorTickLen, drawText);
			}
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, ticklen);
			context.stroke();
			x += scale;
		}
	};
	
	this.plotChartLine = function(context, waveform, xVal_min, scale, vertical_shift, xScale) {
		var x_max = waveform.elements;
		if (x_max == 0)	return;
		var pos = (waveform.elements == waveform.data.length) ? waveform.pos : 0;
		
		var px = xScale * (this.isTrend ? (waveform.time[pos] - xVal_min) : 0);
		var py = scale * waveform.data[pos] + vertical_shift;
		context.strokeStyle = waveform.color;
		context.beginPath();
		context.moveTo( px, py );
		for (var x = 1 ; x < x_max ; x++) {
			pos = (pos + 1) % x_max;
			py = scale * waveform.data[pos] + vertical_shift;

			px = xScale * (this.isTrend ? (waveform.time[pos] - xVal_min) : x);
			context.lineTo( px, py );
		}
		context.stroke();
	};

	this.plotChartScatter = function(context, waveform, xVal_min, scale, vertical_shift, xScale) {
		// scatter
		var x_max = waveform.elements;
		if (x_max == 0) return;
		var pos = (waveform.elements == waveform.data.length) ? waveform.pos : 0;
		
		var px = xScale * (this.isTrend ? (waveform.time[pos] - xVal_min) : 0);
		var py = scale * waveform.data[pos] + vertical_shift;
		context.fillStyle = waveform.color;
		context.fillRect(px-2, py-2, 5, 5);
		for (var x = 1 ; x < x_max ; x++) {
			pos = (pos + 1) % x_max;
			py = scale * waveform.data[pos] + vertical_shift;

			px = xScale * (this.isTrend ? (waveform.time[pos] - xVal_min) : x);
			context.fillRect(px-2, py-2, 5, 5);
		}
		context.stroke();
	};
	
	this.findSeriesType = function(name){
		if (this.pvNames && this.pvNames.length){
			for (var i = 0; i < this.pvNames.length; i++)
				if (this.pvNames[i]["name"]==name)
					if(this.pvNames[i]["xName"]) return 'xy';
		}
		return 'y-only';
	};
	
	this.doPlot = function() {
		var canvas = this.plotCanvas;
		var context = canvas.context2d;
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.save();
		
		if (this.waveforms.length == 0)
			return;
		
		var xVal_min = Number.POSITIVE_INFINITY;
		var xVal_max = Number.NEGATIVE_INFINITY;
		var value_min = Number.POSITIVE_INFINITY;
		var value_max = Number.NEGATIVE_INFINITY;
		if( this.isTrend || !this.xyType ) {
			// y-only type
			xVal_min = Number.NEGATIVE_INFINITY; // since we are searching for max min (see below)
			for ( var iWaveform = 0 ; iWaveform < this.waveforms.length ; iWaveform++ ) {
				var waveform = this.waveforms[iWaveform];
				if (waveform.datatype == 'xy') continue;
				var curr_xVal_min = this.isTrend ? waveform.oldestTime : 0; // indexed X axis display is zero based 
				var curr_xVal_max = this.isTrend ? waveform.latestTime : waveform.elements;
		
				if (curr_xVal_min > xVal_min) xVal_min = curr_xVal_min;	// we are searching for max min
				if (curr_xVal_max > xVal_max) xVal_max = curr_xVal_max;
		
				if (waveform.max > value_max) value_max = waveform.max;
				if (waveform.min < value_min) value_min = waveform.min;
			}
		} else {
			// x-y type
			for ( var iWaveform = 0 ; iWaveform < this.waveforms.length ; iWaveform++ ) {
				var waveform = this.waveforms[iWaveform];
				if (waveform.datatype != 'xy') continue;
		
				if (waveform.minX < xVal_min) xVal_min = waveform.min;
				if (waveform.maxX > xVal_max) xVal_max = waveform.maxX;
		
				if (waveform.max > value_max) value_max = waveform.max;
				if (waveform.min < value_min) value_min = waveform.min;
			}
		}
		
		// no data...
		if (value_min == Number.POSITIVE_INFINITY)
			return;

		this.drawYAxis(false, value_min, value_max);
		this.drawXAxis(false, xVal_min, ((this.isTrend || this.xyType) ? xVal_max : xVal_max - 1));

		var free_space = 10.0;
		var scale, vertical_shift;
		if (value_max == value_min)	{
			scale = 0;
			vertical_shift = (canvas.height-free_space/2) / 2.0;
		} else {
			scale = - ((canvas.height-free_space) / (value_max - value_min));
			vertical_shift = (canvas.height-free_space/2) - scale * value_min;
		}
		
		var xScale;
		var xSpan = xVal_max - xVal_min;
		if (xVal_max == xVal_min)
			xScale = 0;
		else
			xScale = (canvas.width + 0.0) / (xSpan - (this.isTrend || this.xyType || (xSpan==1)? 0 : 1));

		var dataType = 'xy';
		if( this.isTrend || !this.xyType ) dataType = 'y-only';
		
		for (var iWaveform = 0 ; iWaveform < this.waveforms.length ; iWaveform++) {
			var waveform = this.waveforms[iWaveform];
			if (waveform.datatype == dataType){
				if (waveform.type != 'scatter' )
					this.plotChartLine(context, waveform, xVal_min, scale, vertical_shift, xScale);
				else
					this.plotChartScatter(context, waveform, xVal_min, scale, vertical_shift, xScale);
			}
		}
		
		context.restore();
	};
	
	this.updateChart = false;
	
	// assigning "self=this" is important, since intervalAction() when called by the browser has no concept of "this", i.e. this=window
	var self = this;
	function intervalAction() {
		if( self.updateChart ) {
			self.doPlot();
			self.updateChart = false;
		}
	};
	
	this.intervalId = setInterval( intervalAction, 100 );
};
YAHOO.lang.extend(XyChartFastImpl, XyChartImpl);

/* XyChartImpl interface */

XyChartFastImpl.prototype.plotTitleChanged = function(name) {
	XyChartFastImpl.superclass.plotTitleChanged.call(this, name);
    // TODO
};

XyChartFastImpl.prototype.axisXLabelChanged = function(name) {
	XyChartFastImpl.superclass.axisXLabelChanged.call(this, name);
    // TODO
};

XyChartFastImpl.prototype.axisXPropertiesChanged = function(timeScale, sizeLimit, valuesFormat) {
	XyChartFastImpl.superclass.axisXPropertiesChanged.call(this, timeScale, sizeLimit, valuesFormat);
    // TODO
};

XyChartFastImpl.prototype.axisYLabelChanged = function(name) {
	XyChartFastImpl.superclass.axisYLabelChanged.call(this, name);
    // TODO
};

XyChartFastImpl.prototype.axisYPropertiesChanged = function(timeScale, sizeLimit, valuesFormat) {
	XyChartFastImpl.superclass.axisYPropertiesChanged.call(this, timeScale, sizeLimit, valuesFormat);
    // TODO
};
 
XyChartFastImpl.prototype.redraw = function() {
	XyChartFastImpl.superclass.redraw.call(this);
    this.plot();    
};

XyChartFastImpl.prototype.resize = function(width, height) {
	XyChartFastImpl.superclass.resize.call(this, width, height);

	var maxBorderX = 60;
	var maxBorderY = 60;
	
	/* If very small chart use percentage for border, otherwise use absolute
	 * size.
	 */
	var borderX = maxBorderX; 
	if (width < 3 * maxBorderX) {
		borderX = width / 3;  
	} 

	var borderY = maxBorderY; 
	if (height < 3 * maxBorderY) {
		borderY = height / 3;  
	} 
	
	var plotWidth = width - borderX;
	var plotHeight = height - borderY;
	
	var yAxisWidth = borderX;
	var xAxisHeight = borderY / 2;
	var legendHeight = borderY / 2;

    this.yAxisCanvas = this.createCanvas(this.yAxisContainer, yAxisWidth, plotHeight);
    this.plotCanvas = this.createCanvas(this.plotContainer, plotWidth, plotHeight);
    this.xAxisCanvas = this.createCanvas(this.xAxisContainer, plotWidth, xAxisHeight);
    this.legendCanvas = this.createCanvas(this.legendContainer, plotWidth, legendHeight);
    
	// Unconditonal redraw.
	this.drawXAxis(true);
	this.drawYAxis(true);
	
	this.drawLegend();
    this.plot();
};

XyChartFastImpl.prototype.seriesNameChanged = function(index, name) {
	XyChartFastImpl.superclass.seriesNameChanged.call(this, index, name);
    
    this.allocateWaveforms(index);
    this.waveforms[index].name = name;
    this.waveforms[index].datatype = this.findSeriesType(name);
    this.drawLegend();    
};

XyChartFastImpl.prototype.seriesPropertiesChanged = function(index, color, type) {
	XyChartFastImpl.superclass.seriesPropertiesChanged.call(this, index, color, type);
    
    this.allocateWaveforms(index);
    this.waveforms[index].color = color;
    this.waveforms[index].type = type;
    this.drawLegend();    
    this.plot();
};

XyChartFastImpl.prototype.seriesDataReplaced = function(index, x, y) {
	XyChartFastImpl.superclass.seriesDataReplaced.call(this, index, x, y);
    
    this.allocateWaveforms(index);
   	var waveform = this.waveforms[index]; 
	
    if (!x && !y) {
    	waveform.oldestTime = 0;
	    waveform.latestTime = 0;
	    waveform.min = Number.POSITIVE_INFINITY;
    	waveform.max = Number.NEGATIVE_INFINITY;
	    waveform.pos = 0;
	    waveform.elements = 0;
    	this.plot();
    } else if (x && y) {
    	waveform.datatype = 'xy';
    	waveform.oldestTime = 0;
	    waveform.latestTime = 0;
	    waveform.data = y;
	    waveform.dataX = x;
	    waveform.pos = 0;
	    waveform.elements = y.length;
	    
	    // find min and max
	    waveform.min = Number.POSITIVE_INFINITY;
    	waveform.max = Number.NEGATIVE_INFINITY;
    	for (var i = 0; i < waveform.data.length; i++) {
    		if (waveform.data[i] < waveform.min) waveform.min = waveform.data[i];
    		if (waveform.data[i] > waveform.max) waveform.max = waveform.data[i];
    	}

	    // find min and max X
	    waveform.minX = Number.POSITIVE_INFINITY;
    	waveform.maxX = Number.NEGATIVE_INFINITY;
    	for (var i = 0; i < waveform.data.length; i++) {
    		if (waveform.dataX[i] < waveform.minX) waveform.minX = waveform.dataX[i];
    		if (waveform.dataX[i] > waveform.maxX) waveform.maxX = waveform.dataX[i];
    	}
    	
    	this.plot();
    }
};

XyChartFastImpl.prototype.seriesDataAppended = function(index, x, y) {
	XyChartFastImpl.superclass.seriesDataAppended.call(this, index, x, y);
    
    this.allocateWaveforms(index);
    this.handleMonitor(index, null, y, null, null, x);	
};

/* XyChartImpl interface end */

XyChartFastImpl.prototype.createCanvas = function(parent, width, height) {
	parent.innerHTML = "";
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	parent.appendChild(canvas);
	
	/* Init explorercanvas emulation for IE */
	if ((!canvas.getContext) && (typeof G_vmlCanvasManager != "undefined")) {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	
	canvas.context2d = canvas.getContext("2d");
    CanvasTextFunctions.enable(canvas.context2d);
	
	return canvas;
};

XyChartFastImpl.prototype.allocateWaveforms = function(maxIndex) {
    while (this.waveforms.length <= maxIndex) {
    	this.waveforms[this.waveforms.length] = new Waveform("", 100, "black");
    }
};

// called on page unload so the page will be refreshed on back button actions
XyChartFastImpl.prototype.cleanup = function() { clearInterval(this.intervalId); };

XyChartFastImpl.prototype.drawLegend = function() {

	var canvas = this.legendCanvas;
	var context = canvas.context2d;
	context.clearRect( 0, 0, canvas.width, canvas.height );

	var dataType = 'xy';
	if (this.isTrend || !this.xyType) dataType = 'y-only';
	
	var n = 0;
	for (var iWaveform = 0 ; iWaveform < this.waveforms.length; iWaveform++)
		if (this.waveforms[iWaveform].datatype == dataType) n++;
	
	if (n == 0)
		return;
		
// TODO only once
//CanvasTextFunctions.enable(context);

	var space = 32;
	var width = canvas.width - space;
	var xscale = width / n;
	var offset = space / 2;

	var py = offset;
	var fs = 10;
	var fsDiv2 = fs/2;
	var lCount = 0;
	
	for ( var iWaveform = 0 ; iWaveform < this.waveforms.length ; iWaveform++ ) {
		var waveform = this.waveforms[iWaveform];
		if (waveform.datatype != dataType) continue;
		
		var px = offset + lCount++ * xscale;
		
		context.fillStyle = waveform.color;
		context.strokeStyle = waveform.color;
		context.fillRect(px, py - fsDiv2, space, fs);
		
		context.drawText("sans", fs, px + space + fs, py + fsDiv2, waveform.name);
	}

};

XyChartFastImpl.prototype.drawXAxis =  function(forceRedraw, minval, maxval) {

	if (minval == null) {
		minval = this.xaxisDrawnMin;
	}
	if (maxval == null) {
		maxval = this.xaxisDrawnMax;
	}

	// check limits
	if ((this.xAxisType=='time' && !minval) || !maxval || isNaN(minval) || isNaN(maxval) 
			|| minval==Number.NEGATIVE_INFINITY || minval==Number.POSITIVE_INFINITY 
			|| maxval==Number.NEGATIVE_INFINITY || maxval==Number.POSITIVE_INFINITY 
			|| minval == maxval)
		return;
		
	// if we really need to redraw
	if (!forceRedraw && this.xaxisDrawnMin == minval && this.xaxisDrawnMax == maxval)
		return;
		
	this.xaxisDrawnMin = minval;
	this.xaxisDrawnMax = maxval;

	var canvas = this.xAxisCanvas;
	if (this.isTrend || this.xyType)
		this.drawXAxisTicked(this.xAxisCanvas,minval,maxval);
	else
		this.drawXAxisIndexed(this.xAxisCanvas,minval,maxval);
};

XyChartFastImpl.prototype.drawYAxis =  function(forceRedraw, minval, maxval) {

	if (minval == null) {
		minval = this.yaxisDrawnMin;
	}
	if (maxval == null) {
		maxval = this.yaxisDrawnMax;
	}

	// check limits
	if (!minval || !maxval || isNaN(minval) || isNaN(maxval) 
			|| minval==Number.POSITIVE_INFINITY || minval==Number.NEGATIVE_INFINITY 
			|| maxval==Number.NEGATIVE_INFINITY || maxval==Number.POSITIVE_INFINITY 
			|| minval == maxval)
		return;

	// if we really need to redraw
	if (!forceRedraw && this.yaxisDrawnMin == minval && this.yaxisDrawnMax == maxval)
		return;
		
	this.yaxisDrawnMin = minval;
	this.yaxisDrawnMax = maxval;

	var canvas = this.yAxisCanvas;
	var context = canvas.context2d;
	context.clearRect( 0, 0, canvas.width, canvas.height );

	// TODO only once
	//CanvasTextFunctions.enable(context);

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
		s = context.measureText("sans", i, str);
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
};

XyChartFastImpl.prototype.plot = function() {
	this.updateChart = true;
};


Waveform = function( name, n, color ) {
	this.name = name;
	this.data = new Array(n);
	this.dataX = new Array(n);
	this.time = new Array(n);
	this.oldestTime = 0;
	this.latestTime = 0;
	this.color = color;
	this.type = 'line';
	this.datatype = 'y-only'; // 'y-only' or 'xy'
	this.min = Number.POSITIVE_INFINITY;
	this.max = Number.NEGATIVE_INFINITY;
	this.minX = Number.POSITIVE_INFINITY;
	this.maxX = Number.NEGATIVE_INFINITY;
	this.pos = 0;	// next index to be used, oldest
	this.elements = 0; 
};

XyChartFastImpl.prototype.handleMonitor = function( userInfo, pvName, value, status, severity, timestamp ) {
	var wf = this.waveforms[userInfo];

	if (wf.data[wf.pos] == wf.max)
	{
		// we are removing max element, find new one
		var l = wf.elements;
		var vmax = Number.NEGATIVE_INFINITY;
		var pos = (wf.elements == wf.data.length) ? wf.pos : 0;
		for ( var x = 1 ; x < l ; x++ ) {
			pos = (pos + 1) % l;
			if (wf.data[pos] > vmax) vmax = wf.data[pos];
		}
		wf.max = vmax;
	}
	if (value > wf.max) wf.max = value;


	if (wf.data[wf.pos] == wf.min)
	{
		// we are removing min element, find new one
		var l = wf.elements;
		var vmin = Number.POSITIVE_INFINITY;
		var pos = (wf.elements == wf.data.length) ? wf.pos : 0;
		for ( var x = 1 ; x < l ; x++ ) {
			pos = (pos + 1) % l;
			if (wf.data[pos] < vmin) vmin = wf.data[pos];
		}
		wf.min = vmin;
	}
	if (value < wf.min) wf.min = value;

	var wrapped = (wf.elements == wf.data.length);

	wf.data[wf.pos] = value;
	wf.time[wf.pos] = timestamp;
	wf.pos = (wf.pos + 1) % wf.data.length;
	wf.oldestTime = wrapped ? wf.time[wf.pos] : wf.time[0];
	if (!wrapped) wf.elements++; 
	wf.latestTime = timestamp;

	this.plot();

	return true;
};

// Helper functions for standalone tests.

var xyChartFastImpl;

function xyChartFastImplHandleEvents(epicsPlugin) {
	epicsPlugin.pendEvents();
    // 50Hz
    setTimeout(function() { xyChartFastImplHandleEvents(epicsPlugin); }, 20);
};

function xyChartFastImpl1HandleMonitor( userInfo, pvName, values, status, severity, timestamp ) {
	xyChartFastImpl1.handleMonitor(userInfo, pvName, values, status, severity, timestamp);
};

function xyChartFastImpl2HandleMonitor( userInfo, pvName, values, status, severity, timestamp ) {
	xyChartFastImpl2.handleMonitor(userInfo, pvName, values, status, severity, timestamp);
};

function xyChartFastImplRun() {
	
	// get scriptable object
	var epicsPlugin = document.getElementById("EPICSPlugin");

	// handle events
	xyChartFastImplHandleEvents(epicsPlugin);
	
	xyChartFastImpl1 = new XyChartFastImpl("chart1", 800, 600);
	    
    xyChartFastImpl1.seriesNameChanged(0, "record1");
    xyChartFastImpl1.seriesNameChanged(1, "record2");
    xyChartFastImpl1.seriesNameChanged(2, "none");
    xyChartFastImpl1.seriesPropertiesChanged(0, "red", null);
    xyChartFastImpl1.seriesPropertiesChanged(1, "blue", null);
    xyChartFastImpl1.seriesPropertiesChanged(2, "green", null);
    
	for (var i = 0; i < xyChartFastImpl1.waveforms.length; i++)
		epicsPlugin.monitorPV(xyChartFastImpl1.waveforms[i].name, "xyChartFastImpl1HandleMonitor", i);


	xyChartFastImpl2 = new XyChartFastImpl("chart2", 128, 96);

    xyChartFastImpl2.seriesNameChanged(0, "none");
    xyChartFastImpl2.seriesNameChanged(1, "record1");
    xyChartFastImpl2.seriesNameChanged(2, "record2");
    xyChartFastImpl2.seriesPropertiesChanged(0, "red", null);
    xyChartFastImpl2.seriesPropertiesChanged(1, "blue", null);
    xyChartFastImpl2.seriesPropertiesChanged(2, "green", null);

	for (var i = 0; i < xyChartFastImpl2.waveforms.length; i++)
		epicsPlugin.monitorPV(xyChartFastImpl2.waveforms[i].name, "xyChartFastImpl2HandleMonitor", i);
};
