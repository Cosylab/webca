/*----------------------------------------------------------------------------\
|                                  Chart 1.0                                  |
|                            Canvas Chart Painter                             |
|-----------------------------------------------------------------------------|
|                          Created by Emil A Eklund                           |
|                        (http://eae.net/contact/emil)                        |
|-----------------------------------------------------------------------------|
| Canvas implementation of the chart painter API. A canvas element is used to |
| draw the chart,  html elements are used for the legend and  axis labels as, |
| at the time being, there is no text support in canvas.                      |
|-----------------------------------------------------------------------------|
|                      Copyright (c) 2006 Emil A Eklund                       |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| This program is  free software;  you can redistribute  it and/or  modify it |
| under the terms of the MIT License.                                         |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| Permission  is hereby granted,  free of charge, to  any person  obtaining a |
| copy of this software and associated documentation files (the "Software"),  |
| to deal in the  Software without restriction,  including without limitation |
| the  rights to use, copy, modify,  merge, publish, distribute,  sublicense, |
| and/or  sell copies  of the  Software, and to  permit persons to  whom  the |
| Software is  furnished  to do  so, subject  to  the  following  conditions: |
| The above copyright notice and this  permission notice shall be included in |
| all copies or substantial portions of the Software.                         |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
| THE SOFTWARE IS PROVIDED "AS IS",  WITHOUT WARRANTY OF ANY KIND, EXPRESS OR |
| IMPLIED,  INCLUDING BUT NOT LIMITED TO  THE WARRANTIES  OF MERCHANTABILITY, |
| FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE |
| AUTHORS OR  COPYRIGHT  HOLDERS BE  LIABLE FOR  ANY CLAIM,  DAMAGES OR OTHER |
| LIABILITY, WHETHER  IN AN  ACTION OF CONTRACT, TORT OR  OTHERWISE,  ARISING |
| FROM,  OUT OF OR  IN  CONNECTION  WITH  THE  SOFTWARE OR THE  USE OR  OTHER |
| DEALINGS IN THE SOFTWARE.                                                   |
|- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -|
|                         http://eae.net/license/mit                          |
|-----------------------------------------------------------------------------|
| 2006-01-03 | Work started.                                                  |
| 2006-01-05 | Added legend and axis labels. Changed the painter api slightly |
|            | to allow two-stage initialization (required for ie/canvas) and |
|            | added legend/axis related methods. Also updated bar chart type |
|            | and added a few options, mostly related to bar charts.         |
| 2006-01-07 | Updated chart size calculations to take legend and axis labels |
|            | into consideration.  Split painter implementations to separate |
|            | files.                                                         |
| 2006-04-16 | Updated to use the  ExplorerCanvas ie emulation  layer instead |
|            | of the, now deprecated, IECanvas one.                          |
|-----------------------------------------------------------------------------|
| Created 2006-01-03 | All changes are in the log above. | Updated 2006-04-16 |
\----------------------------------------------------------------------------*/

function CanvasChartPainterFactory() {
	return new CanvasChartPainter();
}


function CanvasChartPainter() {
	this.base = AbstractChartPainter;
};


CanvasChartPainter.prototype = new AbstractChartPainter;


CanvasChartPainter.prototype.create = function(el) {
	//remove all children
	while (el.firstChild) { el.removeChild(el.lastChild); }	

	this.el = el;

	this.w = el.clientWidth;
	this.h = el.clientHeight;
	
	if(!this.canvas){
		this.canvas = document.createElement('canvas');
	}
	this.canvas.width  = this.w;
	this.canvas.height = this.h;
	this.canvas.style.width  = el.clientWidth + 'px';
	this.canvas.style.height = el.clientHeight + 'px';
	

	el.appendChild(this.canvas);
	
	/* Init explorercanvas emulation for IE */
	if ((!this.canvas.getContext) && (typeof G_vmlCanvasManager != "undefined")) {
		this.canvas = G_vmlCanvasManager.initElement(this.canvas);
	}
};


