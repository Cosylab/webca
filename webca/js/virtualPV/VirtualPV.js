VirtualPV = function(name, id, manager, initCode, evalCode, scanType, ctrl, alarmSensitive, display) {	
	//call super class constructor	
	VirtualPV.superclass.constructor.call(this, id, manager);

	this.rawName = name;
	this.initCode = initCode;
	this.evalCode = evalCode;
	this.scanPeriod = parseInt(scanType);
	if (isNaN(this.scanPeriod)) {
		this.scanPeriod = null;
	}
	
	this.ctrl = ctrl;
	this.alarmSensitive = alarmSensitive;
	this.writableProp = true;

	// Status is always NORMAL.
	this.status = 0;

	this.pvs = new Object();
	
	this.normalClass = "";
	if (alarmSensitive) {
		this.invalidClass = "invalid";
		this.minorClass = "minor";
		this.majorClass = "major";
	} else {
		this.invalidClass = "";
		this.minorClass = "";
		this.majorClass = "";
	}					
	
	this.htmlElement = document.getElementById(this.id);
	if (!display) {
    	this.htmlElement.setAttribute("class",
    	    this.htmlElement.getAttribute("class") + " hidden");
	}
	
	this.tr = this.htmlElement.rows[0];
	
    this.nameTd = document.createElement("td");
    this.nameTd.innerHTML = this.rawName;
    this.tr.appendChild(this.nameTd);

	var td = document.createElement("td");
    td.innerHTML = ":";
    this.tr.appendChild(td);

	// handle->name map
	this.names = new Hashtable();
	// handle->monitorHandle
	this.monitors = new Hashtable();

    // Default value and alarm. 
    this.processDefault(0, 0);	
	
	this.handle = this.manager.register(this.rawName, this);

	this.initConstSubst();
	
    // Process init code without registering pv references or adding graphical components.
    this.processingEval = false;
    this.initExpressionData(this.initCode); 
	this.processCode(this.initCode);

	// Set the type info based on evauated init code.
	this.initType(this.value);

    // Set up data structures for eval code.
    this.processingEval = true;
    this.initExpressionData(this.evalCode);
    
    if (this.scanPeriod != null) {
    	this.processPeriodically(this);
    }
};
YAHOO.lang.extend(VirtualPV, Component);

VirtualPV.prototype.preInitialize = function(handle, resolvedName){
	assert(arguments.length == 2, "VirtualPV.preInitialize() requires two arguments.");
	
	if (handle == this.handle) {		
    	this.name = resolvedName;
    	this.pvs[this.toJSIdentifier(resolvedName)] = this;
    	virtualPVManager.addPV(this);
        this.nameTd.innerHTML = this.name;
	} else {
	    var nameParts = this.textParts.get(handle).nameParts;
	    for (var i = 0; i < nameParts.length; i++) {
	    	nameParts[i].evalStr = this.toJSIdentifier(resolvedName);
	    	nameParts[i].td.innerHTML = resolvedName;
	    }
	    this.manager.connect(handle, resolvedName);
	} 
};

VirtualPV.prototype.notifyConnectionStatus = function(handle, connected){
	assert(arguments.length == 2, "VirtualPV.notifyConnectionStatus() requires two arguments.");

	if (handle != this.handle) {
    	// Remove cached value at disconnect. 
		if (!connected) {
            
    	    var resolvedName = this.textParts.get(handle).nameParts[0].evalStr;
            this.pvs[resolvedName] = null;
            this.setPartsSeverity(handle, 3);
		}
	}	
};

VirtualPV.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "VirtualPV.initialize() requires one argument.");

	if (handle != this.handle) {
    	this.manager.getCtrl(handle);	
		if (this.monitors.get(handle) == null) {
		    this.monitors.put(handle, this.manager.createMonitor(handle, this));
		}
	}		
};

