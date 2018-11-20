
TextUpdate = function(name,id, manager,dataType,alarmSensitive,displayFormat){	
	//call super class constructor	
	TextUpdate.superclass.constructor.call(this,name,id, manager,alarmSensitive); 	
	
	this.dataType = dataType;
	this.isNumeric = (this.dataType == "numeric");
	
	this.timestampDate = new Date();
	this.defaultTimestampFormat = "isoDateTimeL"; 

	this.checkDisplayTemplate(displayFormat);
	// Only parse if no template found.
	if (this.displayTemplate == this.templateNone) {
    	this.formatTokens = this.getFormatTokens(displayFormat);
	}

	//html object
	this.htmlElement = document.getElementById(id);

	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);		
};
YAHOO.lang.extend(TextUpdate, Monitor);

//routines definition
TextUpdate.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "TextUpdate.preInitialize() requires two arguments.");	
	TextUpdate.superclass.preInitialize.call(this, handle,resolvedName);
	this.setHtmlValue(this.resolvedReadbackName);
};	

TextUpdate.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "TextUpdate.notifyConnectionStatus() requires two arguments.");		
    TextUpdate.superclass.notifyConnectionStatus.call(this, handle,connected);
   	if(!connected){
    	this.setHtmlValue(this.resolvedReadbackName);
    }    
};		
		
TextUpdate.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "TextUpdate.cleanup() requires one argument.");
	TextUpdate.superclass.cleanup.call(this,handle);
	this.setHtmlValue(this.resolvedReadbackName);
};

TextUpdate.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "TextUpdate.notifyGetCtrl() requires two arguments.");
	TextUpdate.superclass.notifyGetCtrl.call(this,handle,ctrlData);
	if(!this.monitorHandle)
		this.monitorHandle = this.manager.createMonitor(handle,this);    
};	

TextUpdate.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "TextUpdate.notifyMonitor() requires five arguments.");
	TextUpdate.superclass.notifyMonitor.call(this,handle,value,status,severity,timestamp);

	this.valueRec = value;
	this.statusRec = status;
	this.alarmRec = severity;
	this.timestampRec = timestamp;

    var	innerHTML;
	if (this.displayTemplate == this.templateNormal) {

		var unit = this.getUnitStr(null);
		if (unit == null) {
			innerHTML = this.getValueStr(null);
		} else {
			innerHTML = this.getValueStr(null) + " " + unit;
		}
		
	} else if (this.displayTemplate != this.templateNone) {

		var unit = this.getUnitStr(null);
		unit = unit != null ? " " + unit : ""; 

		if (this.displayTemplate == this.templateTimestamp) {
		    innerHTML = this.getValueStr(null) + unit + " " + this.getTimestampStr(null);
		} else if (this.displayTemplate == this.templateComplete) {
		    innerHTML = this.getValueStr(null) + unit + " " + this.getTimestampStr(null) + " " + this.getAlarmStr(null) + " " + this.getStatusStr(null);
		}
	
    } else {
        var token;
        var string;
        innerHTML = "";

        for (var i = 0; i < this.formatTokens.length; i++) {
        	token = this.formatTokens[i];
        	string = this[token.funct](token.param);
         	if (string != null) {
         		if (i > 0) {
         			innerHTML += " ";
         		}
         	    innerHTML += string;
        	}
        }
    }
	this.setHtmlValue(innerHTML);
};

TextUpdate.prototype.setHtmlValue = function(value) {
	this.htmlElement.innerHTML = value != null && value != "" ? value : "&nbsp;"; 
};

TextUpdate.prototype.getValueStr = function(param) {
    return this.getFormattedValue(this.valueRec, param == null, param); 
};

TextUpdate.prototype.getUnitStr = function(param) {
	var displayAsNumeric = this.isNumeric && this.ctrlData.isNumeric;
	return displayAsNumeric ? this.ctrlData.getUnits() : null;
};

