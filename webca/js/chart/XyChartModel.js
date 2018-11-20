/**
 * This currently combines the model for drawing point vectors (xy plot) and
 * trends (index, time plots).
 *  
 * Overview of data structures:
 * 
 * Arrays of unique pv connections:
 * this.handle	
 * this.names; this.resolvedNames
 * this.pvValues
 * this.monitorHandles
 * this.connected
 * this.pvUpdated
 * this.pvTimestamps
 * 
 *
 * Arrays of index series:
 * this.pvIndexNames
 * 
 * this.plotName; this.resolvedPlotName
 * this.types: line/scatter
 * this.indexColors
 * 
 * Arrays of x-y series:
 * this.pvXNames; this.resolvedPVXNames
 * this.pvYNames; this.resolvedPVYNames
 * 
 * this.plotXYName; this.resolvedPlotXYName
 * this.typesXY: line/scatter
 * this.XYColors
 */
XyChartModel = function(id, manager, flavor, xAxisLabel, yAxisLabel, xAxisStyle, numberOfpoints, pvNames) {	

	//call super class constructor	
	XyChartModel.superclass.constructor.call(this, id, manager); 

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

	if(xAxisLabel != "" && yAxisLabel != ""){
		this.xAxisLabel = xAxisLabel;
		this.yAxisLabel = yAxisLabel;
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);
	}

	
	this.xyChartImpl = new XyChartFastImpl(id, this.chartDiv.getWidth(), this.chartDiv.getHeight(), this.xAxisStyle, pvNames);

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
	//array of resolved y names for index plot
	this.resolvedIndexNames = new Array();
	//array of resolved y names for x-y plot
	this.resolvedPVYNames = new Array();
	//array of resolved x names for x-y plot
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
			throw new Error("XyChartModel: Y axis PV name missing!");
		}	
	}

	// repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.onRepaint, this); 	 

	// resize event
	YAHOO.util.Event.addListener(window, "resize", this.onResize, this, true);

    //this.xyChartImpl.plotTitleChanged(name);
    this.xyChartImpl.axisXLabelChanged(this.resolvedXAxisLabel);
	this.xyChartImpl.axisXPropertiesChanged(this.xAxisStyle == 'time',
        	this.numberOfpoints, this.xAxisStyleFormat);
    
    this.xyChartImpl.axisYLabelChanged(this.resolvedYAxisLabel);
    //this.xyChartImpl.axisXPropertiesChanged(timeScale, sizeLimit, valuesFormat);

	for (var i = 0; i < this.pvIndexNames.length; i++) {
		var handleIndex = this.indexSeriesIndexToHandleIndex(i);
		var seriesIndex = this.handleIndexToSeriesIndex(handleIndex);

        this.xyChartImpl.seriesNameChanged(seriesIndex, this.getSeriesName(handleIndex));
        this.xyChartImpl.seriesPropertiesChanged(seriesIndex, this.indexColors[i], this.types[i]);
	}
	for (var i = 0; i < this.pvYNames.length; i++) {
		var handleIndex = this.xySeriesIndexToYHandleIndex(i);
		var seriesIndex = this.handleIndexToSeriesIndex(handleIndex);

        this.xyChartImpl.seriesNameChanged(seriesIndex, this.getSeriesName(handleIndex));
        this.xyChartImpl.seriesPropertiesChanged(seriesIndex, this.XYColors[i], this.typesXY[i]);
	}
};
YAHOO.lang.extend(XyChartModel, Component);

XyChartModel.prototype.getSeriesName = function(handleIndex) {

	var seriesIndex = this.handleIndexToSeriesIndex(handleIndex); 
    var name;
    var i;
    if (seriesIndex < this.pvIndexNames.length) {
    	i = seriesIndex;
    	name = this.resolvedPlotName[i];
    	if (!name || name == "") {
    		name = this.resolvedIndexNames[i];
    	}
    } else {
    	i = seriesIndex - this.pvIndexNames.length;
    	name = this.resolvedPlotXYName[i];
    	if (!name || name == "") {
    		name = this.resolvedPVXNames[i] + " " + this.resolvedPVYNames[i]; 
    	}
    }
    return name;
};

