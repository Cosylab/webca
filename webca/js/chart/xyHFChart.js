
XYHFChart = function(id, manager,xAxisLabel,yAxisLabel, xAxisStyle, numberOfpoints,pvNames) {	

	//call super class constructor	
	XYHFChart.superclass.constructor.call(this, id, manager); 

    ChartCommon.init(this);

	//for index plot
	if(IsNumeric(new String(numberOfpoints)) && numberOfpoints > 0)
		this.numberOfpoints = numberOfpoints;
	else
		this.numberOfpoints = 100;		
	
	//set initial size of chart
	this.defaultWidth = 800;
	this.defaultHeight = 400;	
	
	this.chartDiv = document.getElementById(id);
	this.chartDiv.chart = this;
	this.parentNode = this.chartDiv.parentNode;	
		
	ChartCommon.setChartDivSize(this);
	
    this.xAxisStyle = xAxisStyle;
    ChartCommon.parseXAxisStyle(this);
	
	this.plotNames = new Array();
	this.plotData =  new Hash();
	
	this.plotOptions = {
		legend: {backgroundOpacity: .75 },
	    xaxis: {noTicks: 10},
	    yaxis: {noTicks: 10},
	    selection: {mode: 'xy'},
        mouse: {track: true, sensibility: 1}
	};
    if (this.xAxisStyle == 'time') {
    	this.plotOptions.xaxis.tickFormatter = ChartCommon.getXAxisLabel;
    	this.plotOptions.xaxis.tickFormatterPar = this.xAxisStyleFormat;
    }

	if(xAxisLabel != "" && yAxisLabel != ""){
		this.xAxisLabel = xAxisLabel;
		this.yAxisLabel = yAxisLabel;
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);
		this.plotOptions.xaxis.label = this.resolvedXAxisLabel;
		this.plotOptions.yaxis.label = this.resolvedYAxisLabel;
		
	}
	
    this.plot = Flotr.draw($(this.id), this.plotData.values(), this.plotOptions);
	
    //color object used to generat random colors
    this.color = new Color();

	//array of input data
	this.pvNames = pvNames;
	
	//array of handles
	this.handles = new Array();	
	//array of names 
	this.names = new Array();
	//array of types 
	this.types = new Array();
	//array of types  for x-y chart
	this.typesXY = new Array();
	//array of colors used by index chart
	this.indexColors = new Array();
	//array of colors used by x-y chart
	this.XYColors = new Array();	
	//array of resolved names
	this.resolvedNames = new Array();
	//array of names plotet against indexes
	this.pvIndexNames = new Array();
	//array of y names for x-y plot
	this.pvYNames = new Array();
	//array of x names for x-y plot
	this.pvXNames = new Array();
	//array of resolved y names for x-y plot
	this.resolvedPVYNames = new Array();
	//array of resolved x names for x=y plot
	this.resolvedPVXNames = new Array();	
	//array of pv values
	this.pvValues = new Array();
	//plot name
	this.plotName = new Array();
	//resolved plot name
	this.resolvedPlotName = new Array();	
	//xy plot name
	this.plotXYName = new Array();	
	//resolved xy plot Name
	this.resolvedPlotXYName = new Array();	
	//array of monitor handles
	this.monitorHandles = new Array();
	//array of connected states
	this.connected = new Array();
	//array of update states
	this.pvUpdated = new Array();

    if (this.xAxisStyle == 'time') {
        //array of timestamps
        this.pvTimestamps = new Array();
    }
		
	var j = 0;
	var i = 0;
	
	var haveIt = false;
	
	for(i = 0; i < pvNames.length; i++){ // register all names
		var handle;
		
		if(pvNames[i].xName != ''){
			
			for(var l = 0; l < this.names.length; l++){ // we already have it
				if(this.names[l] == pvNames[i].xName) haveIt = true;
			}	
			
			if(!haveIt){
				handle = this.manager.register(pvNames[i].xName,this);
				this.handles[j] = handle;
				this.names[j++] = pvNames[i].xName;				
			}
			else haveIt = false;

		}
		
		if(pvNames[i].yName != ''){
			
			for(var l = 0; l < this.names.length; l++){ // we already have it
				if(this.names[l] == pvNames[i].yName) haveIt = true;
			}	
			
			if(!haveIt){
				handle = this.manager.register(pvNames[i].yName,this);
				this.handles[j] = handle;
				this.names[j++] = pvNames[i].yName;				
			}
			else haveIt = false;
		}
		
	}
	
	var m = 0;
	var n = 0;
	
	for(i = 0; i < pvNames.length; i++){ //create xy dependancy
		if(pvNames[i].xName == '' && pvNames[i].yName != ''){ // index series
			this.pvIndexNames[m] = pvNames[i].yName;
			this.indexColors[m] = this.color.getRandomColor();
			this.plotName[m] = pvNames[i].name;
			this.types[m] = pvNames[i].type; 	
			this.resolvedPlotName[m++] =  this.manager.substitute(pvNames[i].name);
		}
		else if(pvNames[i].xName != '' && pvNames[i].yName != ''){
			this.pvYNames[n] = pvNames[i].yName;
			this.pvXNames[n] = pvNames[i].xName;		
			this.XYColors[n] = this.color.getRandomColor();	
			this.plotXYName[n] = pvNames[i].name;
			this.typesXY[n] = pvNames[i].type; 	
			this.resolvedPlotXYName[n++] =  this.manager.substitute(pvNames[i].name);	
		}
		else{
			throw new Error("XYHFChart: Y axis PV name missing!");
		}	
	}

     // repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.onRepaint, this); 	 
	
	// resize event
	YAHOO.util.Event.addListener(window, "resize", this.onResize, this, true);
	
	this.registerZoomEvents();
};
YAHOO.lang.extend(XYHFChart, Component);