CanvasChartPainter.prototype.init = function(xlen, ymin, ymax,xmin, xmax, xgd, ygd, bLegendLabels) {
	if(!this.ctx)
		this.ctx = this.canvas.getContext('2d');

	this.chartx = 0;
	this.chartw	= this.w;
	this.charth	= this.h;
	this.charty = 0;
	
	this.xlen = xlen;
	this.ymin = ymin;
	this.ymax = ymax;
	this.xmin = xmin;
	this.xmax = xmax;	
	this.xgd  = xgd;
	this.ygd  = ygd;
	
	this.legendBelow = 0;

	this.calc(this.chartw, this.charth, xlen, ymin, ymax,xmin,xmax, xgd, ygd);
};


CanvasChartPainter.prototype.drawLegend = function(series) {
	var legend, list, item, label;


	legend = document.createElement('div');
	legend.className = 'legend';
	legend.style.position = 'absolute';
	list = document.createElement('ul');

	for (i = 0; i < series.length; i++) {
		item = document.createElement('li');
		item.style.color = series[i].color;
		label = document.createElement('span');
		label.appendChild(document.createTextNode(series[i].label));
		label.style.color = 'black';
		item.appendChild(label);
		list.appendChild(item);
	}
	legend.appendChild(list);
	this.el.appendChild(legend);
	legend.style.right = '0px';
	legend.style.top  = this.charty + (this.charth / 2) - (legend.offsetHeight / 2) + 'px';
	this.legend = legend;
	
	/* Recalculate chart width and position based on labels and legend */
	this.chartw	= this.chartw - (this.legend.offsetWidth + 5);
	
	this.calc(this.chartw, this.charth, this.xlen, this.ymin, this.ymax,this.xmin, this.xmax, this.xgd, this.ygd);
};


CanvasChartPainter.prototype.drawLegendBelow = function(series) {
	var legend, list, item, label;

	this.legendBelow = 1;

	legend = document.createElement('div');
	legend.className = 'legend';
	legend.style.position = 'absolute';
	

	for (i = 0; i < series.length; i++) {
		list = document.createElement('ul');
		item = document.createElement('li');
		item.style.color = series[i].color;
		label = document.createElement('span');
		label.appendChild(document.createTextNode(series[i].label));
		label.style.color = 'black';
		item.appendChild(label);
		list.appendChild(item);
		legend.appendChild(list);
	}
	this.el.appendChild(legend);
	legend.style.left = this.w/2 - (legend.offsetWidth/2) + 'px';
	legend.style.bottom  =  5  + 'px';
	this.legend = legend;
	
	/* Recalculate chart height and position based on labels and legend */
	this.charth	= this.charth - (this.legend.offsetHeight + 10);
	
	this.calc(this.chartw, this.charth, this.xlen, this.ymin, this.ymax,this.xmin, this.xmax, this.xgd, this.ygd);
};

CanvasChartPainter.prototype.drawAxisLabels = function(xlabel,ylabel) {
	
	if(xlabel == null || ylabel == null)
		return;
	
	axisXLabel = document.createElement('div');
	this.el.appendChild(axisXLabel);
	axisXLabel.className = 'axisXLabel';
	axisXLabel.style.position = 'absolute';
	label = document.createElement('span');
	label.appendChild(document.createTextNode(xlabel));
	label.style.color = 'black';
	axisXLabel.appendChild(label);
	axisXLabel.style.left = this.w/2 - (axisXLabel.offsetWidth/2) + 'px';
	axisXLabel.style.bottom  = this.legend.offsetHeight +  10  + 'px';
	this.axisXLabel = axisXLabel;
	
	/* Recalculate chart height and position based on labels and legend */
	this.charth	= this.charth - (this.axisXLabel.offsetHeight + 10);
	
	this.calc(this.chartw, this.charth, this.xlen, this.ymin, this.ymax,this.xmin, this.xmax, this.xgd, this.ygd);	
	
	axisYLabel = document.createElement('div');
	this.el.appendChild(axisYLabel);
	axisYLabel.className = 'axisYLabel';
	axisYLabel.style.position = 'absolute';
	label = document.createElement('span');
	label.appendChild(document.createTextNode(ylabel));
	label.style.color = 'black';
	axisYLabel.appendChild(label);
	axisYLabel.style.left = 5 + 'px';
	axisYLabel.style.bottom  = this.legend.offsetHeight +  10  + 'px';
	this.axisYLabel = axisYLabel;	
	
	/*var svgNS = "http://www.w3.org/2000/svg";
	this.svgElement = document.createElementNS(svgNS,"svg");
	this.el.appendChild(this.svgElement);
	axisYLabel = document.createElementNS(svgNS,"text");
	this.svgElement.appendChild(axisYLabel);
	axisYLabel.setAttributeNS(null,"x",5);
	axisYLabel.setAttributeNS(null,"y",this.h - this.legend.offsetHeight -  10);
	axisYLabel.setAttributeNS(null,"text-anchor","start");		
	axisYLabel.setAttributeNS(null,"font-size","10");				
	this.minreadbackText = document.createTextNode("axis Y label");*/
}