TextUpdate.prototype.getStatusStr = function(param) {
	return param == 'c' ? epicsDef.getCaStatus(this.statusRec).code : epicsDef.getCaStatus(this.statusRec).name;
};

TextUpdate.prototype.getTimestampStr = function(param) {
	this.timestampDate.setTime(this.timestampRec);
	return dateFormat(this.timestampDate, param != null ? param : this.defaultTimestampFormat);
};

TextUpdate.prototype.getAlarmStr = function(param) {
	return epicsDef.getAlarmSeverity(this.alarmRec);
};

TextUpdate.prototype.getTextStr = function(param) {
	return param;
};

TextUpdate.prototype.checkDisplayTemplate = function(displayFormat) {

	this.templateNone = 0;
	this.templateNormal = 1;
	this.templateTimestamp = 2;
	this.templateComplete = 3;
	
	this.displayTemplate = this.templateNone;
	if (displayFormat == null || displayFormat == "" || displayFormat == "normal") {
    	this.displayTemplate = this.templateNormal;
	} else if (displayFormat == "timestamp") {
    	this.displayTemplate = this.templateTimestamp;
	} else if (displayFormat == "complete") {
    	this.displayTemplate = this.templateComplete;
	}
};

TextUpdate.prototype.getFormatTokens = function(displayFormat) {
    var functArray = new Array();
    
    var paramExp = "(?:[(]([^)]*)[)])?";  
    
    var valueExp = "[vV]" + paramExp;  
    var unitExp = "[uU]" + paramExp;  
    var statusExp = "[sS]" + paramExp;  
    var timestampExp = "[tT]" + paramExp;  
    var alarmExp = "[aA]" + paramExp;  
    var textExp = "[']([^']*)[']";  
    // Backward compatibility.
    var formatExp = "[+#0eE.]+";  

    var valueRegEx = new RegExp("^" + valueExp + "$");  
    var unitRegEx = new RegExp("^" + unitExp + "$") ;  
    var statusRegEx = new RegExp("^" + statusExp + "$");  
    var timestampRegEx = new RegExp("^" + timestampExp + "$");  
    var alarmRegEx = new RegExp("^" + alarmExp + "$");  
    var textRegEx = new RegExp("^" + textExp + "$");  
    var formatRegEx = new RegExp("^" + formatExp + "$");  

    var tokenList = [valueExp, unitExp, statusExp, timestampExp, alarmExp, textExp, formatExp];
    
    var tokenExp = "";
    for (var i = 0; i < tokenList.length; i++) {
    	tokenExp += tokenList[i] + ((i < tokenList.length - 1) ? "|" : "");
    }
	var tokenRegEx = new RegExp(tokenExp, "g");

	var result;
	var token;
	while ((result = tokenRegEx.exec(displayFormat)) != null) {
		token = result[0];
		if ((result = valueRegEx.exec(token)) != null) {
			functArray.push({id: 'v', funct: "getValueStr", param: new Formatter(result[1])});
		} else if ((result = unitRegEx.exec(token)) != null) {
			functArray.push({id: 'u', funct: "getUnitStr", param: result[1]});
		} else if ((result = statusRegEx.exec(token)) != null) {
			functArray.push({id: 's', funct: "getStatusStr", param: result[1]});
		} else if ((result = timestampRegEx.exec(token)) != null) {
			functArray.push({id: 't', funct: "getTimestampStr", param: result[1]});
		} else if ((result = alarmRegEx.exec(token)) != null) {
			functArray.push({id: 'a', funct: "getAlarmStr", param: result[1]});
		} else if ((result = textRegEx.exec(token)) != null) {
			functArray.push({id: 'x', funct: "getTextStr", param: result[1]});

        // Backward compatibility: format => v(format)u
		} else if ((result = formatRegEx.exec(token)) != null) {
			functArray.push({id: 'v', funct: "getValueStr", param: new Formatter(token)});
			functArray.push({id: 'u', funct: "getUnitStr", param: null});
		}
	}
	return functArray;
};
