/*****************************************
*Monitor object
*****************************************/
Monitor = function(readbackName,id, manager, alarmSensitive) {
	this.readbackName = readbackName;	
	this.resolvedReadbackName;
	this.readbackHandle;		
	this.monitorHandle;		
	this.ctrlData;
	this.alarmSensitive = alarmSensitive;	
	this.connected = false;
	
	if(id != null){
		//only top element of component should have 'component' in class definition - for context menu
		this.topCssClass = document.getElementById(id).className;	
		this.topInvalidClass = this.topCssClass + " invalid";
		this.topMinorClass = this.topCssClass + " minor";
		this.topMajorClass = this.topCssClass + " major";					

		this.cssClass = this.topCssClass.substring(9,this.topCssClass.length);
		this.invalidClass = this.cssClass + " invalid";
		this.minorClass = this.cssClass + " minor";
		this.majorClass = this.cssClass + " major";		
	}	
	Monitor.superclass.constructor.call(this, id, manager); 
};
YAHOO.lang.extend(Monitor, Component); 


//default routines
Monitor.prototype.reregister = function(handle){
	assert(arguments.length == 1, "Monitor.reregister() requires one argument.");	
	this.readbackHandle = this.manager.register(this.readbackName,this);
};

Monitor.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "Monitor.preInitialize() requires two arguments.");		
	this.resolvedReadbackName = resolvedName;	
	document.getElementById(this.id).className = this.topInvalidClass;
	this.pvValue = null;
	this.manager.connect(handle,resolvedName);	
};

Monitor.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "Monitor.initialize() requires one argument.");			
	this.manager.getCtrl(handle);	
};

Monitor.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "Monitor.notifyGetCtrl() requires two arguments.");			
	this.ctrlData = ctrlData;
	this.setAlarm(this.ctrlData.getSeverity());
};

Monitor.prototype.notifyGet = function(handle, value, status, severity, timestamp){
	assert(arguments.length == 5, "Monitor.notifyGet() requires five arguments.");
};

Monitor.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "Monitor.notifyConnectionStatus() requires two arguments.");			
	this.connected = connected;
    if(connected){
 		document.getElementById(this.id).className = this.topCssClass;			
    }
    else{ 
        document.getElementById(this.id).className = this.topInvalidClass;
        this.pvValue = null;
    }
};

Monitor.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "Monitor.cleanup() requires one argument.");
	this.connected = false;
	this.ctrlData = null;
	this.manager.destroyMonitor(this.monitorHandle);
	this.monitorHandle = null;
	this.manager.disconnect(this.readbackHandle);
	this.manager.unregister(this.readbackHandle);
	this.pvValue = null;
};

Monitor.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "Monitor.notifyMonitor() requires five arguments.");	
	this.setAlarm(severity);
	this.storeHistoryEntry(value, timestamp, status, severity);
};

Monitor.prototype.setAlarm = function(severity){
	assert(arguments.length == 1, "Monitor.setAlarm() requires one argument.");	
	document.getElementById(this.id).className = this.topCssClass;
	
	if(this.alarmSensitive){
		if(severity == 1)
			document.getElementById(this.id).className = this.topMinorClass;		
		if(severity == 2)
			document.getElementById(this.id).className = this.topMajorClass;
		if(severity == 3)
			document.getElementById(this.id).className = this.topInvalidClass;	
	}	
};

Monitor.prototype.getSeverityClass = function(severity) {
	if(this.alarmSensitive){
		switch (severity) {
			case(1):
			    return this.minorClass;
			case(2):
			    return this.majorClass;
			case(3):
			    return this.invalidClass;
		}
	}
	return this.cssClass;
};

Monitor.prototype.getReadbackName = function(){
	return this.readbackName;
};

Monitor.prototype.getResolvedReadbackName = function(){
	return this.resolvedReadbackName;
};

Monitor.prototype.getResolvedCTRLName = function(){
	return this.resolvedReadbackName;
};

Monitor.prototype.getFormattedValue = function(value,precisionFromPV,formatter){
	assert(arguments.length == 3, "Monitor.getFormattedValue() requires three arguments.");	
	 
	var displayAsNumeric = (this.isNumeric && this.ctrlData.isNumeric);

	if (this.ctrlData.isArray)
	{

		var strValue = "[";

		var len = value.length;
		if (len > 0)
		{
			var i;
			for (i = 0; i < len; i++)
			{
				if (!displayAsNumeric) {
					strValue = strValue + value[i];
	 			}
				else if (precisionFromPV) {
					strValue = strValue + value[i].toFixed(this.ctrlData.getPrecision());
				}
				else {	 	
					formatter.setString(value[i].toString());
					strValue = strValue + formatter.getString();	 	 
				}
				
				if (i < (len - 1))
					strValue = strValue + ","; 
			}
		}
 
		strValue = strValue + "]";

		return strValue;
	}
	else
	{
		 if (!displayAsNumeric) {
			 return value;
		 }
		 else if (precisionFromPV) {
			return value.toFixed(this.ctrlData.getPrecision());
		 }
		 else {	 	
			formatter.setString(value.toString());
			return formatter.getString();	 	 
	 	 }
	}
};