CanvasChartPainter.prototype.drawVerticalAxis = function(ygd, precision) {
	var axis, item, step, y, ty, n, j , yoffset, value,  w, items, pos;

	/* Calculate step size */
	step       = this.range / (ygd - 1);
	

	/* Create container */
	axis = document.createElement('div');
	axis.style.position = 'absolute';
	axis.style.left  = '0px';
	axis.style.top   = '0px';
	axis.style.textAlign = 'right';
	this.el.appendChild(axis);
	
	this.charth = this.charth - 25;	
	this.calc(this.chartw, this.charth, this.xlen, this.ymin, this.ymax,this.xmin, this.xmax, this.xgd, this.ygd);
	
	this.range != 0 ? k = this.charth / this.range : k = 0;
	n =  - k * this.ymin ;	
	
	items = new Array();
	w = 0;
	this.ctx.fillStyle = 'black';
	if(this.ymin * this.ymax <= 0){ /* zero present */
		var zeroy = this.charty + this.charth - n; 	
		this.zeroy = zeroy;	
		
		/* Draw zero element */
		item = document.createElement('div');
		item.appendChild(document.createTextNode("0"));
		axis.appendChild(item);
		if (item.offsetWidth > w) { w = item.offsetWidth; }
		ty = zeroy - (item.offsetHeight/2);
		item.style.position = 'absolute';
		item.style.right = '0px';
		item.style.top   = zeroy + 'px';	
		items.push(zeroy + (item.offsetHeight/2));
			
			
		/* Draw labels up */		
		for(i = step;; i += step) {
			y = this.charty + this.charth - (k * i + n);
			if(y < this.charty) break;
			
			item = document.createElement('div');
			value = i.toFixed(2);	
			item.appendChild(document.createTextNode(value));
			axis.appendChild(item);
			ty = y - (item.offsetHeight/2);
			item.style.position = 'absolute';
			item.style.right = '0px';
			item.style.top   = y + 'px';					
			if (item.offsetWidth > w) { w = item.offsetWidth; }		
			items.push(y + (item.offsetHeight/2));						
		}	
		
		/* Draw labels down */		
		for(i = -step;; i -= step) {
			y = this.charty + this.charth - (k * i + n);
			if(y > this.charty  + this.charth) break;
			
			item = document.createElement('div');
			value = i.toFixed(2);	
			item.appendChild(document.createTextNode(value));
			axis.appendChild(item);
			ty = y - (item.offsetHeight/2);
			item.style.position = 'absolute';
			item.style.right = '0px';
			item.style.top   = y + 'px';					
			if (item.offsetWidth > w) { w = item.offsetWidth; }	
			items.push(y + (item.offsetHeight/2));	
		}					
	}
	else{

		for (j = 0, i = this.ymax; (i > this.ymin) && (j< ygd - 1); i -= step, j++) {
			item = document.createElement('div');
			value = i.toFixed(2);
			item.appendChild(document.createTextNode(value));
			axis.appendChild(item);			
			y = this.charty + this.charth - (k * i + n); 
			item.style.position = 'absolute';
			item.style.right = '0px';
			item.style.top   = y + 'px';					
			if (item.offsetWidth > w) { w = item.offsetWidth; }
			items.push(y + (item.offsetHeight/2));			
		}	
		
		/* Draw last label and point (lower left corner of chart) */
		item = document.createElement('div');		
		item.appendChild(document.createTextNode(this.ymin.toFixed(2)));
		axis.appendChild(item);
		y = this.charty + this.charth - 1
		item.style.position = 'absolute';
		item.style.right = '0px';
		item.style.top   = y + 'px';			
		if (item.offsetWidth > w) { w = item.offsetWidth; }		
		items.push(y + (item.offsetHeight/2));		
	}
	
	/* Set width of container to width of widest label */
	w = w + 5;// + 5 so that labels are not on totaly on left side
	axis.style.width = w + 'px';
	
	/* Recalculate chart width and position based on labels and legend */
	this.chartx = w + 5; // + 5 to allow space for axis ticks
	this.charty = item.offsetHeight / 2;	
	
	this.chartw	= this.chartw - (w + 10); // + 10 axis ticks and 5 on the other side
	
	this.calc(this.chartw, this.charth, this.xlen, this.ymin, this.ymax,this.xmin, this.xmax, this.xgd, this.ygd);	
	
	for(i=0;i<items.length;i++){
		this.ctx.fillRect(this.chartx - 5, items[i], 5, 1);		
	}

	this.vertAxisItems = items;
		
};



