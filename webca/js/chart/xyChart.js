
XYChart = function(id, manager,xAxisLabel,yAxisLabel, xAxisStyle, numberOfpoints,pvNames) {	
	//call super class constructor	
	XYChart.superclass.constructor.call(this, id, manager); 
	
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
	this.parentNode = this.chartDiv.parentNode;	
	
	ChartCommon.setChartDivSize(this);
	
    this.xAxisStyle = xAxisStyle;
    ChartCommon.parseXAxisStyle(this);
	
	this.linePlot = new Chart(document.getElementById(id));
	this.linePlot.setDefaultType(CHART_LINE);
	this.linePlot.setShowLegend(true);	
	this.linePlot.setGridDensity(11, 10);
    if (this.xAxisStyle == 'time') {
    	this.linePlot.setHorizontalLabels([ChartCommon.getXAxisLabel, this.xAxisStyleFormat]);
    }
	if(xAxisLabel != "" && yAxisLabel != ""){
		this.xAxisLabel = xAxisLabel;
		this.yAxisLabel = yAxisLabel;
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
		this.linePlot.setAxisLabels(this.resolvedXAxisLabel,this.resolvedYAxisLabel);
	}
	
	this.linePlot.initChartArea();
	
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
			this.types[m] = pvNames[i].type == 'scatter' ? CHART_SCATTER : CHART_LINE; 	
			this.resolvedPlotName[m++] =  this.manager.substitute(pvNames[i].name);
		}
		else if(pvNames[i].xName != '' && pvNames[i].yName != ''){
			this.pvYNames[n] = pvNames[i].yName;
			this.pvXNames[n] = pvNames[i].xName;		
			this.XYColors[n] = this.color.getRandomColor();	
			this.plotXYName[n] = pvNames[i].name;
			this.typesXY[n] = pvNames[i].type == 'scatter' ? CHART_SCATTER : CHART_LINE; 	
			this.resolvedPlotXYName[n++] =  this.manager.substitute(pvNames[i].name);	
		}
		else{
			throw new Error("XYChart: Y axis PV name missing!");
		}	
	}

     // repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.onRepaint, this); 	 
	
	// resize event
	YAHOO.util.Event.addListener(window, "resize", this.onResize, this, true); 
   
};
YAHOO.lang.extend(XYChart, Component);


//routines
XYChart.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "XYChart.preInitialize() requires two arguments.");		
	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYChart.preInitialize: Handle " + handle + " not found!");	
	
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

XYChart.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "XYChart.notifyConnectionStatus() requires two arguments.");	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYChart.notifyConnectionStatus: Handle " + handle + " not found!");
	
	this.connected[index] = connected;
	//TODO what should we do here??	(indicate disconnected status in legend?)
};

XYChart.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "XYChart.initialize() requires one argument.");
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYChart.initialize: Handle " + handle + " not found!");
	
	var monitorHandle;
	if(!this.monitorHandles[index])
		monitorHandle = this.manager.createMonitor(handle,this);    		
	
	this.monitorHandles[index] = monitorHandle;
	
};



XYChart.prototype.reregister = function(handle){
	assert(arguments.length == 1, "XYChart.reregister() requires one argument.");		

	var newHandle;
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYChart.reregister: Handle " + handle + " not found!");
	
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
		this.linePlot.setAxisLabels(this.resolvedXAxisLabel,this.resolvedYAxisLabel);	
	}	
	
	this.resolvedNames[index] = null;	
	
};

XYChart.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "XYChart.cleanup() requires one argument.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XYChart.cleanup: Handle " + handle + " not found!");

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
			name = this.resolvedNames[this.findIndexInArray(pvName,this.pvIndexNames)];;
		}
		this.linePlot.remove(name);	
	}else{
		var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
		var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
		if(yIndex >= 0 || xIndex >=0){
			var name = this.resolvedPlotXYName[yIndex!= -1? yIndex : xIndex];
 			
 			if(name == ""){
 				name = this.resolvedPVXNames[yIndex!= -1? yIndex : xIndex] + " " + this.resolvedPVYNames[yIndex!= -1? yIndex : xIndex];
 			}
 			this.linePlot.remove(name);				
		}		
	}	
	
	this.linePlot.initChartArea();	
	
};

XYChart.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	 assert(arguments.length == 5, "TextUpdate.notifyMonitor() requires five arguments.");
	 
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
	 if(index < 0) throw new Error("XYChart.cleanup: Handle " + handle + " not found!");	 
	 
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
	
	this.linePlot.draw();
};

XYChart.prototype.updateSeries = function(pvName) {
	
	var ix = this.findIndexInArray(pvName,this.pvIndexNames);
	if(ix >= 0){
		var color = this.indexColors[ix];
		var name = this.resolvedPlotName[ix];
		if(name == "")
			name = this.resolvedNames[ix];
		var type = this.types[ix];
 		this.linePlot.setVerticalLabelPrecision(2);
 		this.linePlot.setHorizontalLabelPrecision(2); 		

		var yValues = this.pvValues[this.findIndexInArray(pvName,this.names)];
		var xValues = null;
		if (this.pvTimestamps) {
		    xValues = this.pvTimestamps[this.findIndexInArray(pvName,this.names)];
		}
		// Only use timestamps if displaying trend plot. 
		if (this.pvTimestamps && xValues && xValues instanceof Array) {
			var data = new Array();
	 		for(var i = 0; i < yValues.length; i++){
	 			data[i] = [xValues[i],yValues[i]];
 			}	
	 		this.linePlot.add(name, color, data, XY_VALUES, type);		
		} else {
     		this.linePlot.add(name,color, yValues , INDEX_VALUES, type);	
		}
 		
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
 			
	 		for(var i = 0; i < yValues.length; i++){
	 			data[i] = [xValues[i],yValues[i]];
	 			
 			}	
			this.linePlot.setVerticalLabelPrecision(2);
			this.linePlot.setHorizontalLabelPrecision(2);			
	 		this.linePlot.add(name, color, data, XY_VALUES, type);		
	 	}	   
	}
};

//used to repaint when tab on which resides gains focus
XYChart.prototype.onRepaint = function(type, args, lineChart){
	lineChart.linePlot.initChartArea();	
	lineChart.linePlot.draw();
};


/*
 * 
 * Resize event handler. Executed when window is resized.
 * 
 */
XYChart.prototype.onResize = function(){
	this.linePlot.initChartArea();	
	this.linePlot.draw();
};


XYChart.prototype.findIndexInArray = function(element,array){
	var i;
	for(i = array.length - 1; i >= 0 ; i--)
		if(array[i] == element)
			return i;
	return -1;
};

XYChart.prototype.getPVName = function() {
    return ChartCommon.getPvNamesXYOrIndexed(this);
};

XYChart.prototype.isHistoryCapable = function() {
	return false;  
};

/*
 * 
 * Displays control data of the PV. Overidded routine.
 * 
 */
XYChart.prototype.showCtrlData = function() {  
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

