/******************************************
ctrlData class is used to hold ctrl data
*******************************************/
CTRLData = function(/*Number*/ status,/*Number*/ severity,/*Number or Array */value,/*Object*/ ctrl){
	//status
	this.status = status;
	
	//severity
	this.severity = severity;
	
	//precision
	if(ctrl.precision != null)
		this.precision = ctrl.precision;
	else
		this.precision = null;
		
	//units	
	if(ctrl.units != null)
		this.units = ctrl.units;
	else 
		this.units = null;
		
	
	//display limits
	if(ctrl.upperDisplayLimit != undefined)
		this.upperDisplayLimit = ctrl.upperDisplayLimit;	
	else 
		this.upperDisplayLimit = null;		
		
	if(ctrl.lowerDisplayLimit != null)	
		this.lowerDisplayLimit = ctrl.lowerDisplayLimit;	
	else
		this.lowerDisplayLimit = null;
	
	// control limits
	if(ctrl.upperControlLimit != null)
		this.upperControlLimit = ctrl.upperControlLimit;	
	else
		this.upperControlLimit = null;
		
	if(ctrl.lowerControlLimit != null)	
		this.lowerControlLimit = ctrl.lowerControlLimit;	
	else
		this.lowerControlLimit = null;
	
	//alarm limits	
	if(ctrl.upperAlarmLimit != null)
		this.upperAlarmLimit = ctrl.upperAlarmLimit;	
	else
		this.upperAlarmLimit = null;
		
	if(ctrl.upperWarningLimit != null)	
		this.upperWarningLimit = ctrl.upperWarningLimit;	
	else
		this.upperWarningLimit = null;
	
	if(ctrl.lowerAlarmLimit != null)
		this.lowerAlarmLimit = ctrl.lowerAlarmLimit;	
	else
		this.lowerAlarmLimit = null;
		
	if(ctrl.lowerWarningLimit != null)	
		this.lowerWarningLimit = ctrl.lowerWarningLimit;	
	else
		this.lowerWarningLimit = null;
		
	//labels	
	if(ctrl.labels != null)	
		this.labels = ctrl.labels;
	else
		this.labels = null;
	
	//value
	this.value = value;
	
	// extra flags to help determine value type
	var valueType = typeof(value);
	this.isArray = (valueType == "function" || valueType == "object");
	if (this.isArray)
		this.isNumeric = (typeof(value[0]) == "number");
	else
		this.isNumeric = (typeof(value) == "number");
};

CTRLData.prototype.getStatus = function(){
	return this.status;
};

CTRLData.prototype.getSeverity = function(){
	return this.severity;
};

CTRLData.prototype.getPrecision = function(){
	return this.precision;
};

CTRLData.prototype.getUnits = function(){
	return this.units;
};

CTRLData.prototype.getUpperDisplayLimit = function(){
	return this.upperDisplayLimit;
};

CTRLData.prototype.getLowerDisplayLimit = function(){
	return this.lowerDisplayLimit;
};

CTRLData.prototype.getUpperControlLimit = function(){
	return this.upperControlLimit;
};

CTRLData.prototype.getLowerControlLimit = function(){
	return this.lowerControlLimit;
};

CTRLData.prototype.getUpperAlarmLimit = function(){
	return this.upperAlarmLimit;
};

CTRLData.prototype.getUpperWarningLimit = function(){
	return this.upperWarningLimit;
};

CTRLData.prototype.getLowerAlarmLimit = function(){
	return this.lowerAlarmLimit;
};

CTRLData.prototype.getLowerWarningLimit = function(){
	return this.lowerWarningLimit;
};

CTRLData.prototype.getLabels = function(){
	return this.labels;
};

CTRLData.prototype.getValue = function(){
	return this.value;
};