VirtualPV.prototype.reregister = function(handle){
	assert(arguments.length == 1, "VirtualPV.reregister() requires one argument.");		

	if (handle == this.handle) {
    	this.handle = this.manager.register(this.rawName, this);
    	
	} else {
    	var name = this.names.remove(handle);
    	var textParts = this.textParts.remove(handle);
    	var handle = this.manager.register(name, this);
    	this.names.put(handle, name);
    	this.textParts.put(handle, textParts);
	}
};

VirtualPV.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "VirtualPV.cleanup() requires one argument.");

	if (handle == this.handle) {		
    	virtualPVManager.removePV(this);
      	this.manager.unregister(handle);
    	this.pvs[this.toJSIdentifier(this.name)] = null;
    	this.name = null;
        this.nameTd.innerHTML = this.rawName;
	} else {
	    var nameParts = this.textParts.get(handle).nameParts;

	    var resolvedName = nameParts[0].evalStr;
	    // Replace substitutions with macro literals.
	    for (var i = 0; i < nameParts.length; i++) {
	    	nameParts[i].evalStr = nameParts[i].source;
	       	nameParts[i].td.innerHTML = nameParts[i].source;
	    }
        this.pvs[resolvedName] = null;
        this.setPartsSeverity(handle, 3);
		this.manager.destroyMonitor(this.monitors.remove(handle));
	    this.manager.disconnect(handle);
	    this.manager.unregister(handle);
	}			
};

VirtualPV.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "VirtualPV.notifyGetCtrl() requires two arguments.");
	if (handle != this.handle) {
   	    var resolvedName = this.textParts.get(handle).nameParts[0].evalStr;
        this.pvs[resolvedName] = {val: ctrlData.getValue(), alarm: ctrlData.getSeverity(), ctrl: ctrlData, status: ctrlData.getStatus()};
	}
};

VirtualPV.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "VirtualPV.notifyMonitor() requires five arguments.");

    var resolvedName = this.textParts.get(handle).nameParts[0].evalStr;
    var ctrl = null;
    if (this.pvs[resolvedName] != null) {
    	ctrl = this.pvs[resolvedName].ctrl;
    }
    this.pvs[resolvedName] = {val: value, alarm: severity, ctrl: ctrl, status: status, timestamp: timestamp};
    
    this.setPartsSeverity(handle, severity);
    // Reevaluate only when in "passive" mode.
    if (this.scanPeriod == null) {
        this.processCode(this.evalCode);
    }	
};

VirtualPV.prototype.processPeriodically = function(virtualPV) {
    this.processCode(this.evalCode);
    setTimeout(function() {virtualPV.processPeriodically(virtualPV);}, this.scanPeriod);
};

VirtualPV.prototype.getName = function() {
	return this.name;
};

VirtualPV.prototype.getValue = function() {
	return this.value;
};

VirtualPV.prototype.setValue = function(value) /* throws Error */{
	if (this.writableProp) {
	    value = this.validateType(value);
	    this.processDefault(value, this.alarmSeverity);
        this.storeHistory();
	}
};

VirtualPV.prototype.getStatus = function() {
	return this.status;
};

VirtualPV.prototype.getSeverity = function() {
	return this.alarmSeverity;
};

VirtualPV.prototype.setSeverity = function(severity) {
	if (this.alarmSensitive) {
	    this.alarmSeverity = severity;
        this.nameTd.className = this.getSeverityClass(this.alarmSeverity);
	}
};

VirtualPV.prototype.getTimestamp = function() {
	return new Date().getTime();
};

VirtualPV.prototype.getCtrl = function() {
	return this.ctrl;
};

VirtualPV.prototype.getWritable = function() {
	return this.writableProp;
};

