
barChart = function(id, manager,xAxisLabel,yAxisLabel,xLabels,xLabelsPV,pvNames) {	
	//call super class constructor	
	barChart.superclass.constructor.call(this, id, manager); 
	
	//set initial size of chart
	this.defaultWidth = 800;
	this.defaultHeight = 400;	
	
	this.chartDiv = document.getElementById(id);
	this.parentNode = this.chartDiv.parentNode;	
		
	ChartCommon.setChartDivSize(this);
			
	this.barPlot = new Chart(document.getElementById(id));
	this.barPlot.setDefaultType(CHART_BAR);
	this.barPlot.setShowLegend(true);	
	this.barPlot.setBarDistance(1);	
	if(xAxisLabel != "" && yAxisLabel != ""){
		this.xAxisLabel = xAxisLabel;
		this.yAxisLabel = yAxisLabel;
		this.resolvedXAxisLabel = this.manager.substitute(this.xAxisLabel);
		this.resolvedYAxisLabel	=  this.manager.substitute(this.yAxisLabel);	
		this.barPlot.setAxisLabels(this.resolvedXAxisLabel,this.resolvedYAxisLabel);
	}
	
	this.barPlot.initChartArea();
    
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
		this.barPlot.setHorizontalLabels(["undefined"]);			
	}
	else if(xLabels != null){
		this.xLabels = xLabels;		
		this.barPlot.setHorizontalLabels(xLabels);	
		this.barPlot.setGridDensity(xLabels.length, 10);
	}	
	else{
		this.barPlot.setHorizontalLabels(["undefined"]);	
		this.barPlot.setGridDensity(1, 10);
	}
	
    this.barPlot.setNumberOfSeries(j);    
    
    // repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.onRepaint, this); 		 
	
	// resize event
	YAHOO.util.Event.addListener(window, "resize", this.onResize, this, true); 
	   
};
YAHOO.lang.extend(barChart, Component);


//routines
barChart.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "barChart.preInitialize() requires two arguments.");		
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barChart.preInitialize: Handle " + handle + " not found!");	
	
	this.resolvedNames[index] = resolvedName;
	
	this.manager.connect(handle,resolvedName);	
		
};

barChart.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "barChart.notifyConnectionStatus() requires two arguments.");	
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barChart.notifyConnectionStatus: Handle " + handle + " not found!");
	
	this.connected[index] = connected;	
	
	//TODO what should we do here??		
};

barChart.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "barChart.initialize() requires one argument.");
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barChart.initialize: Handle " + handle + " not found!");
	
	var monitorHandle;
	if(!this.monitorHandles[index])
		monitorHandle = this.manager.createMonitor(handle,this);    		
	
	this.monitorHandles[index] = monitorHandle;
	
};



barChart.prototype.reregister = function(handle){
	assert(arguments.length == 1, "barChart.reregister() requires one argument.");		

	var newHandle;
	
	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barChart.reregister: Handle " + handle + " not found!");
	
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
		this.barPlot.setAxisLabels(this.resolvedXAxisLabel,this.resolvedYAxisLabel);	
	}
	
	this.resolvedNames[index] = null;	
	
};

barChart.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "barChart.cleanup() requires one argument.");	

	var index = this.findIndexInArray(handle,this.handles);
	if(index < 0) throw new Error("barChart.cleanup: Handle " + handle + " not found!");

	this.manager.destroyMonitor(this.monitorHandles[index]);
	this.monitorHandles[index] = null;
	
	this.connected[index] = false;	
		
	this.manager.disconnect(this.handles[index]);
	this.manager.unregister(this.handles[index]);			
	
	if(this.xLabelsHandle == handle) { //x labels pv
		this.barPlot.setHorizontalLabels(["undefined"]);
	}	
	
	//remove series from chart
	var name = this.resolvedPlotName[index];
	if(name == ""){
		name = this.resolvedNames[index];
	}
	this.barPlot.remove(name);
	
	this.barPlot.initChartArea();
	
};

barChart.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
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
	if(index < 0) throw new Error("barChart.cleanup: Handle " + handle + " not found!");	 
	
	var pvName = this.names[index];
	
	 
	if(value.length){ // array
		this.pvValues[index] = value;
	}
	else{
		value = [value]; 
		//throw new Error("PV must be array");
	}
	 
	if(this.xLabelsHandle == handle)//x labels pv
	{
		this.barPlot.setHorizontalLabels(value);	
		this.barPlot.setGridDensity(value.length, 10);	
		this.barPlot.draw();		
	}
	else{
	
		var color = this.colors[index];
		var name = this.resolvedPlotName[index];
		if(name == ""){
			name = this.resolvedNames[index];
		}
	 	this.barPlot.add(name , color, value , INDEX_VALUES);	
	 	this.barPlot.setGridDensity(value.length, 10);		
		this.barPlot.draw();
	}

};

//used to repaint when tab on which resides gains focus
barChart.prototype.onRepaint = function(type, args, barChart){
	barChart.barPlot.initChartArea();
	barChart.barPlot.draw();
};

/*
 * 
 * Resize event handler. Executed when window is resized.
 * 
 */
barChart.prototype.onResize = function(){
	this.barPlot.initChartArea();
	this.barPlot.draw();
};

barChart.prototype.findIndexInArray = function(element,array){
	var i;
	for(i = array.length - 1; i >= 0 ; i--)
		if(array[i] == element)
			return i;
	return -1;
};

barChart.prototype.getPVName = function() {
    return ChartCommon.getPvNames(this);
};

barChart.prototype.isHistoryCapable = function() {
	return false;  
};

/*
 * 
 * Displays control data of the PV. Overidded routine.
 * 
 */
barChart.prototype.showCtrlData = function() {  
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
