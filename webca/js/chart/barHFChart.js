
barHFChart = function(id, manager,xAxisLabel,yAxisLabel,xLabels,xLabelsPV,pvNames) {	
	//call super class constructor	
	barHFChart.superclass.constructor.call(this, id, manager); 
	
	//set initial size of chart
	this.defaultWidth = 800;
	this.defaultHeight = 400;	
	
	this.chartDiv = document.getElementById(id);
	this.chartDiv.chart = this;
	this.parentNode = this.chartDiv.parentNode;	
		
	ChartCommon.setChartDivSize(this);
			
	this.plotNames = new Array();
	this.plotData = new Hash();
	this.plotOptions = {
		legend: {backgroundOpacity: .75 },
	    xaxis: {noTicks: 10},
	    yaxis: {noTicks: 10},
	    selection: {mode: 'xy'},
        mouse: {track: true, sensibility: 1},
	    bars: {show:true, barWidth:1}
	};
	this.zoom = false;
		
	if(xAxisLabel != "" && yAxisLabel != ""){
		this.xAxisLabel = xAxisLabel;
		this.yAxisLabel = yAxisLabel;
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
		this.plotOptions.xaxis.label = this.resolvedXAxisLabel;
		this.plotOptions.yaxis.label = this.resolvedYAxisLabel;
	}
	
	this.plot = Flotr.draw($(this.id), this.plotData.values(), this.plotOptions);
    
    this.color = new Color();

	this.pvNames = pvNames;
	
	//array of handles
	this.handles = new Array();
	//array of names 
	this.names = new Array();
	//array of colors used by index chart
	this.colors = new Array();
	//array of resolved names
	this.resolvedNames = new Array();
	//array of pv values
	this.pvValues = new Array();
	//plot name
	this.plotName = new Array();
	//resoved name
	this.resolvedPlotName = new Array();	
	//array of monitor handles
	this.monitorHandles = new Array();
	//array of connected states
	this.connected = new Array();	
	
	this.maxSeriesLen = 0;
	this.barLabels = new Array();
		
	var j = 0;
	var i = 0;
	var handle;
	
	
	var haveIt = false;
	
	for(i = 0; i < pvNames.length; i++){ // register all names
	
		
		if(pvNames[i].PVName != ''){
			
			for(var l = 0; l < this.names.length; l++){ // we already have it
				if(this.names[l] == pvNames[i].PVName) haveIt = true;
			}	
			
			if(!haveIt){
				handle = this.manager.register(pvNames[i].PVName,this);
				this.handles[j] = handle;
				this.names[j] = pvNames[i].PVName;				
				this.plotName[j] = pvNames[i].name;
				this.resolvedPlotName[j] =  this.manager.substitute(pvNames[i].name);				
				this.colors[j++] = this.color.getRandomColor();
			}
			else haveIt = false;

		}		
	}
	
	// x labels
	if(xLabelsPV != "")
	{	
		this.names[j] = xLabelsPV;
		handle = this.manager.register(xLabelsPV,this);
		this.handles[j] = handle;
		this.xLabelsHandle = handle;
		this.setBarLabels([]);
	}
	else if(xLabels != null){
		this.xLabels = xLabels;		
		this.setBarLabels(xLabels);
	}	
	else{
		this.setBarLabels([]);
	}
	
    // repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.onRepaint, this); 		 
	
	// resize event
	YAHOO.util.Event.addListener(window, "resize", this.onResize, this, true); 

	this.registerZoomEvents();
};
YAHOO.lang.extend(barHFChart, Component);

barHFChart.prototype.registerZoomEvents = function() {

    $(this.id).observe('flotr:select', function(event) {

    	var area = event.memo[0];
    	var sel = event.memo[1];
      	var chart = event.element().chart;
      	
      	if (Math.abs(sel.x2 - sel.x1) >= 2 && Math.abs(sel.y2 - sel.y1) >= 2) {
      		chart.zoom = true;
	      	chart.plotOptions.xaxis.min = area.x1; 
	      	chart.plotOptions.xaxis.max = area.x2; 
	      	chart.plotOptions.yaxis.min = area.y1; 
	      	chart.plotOptions.yaxis.max = area.y2; 
      	} else {
      		chart.zoom = false;
	      	chart.plotOptions.xaxis.min = 0; 
	      	chart.plotOptions.xaxis.max = chart.maxSeriesLen * chart.colors.length; 
	      	chart.plotOptions.yaxis.min = undefined;
	      	chart.plotOptions.yaxis.max = undefined;
      	}
	    chart.plot.clearSelection();
	    chart.plot.refresh(chart.plotData.values(), chart.plotOptions);
    });
};

//routines
barHFChart.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "barHFChart.preInitialize() requires two arguments.");		
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barHFChart.preInitialize: Handle " + handle + " not found!");	
	
	this.resolvedNames[index] = resolvedName;
	
	this.manager.connect(handle,resolvedName);	
		
};

barHFChart.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "barHFChart.notifyConnectionStatus() requires two arguments.");	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barHFChart.notifyConnectionStatus: Handle " + handle + " not found!");
	
	this.connected[index] = connected;	
	
	//TODO what should we do here??		
};