VirtualPV.prototype.initExpressionData = function(evalString) {
	this.expression = new Array();	
	this.pvsText = new Hashtable();	
	this.pvsColBlock = new Hashtable();	

	this.handles = new Hashtable();	
	this.textParts = new Hashtable();

	this.nonIdTextParts = new Array();
	this.externTextParts = new Array();
	
    this.statementExp = evalString.indexOf(';') != -1;
    this.alarmRef = false;
    this.evalError = null; 
	
	this.initRegExps();
	
	// Split expression to identifiers and parts in between.
	var part;
	var result;
	var pos = 0;
	var string;
	while ((result = this.identifierExp.exec(evalString)) != null) {
    	if (pos < result.index) {
    		string = evalString.substring(pos, result.index);
    		part = this.getExpressionPart(string, string, "");
    	    this.expression.push(part);
    	    this.nonIdTextParts.push(part);
    	}
	    this.parseIdentifier(result[0]);
		pos = result.index + result[0].length;
	}
	
   	if (pos < evalString.length) {
   		string = evalString.substring(pos);
   		part = this.getExpressionPart(string, string, "");
   	    this.expression.push(part);
   	    this.nonIdTextParts.push(part);
   	}
};

// Replaces special marks commonly used in epics. 
VirtualPV.prototype.toJSIdentifier = function(identifier) {
	return identifier
	    .replace(/[$]/g, "_DOLLAR_")
	    .replace(/[(]/g, "_LPAREN_")
	    .replace(/[)]/g, "_RPAREN_")
	    .replace(/[:]/g, "_COLON_")
	    .replace(/[-]/g, "_DASH_");
};

VirtualPV.prototype.initRegExps = function() {
	var startLetter = "[A-Za-z_]";
	var letter = "[A-Za-z0-9_:-]";

	var startIdPart = startLetter + letter + "*";
	var idPart = letter + "+";

	var macro = "[$][(]" + idPart + "[)]";
	var id = "(?:(?:" + startIdPart + "|" + macro + ")(?:" + macro + "|" + idPart + ")*)";

	// ctrl with all properties.
	var ctrl = "ctrl.(?:";
    for (i in this.ctrl) {
    	ctrl += i + "|";
    }
    ctrl = ctrl.substring(0, ctrl.length - 1) + ")";

	var field = "(?:alarm|" + ctrl + ")";
	
	// id.id. ... .id
	this.identifierExp = new RegExp(id + "(?:[.]" + id + ")*", "g");
	
    // field, this.field
	this.thisFieldExp = new RegExp("^(|this.)(" + field + ")$");

    // this, this.length, this.val, this.val.length
    this.thisValExp = new RegExp("^(this)(|.val)(|.length)$");
    
    // val, val.length, this.val, this.val.length
    this.valExp = new RegExp("^(|this.)(val)(|.length)$");
    
    // pvs.name.field, this.pvs.name.field, 
    this.pvsNameFieldExp = new RegExp("^(|this.)(pvs.)(" + id + ")(." + field + ")$"); 

    // pvs.name, pvs.name.val, pvs.name.length, pvs.name.val.length 
    // this.pvs.name, this.pvs.name.val, this.pvs.name.length, this.pvs.name.val.length 
    this.pvsNameValExp = new RegExp("^(|this.)(pvs.)(" + id + ")(|.val)(|.length)$"); 
};

