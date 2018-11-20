
MessageButton = function(name,id, manager,alarmSensitive,captionList,valueList,xslClass, xslStyle, readOnly){

	this.captionList = captionList;
	this.valueList = valueList;
	this.state = 0;
	
	//create Yahoo push button			
	this.yahooMessageButton = new YAHOO.widget.Button(id);	
	
	//yui deletes our class definition so we must restore it 
	//- must be done before supperclass constructor is called
	var me = document.getElementById(id);
	tempClass = me.getAttribute("class");	
	me.setAttribute("class", xslClass + " " + me.getAttribute("class"));	
	me.setAttribute("style", xslStyle);	
	
	//call super class constructor	
	MessageButton.superclass.constructor.call(this, name, name,id, manager,alarmSensitive, readOnly); 
	
	//add handler
	this.yahooMessageButton.on("click", this.onButtonClick,this,this); 	

	this.readbackHandle = this.manager.register(this.readbackName,this);
};
YAHOO.lang.extend(MessageButton, Control);


//routines definition
MessageButton.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "MessageButton.preInitialize() requires two arguments.");
	MessageButton.superclass.preInitialize.call(this, handle,resolvedName); 
	//both readback and control PV name are the same
	this.resolvedControlName = resolvedName;	
	this.yahooMessageButton.set("disabled", true);	
};

MessageButton.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "MessageButton.notifyConnectionStatus() requires two arguments.");
	MessageButton.superclass.notifyConnectionStatus.call(this, handle,connected); 

 	if (connected) {
		this.createWritableMonitor(handle);
 	}

 	if (connected && this.writable) {
 		this.yahooMessageButton.set("disabled", false);			
    } else { 
        this.yahooMessageButton.set("disabled", true);			 
    }	
};

MessageButton.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "MessageButton.cleanup() requires one argument.");
   	this.destroyWritableMonitor(handle);
	MessageButton.superclass.cleanup.call(this, handle); 
};	

MessageButton.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "MessageButton.notifyGetCtrl() requires two arguments.");
	MessageButton.superclass.notifyGetCtrl.call(this, handle,ctrlData); 
	if(!this.monitorHandle)
		this.monitorHandle = this.manager.createMonitor(handle,this); 
};

MessageButton.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "MessageButton.notifyWritableStatus() requires two arguments.");
	MessageButton.superclass.notifyWritableStatus.call(this, handle, writable);

 	if (this.connected && this.writable) {
 		this.yahooMessageButton.set("disabled", false);			
    } else { 
        this.yahooMessageButton.set("disabled", true);			 
    }	
};

MessageButton.prototype.onButtonClick = function(oEvent){ 
	if(!isRightButton(oEvent)){

		this.state == 0 ? this.state = 1: this.state = 0;

		this.yahooMessageButton.set("label",this.captionList[this.state]);
		
		if(this.valueList[this.state])		
			this.manager.put(this.readbackHandle,this.valueList[this.state])
	}
};

