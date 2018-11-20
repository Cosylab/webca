/******************************************
Component object
******************************************/
Component = function(id, manager){
	this.id = id;
	
    this.manager = manager;
    this.pvValue = null;
    this.history = null;
    this.historyEnabled = true;
    this.historyCapable = true;
    this.setHistoryEnabled(false);
		
};	

Component.prototype.repaint = function(){
	
};

Component.prototype.clear = function(){
	
};

/*
 * Returns top html element of the component
 * 
 * @return {Object} top html element of component
 * 
 */
Component.prototype.getHTMLElement = function(){
	return document.getElementById(this.id);
};

Component.prototype.storeHistoryEntry = function(value, timestamp, status, severity) {
    this.pvValue = value;
    if ((value == null || Clipboard.isArray(value)) && this.historyCapable) {
    	this.historyCapable = false;
    	this.setHistoryEnabled(false);
    }
    
    if (this.historyEnabled) {
    	timestamp = dateFormat(new Date().setTime(timestamp), dateFormat.masks.isoDateTimeL); 
    	status = epicsDef.getCaStatus(status).name;
    	severity = epicsDef.getAlarmSeverity(severity);
    	this.history.push([value, timestamp, status, severity]);
    	
 		// Only rememeber the last few values to avoid oversized displays/clipboard.  
 		if (this.history.length > 1024) {
 			for(var i = 0; i < this.history.length - 1; i++){
	 			this.history[i] = this.history[i + 1];
	 		}
	 		this.history.pop();
	 	}
    }
};

// The following functions are the interface to the context menu. 

Component.prototype.hasContextMenu = function() {
	return true;  
};

Component.prototype.getLink = function() {
	return null;  
};

Component.prototype.getPVName = function() {
	return null;  
};

Component.prototype.getPVValue = function() {
	return this.pvValue;  
};

Component.prototype.showCtrlData = function() {  
};

Component.prototype.isHistoryCapable = function() {
	return this.historyCapable;  
};

Component.prototype.isHistoryEnabled = function() {
	return this.historyEnabled;  
};

Component.prototype.setHistoryEnabled = function(historyEnabled) {
	if (this.historyEnabled != historyEnabled) {
    	this.historyEnabled = historyEnabled;
    	this.history = historyEnabled ? [['Value', 'Timestamp', 'Status',  'Severity']] : [];
	}
};

Component.prototype.getHistory = function() {
	return this.historyEnabled ? this.history : null; 
};

Component.prototype.showHistory = function() {
    var win = window.open("", this.id, "width=512,height=512,scrollbars=yes,resizable=yes,status=no,location=no,menubar=no,toolbar=no");
    if (win) {
	    var doc = win.document;
	    
	    var name = this.getPVName();
	    if (name == null) {
	    	name = "";
	    }
	    doc.write("<html><head><title>" + name + " history</title></head><body><h3>"
	        + name + " history:</h3>"
	        + Clipboard.convertToHtmlTable(this.history) + "</body></html>");

    	var table = doc.body.childNodes[1]; 	
    	table.setAttribute("border", "1");
        table.setAttribute("width", "100%");
	    doc.close();            
    }
};
