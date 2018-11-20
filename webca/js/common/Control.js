/******************************************	
Control object
******************************************/
Control = function(controlName,readbackName,id, manager,alarmSensitive, readOnly) {
	this.controlName = controlName;
	this.resolvedControlName;
	this.controlHandle;
	this.readOnly = readOnly;
	
	this.writableMonitor = null;
	this.writable = this.readOnly != "true";
	Control.superclass.constructor.call(this, readbackName, id, manager, alarmSensitive); 
};
YAHOO.lang.extend(Control, Monitor); 

Control.prototype.createWritableMonitor = function(controlHandle) {
    /* Does not register the monitor if the writable state is defined.
     */
    if (this.readOnly == "auto" && !this.writableMonitor) {
    	this.writableMonitor = this.manager.createWritableMonitor(controlHandle); 
    }
};

Control.prototype.destroyWritableMonitor = function(controlHandle) {
	if (this.readOnly == "auto") {
		this.manager.destroyWritableMonitor(this.writableMonitor);
		this.writableMonitor = null;
	}
};

Control.prototype.notifyPut = function(handle,status){
	assert(arguments.length == 2, "Control.notifyPut() requires two arguments.");
};

Control.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "Control.notifyWritableStatus() requires two arguments.");			
    this.writable = writable;
    //webcaLog("Control.notifyWritableStatus: " + this.readbackName + "(" + handle + ")" + writable);
};

Control.prototype.getControlName = function(){
	return this.controlName;
};

Control.prototype.getResolvedControlName = function(){
	return this.resolvedControlName;
};

Control.prototype.getPVName = function() {
	return this.resolvedControlName;  
};

/*
 * 
 * Displays control data of the PV
 * 
 */
Control.prototype.showCtrlData = function() {  
    var win = window.open("", this.id, "width=400,height=500," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
    if (!win) return;
    var doc = win.document;
    doc.write("<html><head><title>PV Inspector</title></head><body></body>");

 	doc.title = "PV inspector";
 	
 	var nbsp = String.fromCharCode(160); 
 	
	var heading = doc.createElement("h3");
	heading.appendChild(doc.createTextNode("Control PV:"));
	doc.body.appendChild(heading);
 		
	var table = doc.createElement("table"); 	
 	doc.body.appendChild(table);
	table.setAttribute("border","1");
    table.setAttribute("width","100%");  		
	
	createRow(doc,table,"PV resolved name",this.getResolvedControlName());
	createRow(doc,table,"PV unresolved name",this.getControlName());
 		
	heading = doc.createElement("h3");
	heading.appendChild(doc.createTextNode("Readback PV:"));
	doc.body.appendChild(heading); 		
 		
	table = doc.createElement("table"); 	
 	doc.body.appendChild(table);
	table.setAttribute("border","1");
    table.setAttribute("width","100%");   		

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
