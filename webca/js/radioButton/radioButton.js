
RadioButton = function(controlName,readbackName,id, manager,alarmSensitive,buttons,type, direction, readOnly){
	
	this.buttons = buttons;
	this.type = type;
	this.direction = direction;
	
	this.htmlElement = document.getElementById(id);
	
	if(this.type == "toggle"){
		//create Yahoo ButtonGroup	
		this.yahooButtonGroup = new YAHOO.widget.ButtonGroup(id); 	
	
		var buttons = new Array;
		buttons[0] = { label: "(undefined)",value: "(undefined)"};
		this.yahooButtonGroup.addButtons(buttons);		
	}
	else{//create html radio button
		this.radioButtons = new Array;
		this.form = document.createElement("form");
		this.htmlElement.appendChild(this.form);
		this.form.setAttribute("name", id + "Form");
		this.formDiv = document.createElement("div");
		this.form.appendChild(this.formDiv);			
		var button = document.createElement("input");
		this.formDiv.appendChild(button);
		button.setAttribute("type","radio");
		button.setAttribute("name","radios");
		button.setAttribute("value","undefined");				
		this.formDiv.appendChild(document.createTextNode("(undefined) "));
		this.radioButtons.push(button);  
	}
	
	if(readbackName == null){
		readbackName = controlName;
	}		
	
	//call super class constructor	
	RadioButton.superclass.constructor.call(this, controlName,readbackName,id, manager,alarmSensitive, readOnly); 
	
	//TODO this should be changed
	this.rightMouseButton = false;
	
	//add handlers
	if(this.type == "toggle"){
		this.yahooButtonGroup.on("click",this.onCheckedButtonChange,this,true);
		this.yahooButtonGroup.on("mousedown",this.onMouseDown,this,true);
		this.yahooButtonGroup.on("beforeCheckedButtonChange",this.onBeforeCheckedButtonChange,this,true);
	}else{
		YAHOO.util.Event.addListener(this.formDiv, "click", this.onCheckedButtonChange, this, true); 
	}

	this.controlHandle = this.manager.register(this.controlName,this);
	this.readbackHandle = this.manager.register(this.readbackName,this);	
};
YAHOO.lang.extend(RadioButton, Control); 

//routines definition
RadioButton.prototype.reregister = function(handle){
	assert(arguments.length == 1, "RadioButton.reregister() requires one argument.");
	if(this.readbackHandle == handle)
		RadioButton.superclass.reregister.call(this, this.readbackHandle); 
	else
		this.controlHandle = this.manager.register(this.controlName,this);
};
	
RadioButton.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "RadioButton.preInitialize() requires two arguments.");	
	if(this.readbackHandle == handle){
		RadioButton.superclass.preInitialize.call(this, this.readbackHandle, resolvedName); 	
	}
	else{
		this.resolvedControlName = resolvedName;
		this.manager.connect(this.controlHandle,resolvedName);	
		document.getElementById(this.id).setAttribute("class",this.invalidClass);	
        this.setEnabled(false);		
	}
};

RadioButton.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "RadioButton.initialize() requires one argument.");
	if(this.readbackHandle == handle) //do ctrlGet only on readback PV - if not given controlPV == readbackPV
		RadioButton.superclass.initialize.call(this, this.readbackHandle); 	
};

RadioButton.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "RadioButton.notifyConnectionStatus() requires two arguments.");
	RadioButton.superclass.notifyConnectionStatus.call(this, handle, connected); 

    if (handle == this.controlHandle && connected) {
	    this.createWritableMonitor(handle);
    }
    this.setEnabled(connected && this.writable);		
};
		
RadioButton.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "RadioButton.cleanup() requires one argument.");
	if(this.readbackHandle == handle)
		RadioButton.superclass.cleanup.call(this, this.readbackHandle); 	
	else{
      	this.destroyWritableMonitor(handle);
		this.manager.disconnect(this.controlHandle);
		this.manager.unregister(this.controlHandle);	
	}
};	

RadioButton.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "RadioButton.notifyGetCtrl() requires two arguments.");
	RadioButton.superclass.notifyGetCtrl.call(this,handle,ctrlData);
	
	this.createButtons();
	if(!this.monitorHandle)	
		this.monitorHandle = this.manager.createMonitor(handle,this); 
};

RadioButton.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "RadioButton.notifyMonitor() requires five arguments.");
	RadioButton.superclass.notifyMonitor.call(this,handle,value,status,severity,timestamp);
	
	this.checkButton(value);

};

RadioButton.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "RadioButton.notifyWritableStatus() requires two arguments.");
	RadioButton.superclass.notifyWritableStatus.call(this, handle, writable);
 	this.setEnabled(this.connected && this.writable);		
};