XYHFChart.prototype.registerZoomEvents = function() {

    $(this.id).observe('flotr:select', function(event) {
    	var area = event.memo[0];
    	var sel = event.memo[1];
      	var chart = event.element().chart;
      	
      	if (Math.abs(sel.x2 - sel.x1) >= 2 && Math.abs(sel.y2 - sel.y1) >= 2) {
	      	chart.plotOptions.xaxis.min = area.x1; 
	      	chart.plotOptions.xaxis.max = area.x2; 
	      	chart.plotOptions.yaxis.min = area.y1; 
	      	chart.plotOptions.yaxis.max = area.y2; 
      	} else {
	      	chart.plotOptions.xaxis.min = undefined; 
	      	chart.plotOptions.xaxis.max = undefined; 
	      	chart.plotOptions.yaxis.min = undefined; 
	      	chart.plotOptions.yaxis.max = undefined;
      	}
	    chart.plot.clearSelection();
	    chart.plot.refresh(chart.plotData.values(), chart.plotOptions);
    });
};

//routines
XYHFChart.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "XYHFChart.preInitialize() requires two arguments.");		
	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYHFChart.preInitialize: Handle " + handle + " not found!");	
	
	this.resolvedNames[index] = resolvedName;
	
	var pvName = this.names[index];	
	var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
	var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
	
	if(yIndex >= 0)
		this.resolvedPVYNames[yIndex] = resolvedName;
		
	if(xIndex >= 0)
		this.resolvedPVXNames[xIndex] = resolvedName;
		
	
	this.manager.connect(handle,resolvedName);	
		
};

XYHFChart.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "XYHFChart.notifyConnectionStatus() requires two arguments.");	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYHFChart.notifyConnectionStatus: Handle " + handle + " not found!");
	
	this.connected[index] = connected;
	//TODO what should we do here??	(indicate disconnected status in legend?)
};

XYHFChart.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "XYHFChart.initialize() requires one argument.");
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYHFChart.initialize: Handle " + handle + " not found!");
	
	var monitorHandle;
	if(!this.monitorHandles[index])
		monitorHandle = this.manager.createMonitor(handle,this);    		
	
	this.monitorHandles[index] = monitorHandle;
	
};



XYHFChart.prototype.reregister = function(handle){
	assert(arguments.length == 1, "XYHFChart.reregister() requires one argument.");		

	var newHandle;
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYHFChart.reregister: Handle " + handle + " not found!");
	
	var pvName = this.names[index];
	
	newHandle = this.manager.register(pvName,this);
	
	this.handles[index] = newHandle;
	
	//substitute plot name
	if(this.findIndexInArray(pvName,this.pvIndexNames) >= 0){
		this.resolvedPlotName[this.findIndexInArray(pvName,this.pvIndexNames)] = this.manager.substitute(this.plotName[this.findIndexInArray(pvName,this.pvIndexNames)]);
	}
	else{
		var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
		var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
		if(yIndex >= 0 || xIndex >=0){		
			this.resolvedPlotXYName[yIndex!= -1? yIndex : xIndex] = this.manager.substitute(this.plotXYName[yIndex!= -1? yIndex : xIndex]);
		}
	}
	
	//substitute plot axis labels
	if(this.xAxisLabel && this.yAxisLabel){
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
		this.plotOptions.xaxis.label = this.resolvedXAxisLabel;
		this.plotOptions.yaxis.label = this.resolvedYAxisLabel;
	}	
	
	this.resolvedNames[index] = null;	
	
};