CanvasChartPainter.prototype.drawHorizontalAxis = function(xlen, labels, xgd, precision,flags) {
	var axis, item, step, x, tx, n, multiplier,value;

	/* Calculate offset, step size and rounding precision */
	multiplier = Math.pow(10, precision);
	step          = this.xrange / (xgd - 1);

	/* Create container */
	axis = document.createElement('div');
	axis.style.position = 'absolute';
	axis.style.left   = '0px';
	axis.style.top    = (this.charty + this.charth + 5) + 'px';
	axis.style.width  = this.w + 'px';
	this.el.appendChild(axis);

	/* Draw labels and points */
	this.ctx.fillStyle = 'black';
	for (i = 0; i < xgd - 1; i++) {
		item = document.createElement('span');
		
		itemLabel = null;
		if(labels.length > 0 && typeof(labels[0]) == "function") {
			value = this.xmin + i * step;
			itemLabel = labels[0](value, labels[1]);
			if (typeof(itemLabel) == "number") {
				itemLabel = parseInt(itemLabel * multiplier) / multiplier;
			}
		} else if(labels.length != 0) {
			itemLabel = labels[i];
		} else { 
			itemLabel = parseInt( (this.xmin + i * step) * multiplier) / multiplier;
		}
		item.appendChild(document.createTextNode(itemLabel));

		axis.appendChild(item);
		x = this.chartx + ((this.chartw / (xgd - 1)) * i);
		tx = x - (item.offsetWidth/2)
		item.style.position = 'absolute';
		if((flags &  CHART_BAR) != CHART_BAR)
			item.style.left = tx + 'px';
		else
			item.style.left = tx + (this.chartw / (xgd - 1))/2 + 'px';
		item.style.top  = '0px';
		this.ctx.fillRect(x, this.charty + this.charth, 1, 5);
	}	
	
	if((flags &  CHART_BAR) != CHART_BAR){
		//draw last lable
		item = document.createElement('span');
		
		itemLabel = null;
		if(labels.length > 0 && typeof(labels[0]) == "function") {
			value = this.xmin + i * step;
			itemLabel = labels[0](value, labels[1]);
			if (typeof(itemLabel) == "number") {
				itemLabel = parseInt(itemLabel * multiplier) / multiplier;
			}
		} else if(labels.length != 0) {
			itemLabel = labels[i];
		} else { 
			itemLabel = parseInt( (this.xmin + i * step) * multiplier) / multiplier;
		}
		item.appendChild(document.createTextNode(itemLabel));
		
		axis.appendChild(item);
		x = this.chartx + ((this.chartw / (xgd - 1)) * i);
		tx = x - (item.offsetWidth/2)
		item.style.position = 'absolute';
		item.style.left = tx - item.offsetWidth/2 + 'px';
		item.style.top  = '0px';
		this.ctx.fillRect(x, this.charty + this.charth, 1, 5);	
	}

};