RadioButton.prototype.createButtons = function(){
	
	if(this.ctrlData){
		var labels = this.ctrlData.getLabels();
			
		if(labels != null){
			var buttons = new Array;
			for (var i =0; i < labels.length; i++){
				buttons[i] = { label: labels[i],value: labels[i]};
			}			
			
			if(this.type == "toggle"){
				//remove old buttons
				var oldButtons = this.yahooButtonGroup.getButtons();
				for(var j = oldButtons.length - 1; j >= 0; j--){
					this.yahooButtonGroup.removeButton(j);
				}
				while (this.htmlElement.childNodes.length > 0) {
					this.htmlElement.removeChild(this.htmlElement.childNodes[0]);
				}
				
				//add new buttons
				for (var i = 0; i < buttons.length; i++) {
				    this.yahooButtonGroup.addButton(buttons[i]);
		            if (this.direction == "vertical") {
				        this.htmlElement.appendChild(document.createElement("br"));
		            }
				}		
			}
			else{
				//remove old buttons
				if(this.formDiv.hasChildNodes()){
					var x = this.formDiv.childNodes;
				}
			
				for (var i = x.length - 1 ;i >= 0;i--)
		  		{
				  this.formDiv.removeChild(x[i]);
				}	
				this.radioButtons = new Array;
				
				//add new buttons			
				for (var i = 0; i < buttons.length ; i++){
					this.radioButtons[i] = this.createRadioButton(i, buttons , this.formDiv);
				}							
				
			}
			
			this.checkButton(this.ctrlData.getValue());
			
			return;
		}		
	}
	
	if(this.buttons != null){		
		
		if(this.type == "toggle"){
			//remove old buttons
			var oldButtons = this.yahooButtonGroup.getButtons()
			for(var j = oldButtons.length - 1; j >= 0; j--){
				this.yahooButtonGroup.removeButton(j);
			}
			while (this.htmlElement.childNodes.length > 0) {
				this.htmlElement.removeChild(this.htmlElement.childNodes[0]);
			}
				
			//add new buttons
			for (var i = 0; i < this.buttons.length; i++) {
			    this.yahooButtonGroup.addButton(this.buttons[i]);
	            if (this.direction == "vertical") {
			        this.htmlElement.appendChild(document.createElement("br"));
	            }
			}		
		}
		else{
			//remove old buttons
			if(this.formDiv.hasChildNodes()){
				var x = this.formDiv.childNodes;
			}
			
			for (var i = x.length - 1 ;i >= 0;i--)
	  		{
			  this.formDiv.removeChild(x[i]);
			}
			this.radioButtons = new Array;
			
			//add new buttons			
			for (var i = 0; i <  this.buttons.length ; i++){
				this.radioButtons[i] = this.createRadioButton(i,this.buttons,this.formDiv);
			}
		}
		
		this.checkButton(this.ctrlData.getValue());				
	}	
 	this.setEnabled(this.connected && this.writable);		
};

RadioButton.prototype.createRadioButton = function(i, buttons, formDiv){	
		var button = document.createElement("input");
		formDiv.appendChild(button);
		button.setAttribute("type","radio");
		button.setAttribute("name","radios");
		button.setAttribute("value",buttons[i].value);				
		this.formDiv.appendChild(document.createTextNode(buttons[i].label + " "));
		if (this.direction == "vertical") {
			this.formDiv.appendChild(document.createElement("br"));
		} 
		return button;	
};

RadioButton.prototype.checkButton = function(value){
	if(this.type == "toggle"){
		var buttons = this.yahooButtonGroup.getButtons();
		 
		for(var i = 0; i < buttons.length; i++){
			if(this.ctrlData.isNumeric){
				if(new Number(buttons[i].get("value")) == value){
					this.yahooButtonGroup.check(i);
					return;
				}
			}
			else{
				if(buttons[i].get("value") == value){
					this.yahooButtonGroup.check(i);
					return;
				}
			}
		}
	}
	else{		
		for(var i = 0; i < this.radioButtons.length; i++){
			if(this.ctrlData.isNumeric){
				if(new Number(this.radioButtons[i].value) == value){
					this.radioButtons[i].checked = true;
					return;
				}
			}
			else{
				if(this.radioButtons[i].value == value){
					this.radioButtons[i].checked = true;					
					return;
				}
			}
		}		
	}	
};

/*
 * 
 * Event handler for mouseDown event. Used to determine if right or left mouse
 * button was pressed.
 * 
 * @param Object event DOM event object
 * 
 */
RadioButton.prototype.onMouseDown = function(event){
	if(isRightButton(event)) //if right mouse button clicked prevent firing onCheckedButtonChange event
		this.rightMouseButton = true;
	else
		this.rightMouseButton = false;
		
};

/*
 * 
 * Event handler for beforeCheckedButtonChange event. If right button was pressed
 * the CheckedButtonChange event must not be fired so false must be returned.
 * 
 * @param Object event Object containing old and new selected button
 * 
 */
RadioButton.prototype.onBeforeCheckedButtonChange = function(event){
	if(this.rightMouseButton){ //right mouse button clicked so prevent chaging the value
		event.newValue.set("checked",false);
		event.prevValue.set("checked",true);
		this.rightMouseButton = false;
		//return false to prevent onCheckedButtonChange event to fire
		return false;
	}
	else{	
		return true;		
	}

};

/*
 * 
 * Event handler for checkedButtonChange event. 
 * 
 * 
 * @param Object event Object containing old and new selected button
 * 
 */
RadioButton.prototype.onCheckedButtonChange = function(event){
	if (this.writable) {
		if(this.type == "toggle"){		
			var button = this.yahooButtonGroup.get("checkedButton");
			this.manager.put(this.controlHandle,button.get("value"))	
			
		}
		else{
			for(var i = 0; i < this.radioButtons.length; i++){
					if(this.radioButtons[i].checked){
						this.manager.put(this.controlHandle,this.radioButtons[i].value);
						break;
					}				
			}  
			
		}
	}
};

RadioButton.prototype.setEnabled = function(enabled) {

	if(this.type == "toggle") {
		this.yahooButtonGroup.set("disabled", !enabled);
	} else {
		for(var i = 0; i < this.radioButtons.length; i++){
			this.radioButtons[i].disabled = !enabled;			
		}			
	}
};