VirtualPV.prototype.parseIdentifier = function(identifier) {

    var part1;
    var part2;
    var part3;
    var part4;
    
    // constant
    var result = this.constSubst.get(identifier);
    if (result != null) {
    	part1 =  this.getExpressionPart(identifier, result, "constant");
    	this.expression.push(part1);
        return;    	
    }
	
    // field, this.field
    result = this.thisFieldExp.exec(identifier); 
    if (result != null) {
    	// Add this. if not present.
    	if (result[1] != "") {
        	part1 = this.getExpressionPart(result[1], result[1], "special");
    	} else {
        	part1 = this.getExpressionPart("", "this.", "special");
    	}
    	part2 = this.getExpressionPart(result[2], result[2], "special");
    	
        // Check alarm reference.
        if (result[2] == "alarm") {
            this.alarmRef = true;
        }
    	
    	this.expression.push(part1, part2);
        return;    	
    }

    // this, this.length, this.val, this.val.length
    result = this.thisValExp.exec(identifier); 
    if (result != null) {
    	part1 = this.getExpressionPart(result[1], result[1], "special");
    	// Add .val if not present.
    	if (result[2] != "") {
        	part2 = this.getExpressionPart(result[2], result[2], "special");
    	} else {
        	part2 = this.getExpressionPart("", ".val", "special");
    	}
    	this.expression.push(part1, part2);

    	if (result[3] != "") {
        	this.expression.push(this.getExpressionPart(result[3], result[3], "special"));
    	}
        return;    	
    }

    // val, val.length, this.val, this.val.length
    result = this.valExp.exec(identifier); 
    if (result != null) {
    	// Add this. if not present.
    	if (result[1] != "") {
        	part1 = this.getExpressionPart(result[1], result[1], "special");
    	} else {
        	part1 = this.getExpressionPart("", "this.", "special");
    	}
    	part2 = this.getExpressionPart(result[2], result[2], "special");
    	
    	this.expression.push(part1, part2);
    	
    	if (result[3] != "") {
        	this.expression.push(this.getExpressionPart(result[3], result[3], "special"));
    	}
        return;    	
    }
    
    // pvs.name.field, this.pvs.name.field, 
    result = this.pvsNameFieldExp.exec(identifier); 
    if (result != null) {
    	// Add this. if not present.
    	if (result[1] != "") {
        	part1 = this.getExpressionPart(result[1], result[1], this.invalidClass);
    	} else {
        	part1 = this.getExpressionPart("", "this.", this.invalidClass);
    	}
    	
    	part2 = this.getExpressionPart(result[2], result[2], this.invalidClass);
    	part3 = this.getExpressionPart(result[3], result[3], this.invalidClass);
    	part4 = this.getExpressionPart(result[4], result[4], this.invalidClass);
    	
    	this.expression.push(part1, part2, part3, part4);
    	this.registerPv(part3, [part1, part2, part3, part4]);
        return;    	
    }

    // pvs.name, pvs.name.val, pvs.name.length, pvs.name.val.length 
    // this.pvs.name, this.pvs.name.val, this.pvs.name.length, this.pvs.name.val.length 
    result = this.pvsNameValExp.exec(identifier); 
    if (result != null) {
    	// Add this. if not present.
    	if (result[1] != "") {
        	part1 = this.getExpressionPart(result[1], result[1], this.invalidClass);
    	} else {
        	part1 = this.getExpressionPart("", "this.", this.invalidClass);
    	}
    	part2 = this.getExpressionPart(result[2], result[2], this.invalidClass);
    	part3 = this.getExpressionPart(result[3], result[3], this.invalidClass);
    	// Add .val if not present.
    	if (result[4] != "") {
        	part4 = this.getExpressionPart(result[4], result[4], this.invalidClass);
    	} else {
        	part4 = this.getExpressionPart("", ".val", this.invalidClass);
    	}
    	
    	this.expression.push(part1, part2, part3, part4);
    	this.registerPv(part3, [part1, part2, part3, part4]);
    	
    	if (result[5] != "") {
        	part1 = this.getExpressionPart(result[5], result[5], this.invalidClass);
        	this.expression.push(part1);
        	this.registerPv(part3, [part1]);
    	}
        return;    	
    }

    // extern symbol
    part1 = this.getExpressionPart(identifier, identifier, "userdefined");
   	this.expression.push(part1);
	this.externTextParts.push(part1);
   	
};

VirtualPV.prototype.getExpressionPart = function(source, evalStr, tdClass) {
    var td = document.createElement("td");
	td.innerHTML = source;
    td.className = tdClass;
	
	if (this.processingEval) {
	    this.tr.appendChild(td);
	}
    return {source: source, evalStr: evalStr, td: td};
};

