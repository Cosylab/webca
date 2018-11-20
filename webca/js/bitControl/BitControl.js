BitControl = function(name, id, manager, alarmSensitive, startBit, endBit, readOnly, href, target) {
	this.base = Control;
	this.base(name, name, id, manager, alarmSensitive, readOnly);
	
	this.href = href;
	this.target = target;
	
	this.value = 0;
	this.startBit = startBit;
	this.endBit = endBit;
	
	this.bitButtons = new Array();
	this.bitControl = document.getElementById(this.id);
	this.table = this.bitControl.rows[0];

	this.setupLayout();
	
	this.readbackHandle = this.manager.register(this.readbackName, this);
};
YAHOO.lang.extend(BitControl, Control);

BitControl.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "BitControl.preInitialize() requires two arguments.");	
	BitControl.superclass.preInitialize.call(this, handle,resolvedName); 
	//both readback and control PV name are the same
	this.resolvedControlName = resolvedName;
    this.setEnabled(false);
};
	
BitControl.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "BitControl.notifyConnectionStatus() requires two arguments.");	
	BitControl.superclass.notifyConnectionStatus.call(this, handle,connected); 	
    
	if (connected) {
		this.createWritableMonitor(handle);
	}
    this.setEnabled(connected);
};
		
BitControl.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "BitControl.cleanup() requires one argument.");
	this.destroyWritableMonitor(handle);
	BitControl.superclass.cleanup.call(this,handle);
    this.setEnabled(false);
};	

BitControl.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "BitControl.notifyGetCtrl() requires two arguments.");
	BitControl.superclass.notifyGetCtrl.call(this, handle, ctrlData); 

	if (!this.ctrlData.isArray && this.ctrlData.isNumeric) {
		if(!this.monitorHandle) {
			this.monitorHandle = this.manager.createMonitor(handle, this);
		} 
	} else {
        this.setEnabled(false);
	}	 
};

BitControl.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "BitControl.notifyGetCtrl() requires five arguments.");
	BitControl.superclass.notifyMonitor.call(this, handle,value,status,severity,timestamp); 
    
	this.value = value;
	this.setBitButtonsState(this.getSeverityClass(severity));
};

BitControl.prototype.setEnabled = function(enabled) {
	this.enabled = enabled;
	if (enabled) {
   	    this.setBitButtonsState(this.cssClass);
	} else {
     	this.value = 0;
   	    this.setBitButtonsState(this.invalidClass);
	}
};

BitControl.prototype.setupLayout = function() {

	var button = null;
	for (var i = 0; i < this.getNumberOfButtons(); i++) {
		button = new BitButton(this.id + "BitButton" + i, this.posToBit(i), this);
		this.bitButtons.push(button);
	    this.table.appendChild(button.column);
	}	
};

BitControl.prototype.onBitButtonStateChange = function(bitPosition) {
	
	if (this.enabled && this.writable) {
    	var newValue = this.setValueBit(this.value, !this.bitButtons[this.bitToPos(bitPosition)].isSelected(), bitPosition);
      	this.manager.put(this.readbackHandle, newValue);
	}
};

BitControl.prototype.setBitButtonsState = function(severityClass) {

	for (var i = 0; i < this.bitButtons.length; i++) {
		this.bitButtons[i].setState(this.getValueBit(this.value, this.posToBit(i)), this.enabled, severityClass);
	}	
};

BitControl.prototype.getValueBit = function(value, position) {
	return (value >> position) % 2; 
};

BitControl.prototype.setValueBit = function(value, bit, position) {

	var mask = 1 << position;
    value = (bit == 0) ? value & ~mask : value | mask;
    return value;
};

BitControl.prototype.getNumberOfButtons = function() {
	if (this.startBit <= this.endBit) {
		return this.endBit - this.startBit + 1;
	} else {
		return this.startBit - this.endBit + 1;
	}
};

BitControl.prototype.posToBit = function(pos) {
	if (this.startBit <= this.endBit) {
		return pos + this.startBit;
	} else {
		return this.startBit - pos;
	}
};

BitControl.prototype.bitToPos = function(bit) {
	if (this.startBit <= this.endBit) {
		return bit - this.startBit;
	} else {
		return this.startBit - bit;
	}
};

BitControl.prototype.getLink = function() {
	return this.href != null ? {href: this.href, target: this.target} : null;  
};