XYHFChart.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "XYHFChart.cleanup() requires one argument.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYHFChart.cleanup: Handle " + handle + " not found!");

	this.manager.destroyMonitor(this.monitorHandles[index]);
	this.monitorHandles[index] = null;

		
	this.manager.disconnect(this.handles[index]);
	this.manager.unregister(this.handles[index]);
	
	this.connected[index] = false;		
	
	//remove series from chart
	var pvName = this.names[index];
	
	//remove data from buffer
	this.pvValues[index] = null;
	if (this.pvTimestamps) {
	    this.pvTimestamps[index] = null;
	}
	
	if(this.findIndexInArray(pvName,this.pvIndexNames) >= 0){
		var name = this.resolvedPlotName[this.findIndexInArray(pvName,this.pvIndexNames)];
		if(name == ""){
			name = this.resolvedNames[this.findIndexInArray(pvName,this.pvIndexNames)];
		}
	 	this.plotData.unset(name);
			
	}else{
		var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
		var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
		if(yIndex >= 0 || xIndex >=0){
			var name = this.resolvedPlotXYName[yIndex!= -1? yIndex : xIndex];
 			
 			if(name == ""){
 				name = this.resolvedPVXNames[yIndex!= -1? yIndex : xIndex] + " " + this.resolvedPVYNames[yIndex!= -1? yIndex : xIndex];
 			}
    	 	this.plotData.unset(name);
		}		
	}	
    this.plot.refresh(this.plotData.values(), this.plotOptions);
};

XYHFChart.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){

	 assert(arguments.length == 5, "TXYHFChart.notifyMonitor() requires five arguments.");
	 
 	 // extra flags to help determine value type
 	 var isNumeric;
	 var valueType = typeof(value);
	 var isArray = (valueType == "function" || valueType == "object");
	 if (isArray)
		isNumeric = (typeof(value[0]) == "number");
	 else
		isNumeric = (typeof(value) == "number");
	 
	 if(!isNumeric)
	 	return;
	 
	 var index = this.findIndexInArray(handle,this.handles);
	 if(index < 0) throw new Error("XYHFChart.notifyMonitor: Handle " + handle + " not found!");	 
	 
	 var pvName = this.names[index];
	 this.pvUpdated[index] = true;

	 if (value.length) { // array
	     this.pvValues[index] = value;
	 } else { // scalar
	     var values = this.pvValues[index];
	     if (values == null) {
	 	      values = new Array();
	 	 }
 		 values.push(value);
 		 this.pvValues[index] = values;
	 }

	 if (this.pvTimestamps) {
		 if (value.length) { // array
	    	this.pvTimestamps[index] = timestamp;
		 } else { // scalar
	    	var timestamps = this.pvTimestamps[index];
		 	if (timestamps == null) {
		 		timestamps = new Array();
		 	}
	 		timestamps.push(timestamp);
	 		this.pvTimestamps[index] = timestamps;	
	    }
	}
	
    if (!value.length) { // scalar
	    ChartCommon.clipValues(this);
    }

	for (var s = 0; s < this.pvUpdated.length; s++) {
		if (this.pvUpdated[s]) {
		    this.updateSeries(this.names[s]);
		    this.pvUpdated[s] = false;
		}
	}

    this.plot.refresh(this.plotData.values(), this.plotOptions);

};