CanvasChartPainter.prototype.drawAxis = function() {
	this.ctx.fillStyle = 'black';
	this.ctx.fillRect(this.chartx, this.charty, 1, this.charth-1);
	this.ctx.fillRect(this.chartx, this.charty + this.charth - 1, this.chartw+1, 1);
};


CanvasChartPainter.prototype.drawBackground = function() {
	this.ctx.fillStyle = '#C0C0C0';
	this.ctx.fillRect(0, 0, this.w, this.h);

	this.ctx.fillStyle = 'black';
	this.ctx.lineWidth = 2;
	this.ctx.moveTo(0, 0);
	this.ctx.lineTo(0, this.h);
	this.ctx.lineTo(this.w,this.h);
	this.ctx.lineTo(this.w,0);	
	this.ctx.lineTo(0,0);		
	this.ctx.stroke();	
};

CanvasChartPainter.prototype.drawCharBackground = function() {
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(this.chartx, this.charty,  this.chartw, this.charth);
};


CanvasChartPainter.prototype.drawChart = function() {
	this.ctx.fillStyle = 'silver';
	if (this.xgrid) {
		for (i = this.xgrid; i < this.chartw; i += this.xgrid) {
			this.ctx.fillRect(this.chartx + i, this.charty, 1, this.charth-1);
	}	}
	if (this.ygrid) {
		var items = this.vertAxisItems;
		for(i=0;i<items.length;i++){			
			this.ctx.fillRect(this.chartx + 1, items[i], this.chartw, 1);			
		}				
	}	
};


CanvasChartPainter.prototype.drawArea = function(color, values) {
	var i, len, x, y, n, yoffset;

	/* Determine distance between points and offset */
	n = this.range / this.charth;
	
	yoffset = (this.ymin / n);

	len = values.length;
	if (len) {
		this.ctx.fillStyle = color;

		/* Begin line in lower left corner */
		x = this.chartx + 1;
		this.ctx.beginPath();
		this.ctx.moveTo(x, this.charty + this.charth - 1);

		/* Determine position of first point and draw it */
		y = this.charty + this.charth - (values[0] / n) + yoffset;
		this.ctx.lineTo(x, y);

		/* Draw lines to succeeding points */
		for (i = 1; i < len; i++) {
			y = this.charty + this.charth - (values[i] / n) + yoffset;
			x += this.xstep;
			this.ctx.lineTo(x, y);
		}

		/* Close path and fill it */
		this.ctx.lineTo(x, this.charty + this.charth - 1);
		this.ctx.closePath();
		this.ctx.fill();
}	};


CanvasChartPainter.prototype.drawLine = function(color, values, type) {
	var i, len, x, y,yn,yk,xk,xn;
	
	this.range != 0 ? yk = this.charth / this.range : yk = 0;
	yn =  - yk * this.ymin ;
	
	this.xrange != 0 ? xk = this.chartw / this.xrange : xk = 0;
	xn =  - xk * this.xmin ;

	len = values.length;
	if (len) {
		this.ctx.lineWidth   = 1;
		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		
		if(type == INDEX_VALUES){
			/* Determine position of first point and draw it */
			x = this.chartx + 1;
			y = this.charty + this.charth - (yk * values[0] + yn);  
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
	
			/* Draw lines to succeeding points */
			for (i = 1; i < len; i++) {
				y = this.charty + this.charth - (yk * values[i] + yn); 
				x += this.xstep;
				this.ctx.lineTo(x, y);
			}		
		}
		else if(type == XY_VALUES){
			x = this.chartx + (xk * values[0][0] + xn); 	
			y = this.charty + this.charth - (yk * values[0][1] + yn); 
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
	
			/* Draw lines to succeeding points */
			for (i = 1; i < len; i++) {
				x = this.chartx + (xk * values[i][0] + xn); 	
				y = this.charty + this.charth - (yk * values[i][1] + yn); 
				this.ctx.lineTo(x, y);
			}				
		}

		/* Stroke path */
		this.ctx.stroke();
}	};