VirtualPV.prototype.registerPv = function(namePart, colorParts) {
	
	if (this.processingEval) {
	    var handle = this.handles.get(namePart.source);
	    if (handle == null) {
			handle = this.manager.register(namePart.source, this);
	    	this.handles.put(namePart.source, handle);  
		    this.names.put(handle, namePart.source);
	    	this.textParts.put(handle, {nameParts: new Array(), colorParts: new Array()});	
	    }
	
	   	var textParts = this.textParts.get(handle);
	   	textParts.nameParts.push(namePart);
	   	
	    for (var i = 0; i < colorParts.length; i++) {
	   	    textParts.colorParts.push(colorParts[i]);
        }
	}
};

VirtualPV.prototype.initConstSubst = function() {
	var map = new Hashtable();

	map.put("NO_ALARM", "0");
	map.put("MINOR", "1");
	map.put("MAJOR", "2");
	map.put("INVALID", "3");
	map.put("E", "Math.E");
	map.put("LN10", "Math.LN10");
	map.put("LN2", "Math.LN2");
	map.put("LOG10E", "Math.LOG10E");
	map.put("LOG2E", "Math.LOG2E");
	map.put("PI", "Math.PI");
	map.put("SQRT1_2", "Math.SQRT1_2");
	map.put("SQRT2", "Math.SQRT2");
	map.put("abs", "Math.abs");
	map.put("acos", "Math.acos");
	map.put("asin", "Math.asin");
	map.put("atan", "Math.atan");
	map.put("atan2", "Math.atan2");
	map.put("ceil", "Math.ceil");
	map.put("cos", "Math.cos");
	map.put("exp", "Math.exp");
	map.put("floor", "Math.floor");
	map.put("log", "Math.log");
	map.put("max", "Math.max");
	map.put("max", "Math.min");
	map.put("pow", "Math.pow");
	map.put("random", "Math.random");
	map.put("round", "Math.round");
	map.put("sin", "Math.sin");
	map.put("sqrt", "Math.sqrt");
	map.put("tan", "Math.tan");
	this.constSubst = map;
};

VirtualPV.prototype.getSeverityClass = function(severity) {
	if (severity == 1) {
		return this.minorClass;
	} else if (severity == 2) {
		return this.majorClass;
	} else if (severity == 3) {
		return this.invalidClass;
	}
	return this.normalClass;
};

VirtualPV.prototype.setPartsSeverity = function(handle, severity) {
    var sevClass = this.getSeverityClass(severity);
    var colorParts = this.textParts.get(handle).colorParts;
    this.setClassType(colorParts, sevClass);
    this.processDefault(this.value, this.alarmSeverity);
};

VirtualPV.prototype.setClassType = function(textParts, classType) {
    for (var i = 0; i < textParts.length; i++) {
    	textParts[i].td.className = classType;
    }
};

VirtualPV.prototype.initType = function(value) {
	var valueType = typeof(value);
	this.isArray = (valueType == "function" || valueType == "object");
	if (this.isArray) {
		this.isNumeric = (typeof(value[0]) == "number");
	} else {
		this.isNumeric = (typeof(value) == "number");
	}
};

VirtualPV.prototype.validateType = function(value) {

	var isArray;
	var isNumeric;
	
	var valueType = typeof(value);
	isArray = (valueType == "function" || valueType == "object");
	if (isArray) {
		isNumeric = (typeof(value[0]) == "number");
	} else {
		isNumeric = (typeof(value) == "number");
	}
	
	if (this.isArray && !isArray) {
		value = [value];
	} else if (!this.isArray && isArray) {
		value = value[0];
	}
	
	if (this.isNumeric && !isNumeric) {
		if (this.isArray) {
		    for (var i = 0; i < value.length; i++) {
		    	value[i] = parseFloat(value[i]);
    			if (value[i] == NaN) {
	    			throw new Error("VirtualPV.validateType: type cannot be converted.");
			    } 
		    }
		} else {
			value = parseFloat(value);
			if (value == NaN) {
				throw new Error("VirtualPV.validateType: type cannot be converted.");
			} 
		}
	} else if (!this.isNumeric && isNumeric) {
		if (this.isArray) {
		    for (var i = 0; i < value.length; i++) {
		    	value[i] = value[i].toSring();
		    }
		} else {
			value = value.toSring();
		}
	}
	return value;
};