/*
 * 
 * Displays control data of the PV
 * 
 */
Monitor.prototype.getPVName = function() {
	return this.resolvedReadbackName;  
};

Monitor.prototype.showCtrlData = function() {  
    var win = window.open("", this.id, "width=400,height=500," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
    if (!win) return;
    var doc = win.document;
    doc.write("<html><head><title>PV Inspector</title></head><body></body>");

 	doc.title = "PV inspector";
 	
 	var nbsp = String.fromCharCode(160); 
 	
	var heading = doc.createElement("h3");
 	heading.appendChild(doc.createTextNode("Readback PV:"));
 	doc.body.appendChild(heading); 		
 		
	var table = doc.createElement("table"); 	
	doc.body.appendChild(table);
	table.setAttribute("border","1");
	table.setAttribute("width","100%"); 		
 		
 	/*}*/
 	
    createRow(doc,table,"PV resolved name",this.getResolvedReadbackName());
    createRow(doc,table,"PV unresolved name",this.getReadbackName());
      
    if(this.ctrlData == null){
    	doc.close(); 
    	return;
    }
    
    var heading = doc.createElement("h3");
   	heading.appendChild(doc.createTextNode("CTRL Data:"));
   	doc.body.appendChild(heading); 		
   	
	var table = doc.createElement("table"); 	
 	doc.body.appendChild(table);
	table.setAttribute("border","1");
    table.setAttribute("width","100%");
    
        	
    
    createRow(doc,table,"Units",(this.ctrlData.getUnits() == null)? "undefined" : this.ctrlData.getUnits());
    createRow(doc,table,"Precision",(this.ctrlData.getPrecision() == null)? "undefined" :this.ctrlData.getPrecision());
    createRow(doc,table,"Upper display limit",(this.ctrlData.getUpperDisplayLimit() == null)? "undefined" : this.ctrlData.getUpperDisplayLimit());
    createRow(doc,table,"Lower display limit",(this.ctrlData.getLowerDisplayLimit() == null)? "undefined" : this.ctrlData.getLowerDisplayLimit());
    createRow(doc,table,"Upper alarm limit",(this.ctrlData.getUpperAlarmLimit() == null)? "undefined" : this.ctrlData.getUpperAlarmLimit());
	createRow(doc,table,"Upper warning limit",(this.ctrlData.getUpperWarningLimit() == null)? "undefined" : this.ctrlData.getUpperWarningLimit());
    createRow(doc,table,"Lower alarm limit",(this.ctrlData.getLowerAlarmLimit() == null)? "undefined" : this.ctrlData.getLowerAlarmLimit());
    createRow(doc,table,"Lower warning limit",(this.ctrlData.getLowerWarningLimit() == null)? "undefined" : this.ctrlData.getLowerWarningLimit());
    createRow(doc,table,"Upper control limit",(this.ctrlData.getUpperControlLimit() == null)? "undefined" : this.ctrlData.getUpperControlLimit());
    createRow(doc,table,"Lower control limit",(this.ctrlData.getLowerControlLimit() == null)? "undefined" : this.ctrlData.getLowerControlLimit());
      
    if(this.ctrlData.getLabels() != null){
    	var labels = this.ctrlData.getLabels();
    	
     	var row = doc.createElement("tr");  
     	table.appendChild(row);   
     	
		var column = doc.createElement("td");
	    column.appendChild(doc.createTextNode("Labels"));
    	row.appendChild(column);     	
    	
    	column = doc.createElement("td");
    	column.appendChild(doc.createTextNode(labels[0]));
    	row.appendChild(column); 
     	
   		var i;
   		for(i=1; i < labels.length; i++){
   			row = doc.createElement("tr"); 
   			table.appendChild(row);   
			column = doc.createElement("td");
			column.appendChild(doc.createTextNode(nbsp));
   			row.appendChild(column);     
   			column = doc.createElement("td");
   			row.appendChild(column);     
   			column.appendChild(doc.createTextNode(labels[i])); 
   			
   		}
    }	
    
    doc.close();            
};