CanvasChartPainter.prototype.drawScatter = function(color, values, type) {
	var i, len, x, y,yn,yk,xk,xn;
	
	this.range != 0 ? yk = this.charth / this.range : yk = 0;
	yn =  - yk * this.ymin ;
	
	this.xrange != 0 ? xk = this.chartw / this.xrange : xk = 0;
	xn =  - xk * this.xmin ;

	len = values.length;
	if (len) {
		this.ctx.fillStyle = color;
		
		if(type == INDEX_VALUES){
			/* Determine position of first point and draw it */
			x = this.chartx;// + 1;
	
			/* Draw "scatters" */
			for (i = 0; i < len; i++) {
				y = this.charty + this.charth - (yk * values[i] + yn); 
				this.ctx.fillRect( x - 2 , y - 2, 5, 5 );
				x += this.xstep;
			}		
		}
		else if(type == XY_VALUES){
			/* Draw "scatters" */
			for (i = 0; i < len; i++) {
				x = this.chartx + (xk * values[i][0] + xn); 	
				y = this.charty + this.charth - (yk * values[i][1] + yn); 
				this.ctx.fillRect( x - 2 , y - 2, 5, 5 );
			}				
		}

}	};


CanvasChartPainter.prototype.drawBars = function(color, values, xlen, xoffset, width, seriesNumber) {
	var i, len, x, y, n, k;
	
	var numbValue;
	
	this.range != 0 ? k = this.charth / this.range : k = 0;
	n =  - k * this.ymin ;
			
	var tooltipDiv;
	var tooltipSpan;
	
	// zero
	var lasty = this.charty + this.charth - n; 			
	
	len = values.length;
	if (len > xlen) { len = xlen; }
	if (len) {
		this.ctx.fillStyle = color;

		/* Determine position of each bar and draw it */
		x = this.chartx + xoffset;
		for (i = 0; i < len; i++) {
			y = this.charty + this.charth - (k * values[i] + n); 			
			

			this.ctx.beginPath();
			this.ctx.moveTo(x, lasty );
			this.ctx.lineTo(x, y );
			this.ctx.lineTo(x+width, y);
			this.ctx.lineTo(x+width, lasty );
			this.ctx.closePath();
			this.ctx.fill();
			
			//create div element for tooltip
			tooltipDiv = document.createElement('div');
			tooltipDiv.className = 'tooltip';
			this.el.appendChild(tooltipDiv);
			tooltipDiv.style.position = 'absolute';
			tooltipDiv.style.left = x + 'px';
			tooltipDiv.style.bottom = this.h - Math.max(lasty, y) + 'px';
			tooltipDiv.style.width = width + 'px';
			tooltipDiv.style.height = Math.abs(lasty - y) + 'px';
			
			tooltipSpan = document.createElement('span');
			numbValue = new Number(values[i]);
			tooltipSpan.innerHTML = numbValue.toFixed(2);			
			tooltipDiv.appendChild(tooltipSpan);
			
			x += this.xstep;
			
			// for waterfall
			//lasty = y;
		}	
	}	
	this.ctx.beginPath();
	this.ctx.strokeStyle = 'black';
	this.ctx.lineWidth = 2;
	this.ctx.moveTo(this.chartx, this.zeroy + this.charty);
	this.ctx.lineTo(this.chartx + this.chartw, this.zeroy + this.charty);
	this.ctx.closePath();
	this.ctx.stroke();	
};