barHFChart.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "barHFChart.initialize() requires one argument.");
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barHFChart.initialize: Handle " + handle + " not found!");
	
	var monitorHandle;
	if(!this.monitorHandles[index])
		monitorHandle = this.manager.createMonitor(handle,this);    		
	
	this.monitorHandles[index] = monitorHandle;
	
};



barHFChart.prototype.reregister = function(handle){
	assert(arguments.length == 1, "barHFChart.reregister() requires one argument.");		

	var newHandle;
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barHFChart.reregister: Handle " + handle + " not found!");
	
	var pvName = this.names[index];
	
	newHandle = this.manager.register(pvName,this);
	
	this.handles[index] = newHandle;
	
	if(this.xLabelsHandle == handle)
		this.xLabelsHandle = newHandle;
	
	//substitute plot name	
	if(this.xLabelsHandle != newHandle)
		this.resolvedPlotName[index] = this.manager.substitute(this.plotName[index]);
	
	//substitute plot axis labels
	if(this.xAxisLabel && this.yAxisLabel){
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
		this.plotOptions.xaxis.label = this.resolvedXAxisLabel;
		this.plotOptions.yaxis.label = this.resolvedYAxisLabel;
	}
	
	this.resolvedNames[index] = null;	
	
};

barHFChart.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "barHFChart.cleanup() requires one argument.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barHFChart.cleanup: Handle " + handle + " not found!");

	this.manager.destroyMonitor(this.monitorHandles[index]);
	this.monitorHandles[index] = null;
	
	this.connected[index] = false;	
		
	this.manager.disconnect(this.handles[index]);
	this.manager.unregister(this.handles[index]);			
	
   	this.pvValues[index] = [];

    if (this.refreshMaxSeriesLen()) {
   	    this.setBarLabels(this.barLabels);
    }
	
	if (this.xLabelsHandle == handle) {
   		this.setBarLabels([]);
    } else {
		var name = this.resolvedPlotName[index];
		if(name == ""){
			name = this.resolvedNames[index];
		}
		
		this.plotData.unset(name);
    }
    this.plot.refresh(this.plotData.values(), this.plotOptions);
};

barHFChart.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
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
	if(index < 0) throw new Error("barHFChart.cleanup: Handle " + handle + " not found!");	 
	
	var pvName = this.names[index];
	
	 
	if(!value.length){ // not array
		value = [value]; 
		//throw new Error("PV must be array");
	}
   	this.pvValues[index] = value;

    if (this.refreshMaxSeriesLen()) {
   	    this.setBarLabels(this.barLabels);
    }

    if (this.xLabelsHandle == handle) {
   		this.setBarLabels(value);
    } else {
		var color = this.colors[index];
		var name = this.resolvedPlotName[index];
		if(name == ""){
			name = this.resolvedNames[index];
		}

		var series = this.colors.length;
		var data = new Array();
 		for(var i = 0; i < value.length; i++){
 			data[i] = [i * series + index, value[i]];
		}	
 		this.plotData.set(name, {
 			color: color,
 			data: data,
 			label: name,
   			mouse: {lineColor: color}
 		});
	}

   	this.plotOptions.xaxis.noTicks = value.length;

    this.plot.refresh(this.plotData.values(), this.plotOptions);
};

//used to repaint when tab on which resides gains focus
barHFChart.prototype.onRepaint = function(type, args, chart){
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
barHFChart.prototype.onResize = function(){
	var target = $(this.id);
	if (target.getWidth() > 0 && target.getHeight() > 0) {
        this.plot = Flotr.draw(target, this.plotData.values(), this.plotOptions);
	}
};

barHFChart.prototype.findIndexInArray = function(element,array){
	var i;
	for(i = array.length - 1; i >= 0 ; i--)
		if(array[i] == element)
			return i;
	return -1;
};

barHFChart.prototype.refreshMaxSeriesLen = function() {
    var maxLen = 0;
    
    for (var i = 0; i < this.pvValues.length; i++) {
    	if (this.pvValues[i] != null && maxLen < this.pvValues[i].length) {
    		maxLen = this.pvValues[i].length;
    	}
    }
    if (maxLen != this.maxSeriesLen) {
    	this.maxSeriesLen = maxLen;
    	return true;
    }
    return false;
};

barHFChart.prototype.setBarLabels = function(labels) {
    this.barLabels = labels;
    
    var series = this.colors.length;
    var ticks = new Array();
    for (var i = 0; i < this.maxSeriesLen; i++) {
    	ticks.push([(i + .5) * series, i < labels.length ? labels[i].toString() : "undefined"]);
    }
    this.plotOptions.xaxis.ticks = ticks;
    if (!this.zoom) {
	    this.plotOptions.xaxis.min = 0;
	    this.plotOptions.xaxis.max = this.maxSeriesLen * this.colors.length;
    }
};

barHFChart.prototype.getPVName = function() {
    return ChartCommon.getPvNames(this);
};

barHFChart.prototype.isHistoryCapable = function() {
	return false;  
};

/*
 * 
 * Displays control data of the PV. Overidded routine.
 * 
 */
barHFChart.prototype.showCtrlData = function() {  
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
    	
    	table = doc.createElement("table"); 	
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
