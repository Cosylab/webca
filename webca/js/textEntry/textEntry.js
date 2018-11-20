
TextEntry = function(name,id, manager,dataType,alarmSensitive,displayFormat, readOnly){	
	//call super class constructor	
	TextEntry.superclass.constructor.call(this,name,name,id, manager,alarmSensitive, readOnly); 
	
	this.dataType = dataType;	
	this.isNumeric = (this.dataType == "numeric");
	
	if (this.isNumeric) {	
		if (displayFormat == null || displayFormat == "")
			this.precisionFromPV = true;
		else
		{
			this.precisionFromPV = false;
			this.formatter = new Formatter(displayFormat);					
		}
	}

	//used on html element if data not numeric
	this.value;
	this.enterPressed = false;
	
	//html object
	this.htmlElement = document.getElementById(id);

	//used due to safari (does not handle left/right button click)
	this.rightButtonClick = false;
	
	//hook event handlers	
	// keyup needs to be used instead of keypress, since Mozilla handles ESCape key by itself
	YAHOO.util.Event.addListener(this.htmlElement, "keyup", this.onKeyPress, this, true); 
	YAHOO.util.Event.addListener(this.htmlElement, "mousedown", this.onMouseDown, this, true); 
	YAHOO.util.Event.addListener(this.htmlElement, "blur", this.onBlur, this, true); 
	YAHOO.util.Event.addListener(this.htmlElement, "focus", this.onFocus, this, true); 	

	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);
};
YAHOO.lang.extend(TextEntry, Control);


//routines definition
TextEntry.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "TextEntry.preInitialize() requires two arguments.");
	TextEntry.superclass.preInitialize.call(this, handle,resolvedName);
	//both readback and control PV name are the same
	this.resolvedControlName = resolvedName;	
	this.htmlElement.value = this.resolvedReadbackName;
	this.htmlElement.readOnly = true;  
	this.value = this.htmlElement.value; 
};	

TextEntry.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "TextEntry.notifyConnectionStatus() requires two arguments.");	
	TextEntry.superclass.notifyConnectionStatus.call(this, handle,connected);
	
	if (connected) {
		this.createWritableMonitor(handle);
	}
	
    if (connected && this.writable) {
		this.htmlElement.readOnly = false;
    } else { 
		this.htmlElement.readOnly = true;  
		this.htmlElement.value = this.resolvedReadbackName;			 
    }	
	this.value = this.htmlElement.value; 
};
		
TextEntry.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "TextEntry.cleanup() requires one argument.");
	this.destroyWritableMonitor(handle);
	TextEntry.superclass.cleanup.call(this,handle);
	this.htmlElement.value = this.resolvedReadbackName;	
	this.value = this.htmlElement.value; 
};

TextEntry.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "TextEntry.notifyGetCtrl() requires two arguments.");	
	TextEntry.superclass.notifyGetCtrl.call(this, handle,ctrlData);
	if(!this.monitorHandle)
		this.monitorHandle = this.manager.createMonitor(handle,this); 
};

TextEntry.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "TextEntry.notifyMonitor() requires five arguments.");	
	TextEntry.superclass.notifyMonitor.call(this, handle, value,status,severity,timestamp);

	var displayAsNumeric = (this.isNumeric && this.ctrlData.isNumeric);
	if (displayAsNumeric)
		this.htmlElement.value = this.getFormattedValue(value, this.precisionFromPV, this.formatter) + " " + this.ctrlData.getUnits();
 	else
 		this.htmlElement.value = this.getFormattedValue(value, this.precisionFromPV, this.formatter);

	this.value = this.htmlElement.value;
};

TextEntry.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "TextEntry.notifyWritableStatus() requires two arguments.");

	TextEntry.superclass.notifyWritableStatus.call(this, handle, writable);
    if (this.connected && this.writable) {
		this.htmlElement.readOnly = false;
    } else { 
		this.htmlElement.readOnly = true;  
    }	
	this.value = this.htmlElement.value; 
};

//Event handlers
TextEntry.prototype.onKeyPress = function(event){	
	keycode = event.keyCode;
	if (keycode == 13){
		var val = this.htmlElement.value;
//		if(this.isNumeric){
		if(this.ctrlData.isNumeric){
			if(val != ''){
				if (val.indexOf(" ") != -1)
				{
					var valArray = val.split(" ");
					this.manager.put(this.readbackHandle,valArray);
					this.enterPressed = true;	
				}
				else
				{
					if (!isNaN(val)){ 			
						this.manager.put(this.readbackHandle,val)
						this.enterPressed = true;	
					}
				}
			}
		}
		else 
		{
			if(val != ''){
				this.manager.put(this.readbackHandle,val);
				this.enterPressed = true;
			}
		}
	}
	else if (keycode == 27){
		this.htmlElement.value = this.value;
	}
};

TextEntry.prototype.onMouseDown = function(event){	
	if(isRightButton(event)){//all this complication is due safari firing focus event 
							 //also on right button click
		this.rightButtonClick = true;
		event.preventDefault();
		return;
	}
	else
		this.rightButtonClick = false;
};

TextEntry.prototype.onBlur = function(event){	
	if(this.connected && this.writable)
		this.htmlElement.readOnly = false;  	
	this.htmlElement.value = this.value;
};

TextEntry.prototype.onFocus = function(event){	
	if(this.rightButtonClick){ //all this complication is due safari firing focus event 
							   //also on right button click
		this.rightButtonClick = false;
		if(this.connected && this.writable)
			this.htmlElement.readOnly = true;  
		return;
	}
	
	// start editing...
	if(this.connected && this.writable){
		this.htmlElement.value = "";	 
	}
};