//routines
XyChartModel.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "XyChartModel.preInitialize() requires two arguments.");		


	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.preInitialize: Handle " + handle + " not found!");	

	this.resolvedNames[index] = resolvedName;

	var pvName = this.names[index];	
	var iIndex = this.findIndexInArray(pvName,this.pvIndexNames);
	if(iIndex >= 0)
		this.resolvedIndexNames[iIndex] = resolvedName;

	var yIndex = this.findIndexInArray(pvName,this.pvYNames);	
	if(yIndex >= 0)
		this.resolvedPVYNames[yIndex] = resolvedName;

	var xIndex = this.findIndexInArray(pvName,this.pvXNames);	 		
	if(xIndex >= 0)
		this.resolvedPVXNames[xIndex] = resolvedName;

	this.manager.connect(handle,resolvedName);	
    this.xyChartImpl.seriesNameChanged(this.handleIndexToSeriesIndex(index), this.getSeriesName(index));
};

XyChartModel.prototype.handleIndexToIndexSeriesIndex = function(index) {
	return this.findIndexInArray(this.names[index], this.pvIndexNames);
};

XyChartModel.prototype.handleIndexToXySeriesIndex = function(index) {
	var name = this.names[index];
	var yIndex = this.findIndexInArray(name, this.pvYNames);	
	var xIndex = this.findIndexInArray(name, this.pvXNames);
	return yIndex != -1 ? yIndex : xIndex;
};

XyChartModel.prototype.indexSeriesIndexToHandleIndex = function(index) {
	return this.findIndexInArray(this.pvIndexNames[index], this.names);
};

XyChartModel.prototype.xySeriesIndexToXHandleIndex = function(index) {
	return this.findIndexInArray(this.pvXNames[index], this.names);
};

XyChartModel.prototype.xySeriesIndexToYHandleIndex = function(index) {
	return this.findIndexInArray(this.pvYNames[index], this.names);
};

XyChartModel.prototype.handleIndexToXySeriesIndex = function(index) {
	var name = this.names[index];
	var yIndex = this.findIndexInArray(name, this.pvYNames);	
	var xIndex = this.findIndexInArray(name, this.pvXNames);
	return yIndex != -1 ? yIndex : xIndex;
};

XyChartModel.prototype.handleIndexToSeriesIndex = function(index) {
	var i = this.handleIndexToIndexSeriesIndex(index);
	if (i >= 0) {
		return i; 
	}
	i = this.handleIndexToXySeriesIndex(index);
	if (i >= 0) {
		return this.pvIndexNames.length + i; 
	}
	return -1;
};

XyChartModel.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "XyChartModel.notifyConnectionStatus() requires two arguments.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.notifyConnectionStatus: Handle " + handle + " not found!");

	this.connected[index] = connected;
	//TODO what should we do here??	(indicate disconnected status in legend?)
};

XyChartModel.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "XyChartModel.initialize() requires one argument.");

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.initialize: Handle " + handle + " not found!");

	var monitorHandle;
	if(!this.monitorHandles[index])
		monitorHandle = this.manager.createMonitor(handle,this);    		

	this.monitorHandles[index] = monitorHandle;

};


XyChartModel.prototype.reregister = function(handle){
	assert(arguments.length == 1, "XyChartModel.reregister() requires one argument.");		

	var newHandle;

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.reregister: Handle " + handle + " not found!");

	var pvName = this.names[index];

	newHandle = this.manager.register(pvName,this);

	this.handles[index] = newHandle;
	
	//substitute plot name
    var iIndex = this.handleIndexToIndexSeriesIndex(index);
    var xyIndex = this.handleIndexToXySeriesIndex(index); 
	if (iIndex >= 0) {
		this.resolvedPlotName[iIndex] = this.manager.substitute(this.plotName[iIndex]);
	} else if (xyIndex >= 0) {
		this.resolvedPlotXYName[xyIndex] = this.manager.substitute(this.plotXYName[xyIndex]);
	}

	//substitute plot axis labels
	if(this.xAxisLabel && this.yAxisLabel){
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
	}	

	this.resolvedNames[index] = null;	

    this.xyChartImpl.axisXLabelChanged(this.resolvedXAxisLabel);
    this.xyChartImpl.axisYLabelChanged(this.resolvedYAxisLabel);
    this.xyChartImpl.seriesNameChanged(this.handleIndexToSeriesIndex(index), this.getSeriesName(index));
};