VirtualPV.prototype.processCode = function(string) {
	
    if (string == "") {
    	return;
    }
     
    // Check if all pvs are connected.
	var handles = this.textParts.keys();
    var resolvedName;
	for (var i = 0; i < handles.length; i++) {
	    resolvedName = this.textParts.get(handles[i]).nameParts[0].evalStr;
	    if (this.pvs[resolvedName] == null) {
	    	return;
	    }
	}
	
	// Merge the parts into a single string and evaluate it.
	var evalString = "";
	for (var i = 0; i < this.expression.length; i++) {
		evalString += this.expression[i].evalStr;
	}
    // Set dynamic values to use in eval.
    this.val = this.value;
    this.alarm = this.alarmSeverity;
    this.writable = this.writableProp;

	try {
	    if (this.statementExp) {
    	    eval(evalString);
	    } else {
    	    eval("this.val=" + evalString);
	    }
		this.setEvalError(false);
		// Update values based on default control and alarm settings. 
        this.processDefault(this.val, this.alarm);
        this.storeHistory();
        if (this.writable != this.writableProp) {
        	this.writableProp = this.writable; 
            virtualPVManager.onPVWritableChange(this);
        }
        virtualPVManager.onPVChange(this);
	} catch (e){
        // On error keep old value, but set invalid severity.
        this.setSeverity(3);
		this.setEvalError(true);
		//webcaLog("Syntax error in '" + this.rawName + "'='" + string + "':" + e.message);
	}
};

VirtualPV.prototype.setEvalError = function(evalError) {
    if (evalError != this.evalError) {
    	this.evalError = evalError;
    	if (this.evalError) {
    		this.tr.className = "error";
    		this.setClassType(this.nonIdTextParts, "major");
     		this.setClassType(this.externTextParts, "major");
    	} else {
    		this.tr.className = "";
    		this.setClassType(this.nonIdTextParts, "");
     		this.setClassType(this.externTextParts, "userdefined");
    	}
    }
};

VirtualPV.prototype.processDefault = function(val, alarm) {

    this.value = val;
    
	if (typeof(this.value) == "number") {
		if (this.ctrl.upperControlLimit) {
			this.value = Math.min(this.value, this.ctrl.upperControlLimit);
		}
		if (this.ctrl.lowerControlLimit) {
			this.value = Math.max(this.value, this.ctrl.lowerControlLimit);
		}
	}

    if (this.alarmRef) {
    	this.setSeverity(alarm);
    } else {
        // Use default alarm setting if alarm is not referenced in the code.
       	// If any of the alarm limits set, use them to define alarm state.
    	if (typeof(this.value) == "number" &&
    	        (this.ctrl.upperAlarmLimit || this.ctrl.upperWarningLimit || this.ctrl.lowerAlarmLimit || this.ctrl.lowerWarningLimit)) {
    		this.setSeverityByControlData();
    	} else {
        	// Otherwise, set worst alarm from inputs.
    	    this.setSeverityByExpression();
    	}
    }
};

VirtualPV.prototype.setSeverityByExpression = function() {
	var alarm = 0;
	var handles = this.names.keys();
    var resolvedName;
	var data;
	
	for (var i = 0; i < handles.length; i++) {
        resolvedName = this.textParts.get(handles[i]).nameParts[0].evalStr;
		data = this.pvs[resolvedName];
		if (data != null) {
			alarm = Math.max(alarm, data.alarm);
		} else {
			alarm = 3;
		}
	}
	this.setSeverity(alarm);
};