XYHFChart.prototype.updateSeries = function(pvName) {
	 
	var ix = this.findIndexInArray(pvName,this.pvIndexNames);
	if(ix >= 0){
		var color = this.indexColors[ix];
		var name = this.resolvedPlotName[ix];
		if(name == "")
			name = this.resolvedNames[ix];
		var type = this.types[ix];

		var pvIndex = this.findIndexInArray(pvName,this.names);
		var yValues = this.pvValues[pvIndex];
		var xValues = this.pvTimestamps ? this.pvTimestamps[pvIndex] : null;

		// Only use timestamps if displaying trend plot. 
	    var data = new Array();
		if (this.pvTimestamps && xValues && xValues instanceof Array) {
 		    for(var i = 0; i < yValues.length; i++){
	 			data[i] = [xValues[i], yValues[i]];
		    }	
		} else {
 		    for(var i = 0; i < yValues.length; i++){
 			    data[i] = [i, yValues[i]];
		    }	
        }

 		this.plotData.set(name, {
 			color: color,
 			data: data,
 			label: name,
 			minX: 0,
 			maxX: yValues.length - 1,
            lines: {show: type != 'scatter'},	 			
            points: {show: type == 'scatter'},	 			
   			mouse: {lineColor: color}
 		});

 	}else{	 		
		var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
		var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
		if(yIndex >= 0 || xIndex >=0){
			ix = (yIndex != -1? yIndex : xIndex);
			var data = new Array();
 			var yValues = this.pvValues[this.findIndexInArray(this.pvYNames[ix], this.names)];
 			var xValues = this.pvValues[this.findIndexInArray(this.pvXNames[ix], this.names)];
 			var color = this.XYColors[ix];
 			var name = this.resolvedPlotXYName[ix];
 			var type = this.typesXY[ix];
 			
 			if(name == "")
 				name = this.resolvedPVXNames[ix] + "-" + this.resolvedPVYNames[ix];
 			
 			if(!yValues || !xValues)
 				return;
 			
 			if(yValues.length != xValues.length){
 				//TODO: throw error
 			}
 			
	 		var minX = null;
	 		var maxX = null;
	 		for(var i = 0; i < yValues.length; i++){
	 			data[i] = [xValues[i],yValues[i]];
	 			if (minX == null || xValues[i] < minX) {
	 				minX = xValues[i];
	 			}
	 			if (maxX == null || xValues[i] > maxX) {
	 				maxX = xValues[i];
	 			}
 			}
 			if (minX == null) {
 			   minX = 0;
 	        }	
 			if (maxX == null) {
 			   maxX = 1;
 	        }	
	 		this.plotData.set(name, {
	 			color: color,
	 			data: data,
	 			label: name,
	 			minX: minX,
	 			maxX: maxX,
                lines: {show: type != 'scatter'},	 			
                points: {show: type == 'scatter'},
      			mouse: {lineColor: color}
	 		});
	 	}	   
	}
};


//used to repaint when tab on which resides gains focus
XYHFChart.prototype.onRepaint = function(type, args, chart){
	var target = $(chart.id);
	if (target.getWidth() > 0 && target.getHeight() > 0) {
        chart.plot = Flotr.draw(target, chart.plotData.values(), chart.plotOptions);
	}
};

/*
 * 
 * Resize event handler. Executed when window is resized.
 * 
 */
XYHFChart.prototype.onResize = function(){
	var target = $(this.id);
	if (target.getWidth() > 0 && target.getHeight() > 0) {
        this.plot = Flotr.draw(target, this.plotData.values(), this.plotOptions);
	}
};

XYHFChart.prototype.findIndexInArray = function(element,array){
	var i;
	for(i = array.length - 1; i >= 0 ; i--)
		if(array[i] == element)
			return i;
	return -1;
};

XYHFChart.prototype.getPVName = function() {
    return ChartCommon.getPvNamesXYOrIndexed(this);
};

XYHFChart.prototype.isHistoryCapable = function() {
	return false;  
};

/*
 * 
 * Displays control data of the PV. Overidded routine.
 * 
 */
XYHFChart.prototype.showCtrlData = function() {  
    var win = window.open("", this.id, "width=400,height=500," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
    if (!win) return;
    var doc = win.document;
    doc.write("<html><head><title>PV Inspector</title></head><body></body>");

 	doc.title = "PV inspector";
 	
 	var nbsp = String.fromCharCode(160); 
 	
	var heading = doc.createElement("h3");
	heading.appendChild(doc.createTextNode("Readback PVs:"));
	doc.body.appendChild(heading);
 		
	var table = doc.createElement("table"); 	
 	doc.body.appendChild(table);
	table.setAttribute("border","1");
    table.setAttribute("width","100%");  		
    
    var i = 0;
    for(; i < this.names.length; i++){
    	
    	var table = doc.createElement("table"); 	
	 	doc.body.appendChild(table);
		table.setAttribute("border","1");
	    table.setAttribute("width","100%");  
	    
	    var br = doc.createElement("br"); 		
	    doc.body.appendChild(br);
	
		createRow(doc,table,"PV resolved name",this.resolvedNames[i]);
		createRow(doc,table,"PV unresolved name",this.names[i]);
		createRow(doc,table,"PV connected",this.connected[i] == true? "connected" : "not connected");		
		
    } 		
    
    doc.close();            
};