XyChartModel.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "XyChartModel.cleanup() requires one argument.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.cleanup: Handle " + handle + " not found!");

	this.manager.destroyMonitor(this.monitorHandles[index]);
	this.monitorHandles[index] = null;

	this.manager.disconnect(this.handles[index]);
	this.manager.unregister(this.handles[index]);

	this.connected[index] = false;		

	//remove data from buffer
	this.pvValues[index] = null;
    var seriesIndex = this.handleIndexToSeriesIndex(index);
    this.xyChartImpl.seriesDataReplaced(seriesIndex, null, null);
    this.xyChartImpl.seriesNameChanged(seriesIndex, this.getSeriesName(index));
};

XyChartModel.prototype.notifyMonitor = function(handle,values,status,severity,timestamp){

	assert(arguments.length == 5, "TXyChartModel.notifyMonitor() requires five arguments.");

	// extra flags to help determine value type
	var isNumeric;
	var valueType = typeof(values);
	var isArray = (valueType == "function" || valueType == "object");
	if (isArray)
		isNumeric = (typeof(values[0]) == "number");
	else
		isNumeric = (typeof(values) == "number");

	if(!isNumeric)
		return;

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("XyChartModel.notifyMonitor: Handle " + handle + " not found!");	 

	this.pvValues[index] = values;
	
    var x = null;
    var y = null;
    
    
    var iIndex = this.handleIndexToIndexSeriesIndex(index);
    var xyIndex = this.handleIndexToXySeriesIndex(index); 
	
	if (iIndex >= 0) {
		x = timestamp;
		y = values;
	} else if (xyIndex >= 0) {
		var xIndex = this.xySeriesIndexToXHandleIndex(xyIndex); 
		if (xIndex >= 0) {
			x = this.pvValues[xIndex]; 
		} 
		var yIndex = this.xySeriesIndexToYHandleIndex(xyIndex);
		if (yIndex >= 0) {
			y = this.pvValues[yIndex]; 
		} 
	} else {
		return;
	}
	
	var xLength = x ? (x.length ? x.length : 1) : 0;
	var yLength = y ? (y.length ? y.length : 1) : 0;
	if (xLength == 0) {
		x = null;
	}
	if (yLength == 0) {
		y = null;
	}

	// If arrays are not compatible, make scalars out of them.
	if (x && y && (xLength != yLength || xLength == 1 || yLength == 1)) {
		if (x.length) {
			x = x[0];
		}
		if (y.length) {
			y = y[0];
		}
	}
	
	var seriesIndex = this.handleIndexToSeriesIndex(index);
	
	if (x && x.length || y && y.length) {
		this.xyChartImpl.seriesDataReplaced(seriesIndex, x, y);
	} else {
		this.xyChartImpl.seriesDataAppended(seriesIndex, x, y);
	}
};

//used to repaint when tab on which resides gains focus
XyChartModel.prototype.onRepaint = function(type, args, chart) {
	chart.xyChartImpl.redraw();
};

/*
 * 
 * Resize event handler. Executed when window is resized.
 * 
 */
XyChartModel.prototype.onResize = function() {
	var target = $(this.id);
	var width = target.getWidth();
	var height = target.getHeight();
	
	if (width > 0 && height > 0) {
	    this.xyChartImpl.resize(width, height);
	}
};

XyChartModel.prototype.findIndexInArray = function(element,array){
	for(var i = array.length - 1; i >= 0 ; i--)
		if(array[i] == element)
			return i;
	return -1;
};

XyChartModel.prototype.getPVName = function() {
	return ChartCommon.getPvNamesXYOrIndexed(this);
};

XyChartModel.prototype.isHistoryCapable = function() {
	return false;  
};

/*
 * 
 * Displays control data of the PV. Overidded routine.
 * 
 */
XyChartModel.prototype.showCtrlData = function() {  
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