VirtualPV.prototype.setSeverityByControlData = function() {
	
	if (typeof(this.value) != "number") {
    	this.setSeverity(3);
    	return;
	}
	
	var alarm = 0;
	if (this.ctrl.upperAlarmLimit) {
		if (this.value > this.ctrl.upperAlarmLimit) {
			alarm = Math.max(alarm, 2);
		}
	}
	if (this.ctrl.upperWarningLimit) {
		if (this.value > this.ctrl.upperWarningLimit) {
			alarm = Math.max(alarm, 1);
		}
	}
	if (this.ctrl.lowerAlarmLimit) {
		if (this.value < this.ctrl.lowerAlarmLimit) {
			alarm = Math.max(alarm, 2);
		}
	}
	if (this.ctrl.lowerWarningLimit) {
		if (this.value < this.ctrl.lowerWarningLimit) {
			alarm = Math.max(alarm, 1);
		}
	}
	this.setSeverity(alarm);
};

VirtualPV.prototype.storeHistory = function() {
	this.storeHistoryEntry(this.value, this.getTimestamp(), this.status, this.alarmSeverity);
};

VirtualPV.prototype.getPVName = function() {
	return this.name;  
};

VirtualPV.prototype.showCtrlData = function() {  
    var win = window.open("", this.id, "width=400,height=500," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
    if (!win) return;
    var doc = win.document;
    doc.write("<html><head><title>PV Inspector</title></head><body></body>");

 	doc.title = "PV inspector";
 	
 	var nbsp = String.fromCharCode(160); 
 	
	var heading = doc.createElement("h3");
 	heading.appendChild(doc.createTextNode("Virtual PV:"));
 	doc.body.appendChild(heading); 		
 		
	var table = doc.createElement("table"); 	
	doc.body.appendChild(table);
	table.setAttribute("border","1");
	table.setAttribute("width","100%"); 		
 		
 	/*}*/
 	
    createRow(doc,table,"PV resolved name",this.name);
    createRow(doc,table,"PV unresolved name",this.rawName);
      
    if(this.ctrl == null){
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
    
        	
    
    createRow(doc,table,"Units",(this.ctrl.units == null)? "undefined" : this.ctrl.units);
    createRow(doc,table,"Precision",(this.ctrl.precision == null)? "undefined" :this.ctrl.precision);
    createRow(doc,table,"Upper display limit",(this.ctrl.upperDisplayLimit == null)? "undefined" : this.ctrl.upperDisplayLimit);
    createRow(doc,table,"Lower display limit",(this.ctrl.lowerDisplayLimit == null)? "undefined" : this.ctrl.lowerDisplayLimit);
    createRow(doc,table,"Upper alarm limit",(this.ctrl.upperAlarmLimit == null)? "undefined" : this.ctrl.upperAlarmLimit);
	createRow(doc,table,"Upper warning limit",(this.ctrl.upperWarningLimit == null)? "undefined" : this.ctrl.upperWarningLimit);
    createRow(doc,table,"Lower alarm limit",(this.ctrl.lowerAlarmLimit == null)? "undefined" : this.ctrl.lowerAlarmLimit);
    createRow(doc,table,"Lower warning limit",(this.ctrl.lowerWarningLimit == null)? "undefined" : this.ctrl.lowerWarningLimit);
    createRow(doc,table,"Upper control limit",(this.ctrl.upperControlLimit == null)? "undefined" : this.ctrl.upperControlLimit);
    createRow(doc,table,"Lower control limit",(this.ctrl.lowerControlLimit == null)? "undefined" : this.ctrl.lowerControlLimit);

    if(this.ctrl.labels != null){
    	var labels = this.ctrl.labels;
    	
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
