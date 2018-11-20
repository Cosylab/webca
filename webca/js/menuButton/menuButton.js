
MenuButton = function(controlName,readbackName,id, manager,alarmSensitive,menu,xslClass, xslStyle, readOnly){
	
	this.xmlMenu = false;
	
	this.menu = menu;
	//fix menu	(hack for render bug in yui)
	if(this.menu != null){
		var nbsp = String.fromCharCode(160);
		for(var i = 0; i < this.menu.length; i++){
			this.menu[i].text = this.menu[i].text + nbsp + nbsp + nbsp + nbsp;
		}	
	}
	
	//create Yahoo menuButton			
	var tempMenu = [];
	this.yahooMenuButton = new YAHOO.widget.Button(id,{type: "menu", menu: tempMenu});		
	
		
	this.yahooMenuButtonMenu = this.yahooMenuButton.getMenu();	
	
	//yui deletes our class definition so we must restore it 
	//- must be done before supperclass constructor is called
	var me = document.getElementById(id);
	tempClass = me.getAttribute("class");	
	me.setAttribute("class", xslClass + " " + me.getAttribute("class"));	
	me.setAttribute("style", xslStyle);	
		
	//if readback name not give use control name
	if(readbackName == null){
		readbackName = controlName;
	}		
		
	//call super class constructor	
	MenuButton.superclass.constructor.call(this, controlName,readbackName,id, manager,alarmSensitive, readOnly); 	
	
	//subscribe event handlers
	this.yahooMenuButtonMenu.clickEvent.subscribe(this.onMenuItemSelect,this,true);	
	
	// repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.repaint, this, true); 		

	this.controlHandle = this.manager.register(this.controlName,this);
	this.readbackHandle = this.manager.register(this.readbackName,this);
};
YAHOO.lang.extend(MenuButton, Control);

//routines definition
MenuButton.prototype.reregister = function(handle){
	assert(arguments.length == 1, "MenuButton.reregister() requires one argument.");
	if(this.readbackHandle == handle){
		MenuButton.superclass.reregister.call(this, this.readbackHandle); 
	}
	else{
		this.controlHandle = this.manager.register(this.controlName,this);
	}
};
	
MenuButton.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "MenuButton.preInitialize() requires two arguments.");
	if(this.readbackHandle == handle){
		MenuButton.superclass.preInitialize.call(this,this.readbackHandle,resolvedName); 
	}
	else{
		this.resolvedControlName = resolvedName;
		this.manager.connect(this.controlHandle,resolvedName);	
		document.getElementById(this.id).setAttribute("class",this.invalidClass);		
		this.yahooMenuButton.set("disabled", true);		
		this.yahooMenuButtonMenu.clearContent();		
		this.yahooMenuButton.set("label","(undefined)"); 	
		this.yahooMenuButtonMenu.render(this.id);
	}
};

MenuButton.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "MenuButton.initialize() requires one argument.");
	if(this.readbackHandle == handle) //do ctrlGet only on readback PV - if not given controlPV == readbackPV
		MenuButton.superclass.initialize.call(this, this.readbackHandle); 		
};

MenuButton.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "MenuButton.notifyConnectionStatus() requires two arguments.");
	MenuButton.superclass.notifyConnectionStatus.call(this,handle,connected); 
 	
 	if (handle == this.controlHandle && connected) {
		this.createWritableMonitor(handle);
 	}
 	
 	if (connected && this.writable) {
 		this.yahooMenuButton.set("disabled", false);			
    } else { 
        this.yahooMenuButton.set("disabled", true);			 
    }	
};
		
MenuButton.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "MenuButton.cleanup() requires one argument.");
	if(this.readbackHandle == handle)
		MenuButton.superclass.cleanup.call(this,this.readbackHandle); 
	else{		
    	this.destroyWritableMonitor(handle);
		this.manager.disconnect(this.controlHandle);
		this.manager.unregister(this.controlHandle);	
	}

};	

MenuButton.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "MenuButton.notifyGetCtrl() requires two arguments.");
	MenuButton.superclass.notifyGetCtrl.call(this,handle,ctrlData); 
	
	this.createMenu();
	if(!this.monitorHandle)
		this.monitorHandle = this.manager.createMonitor(handle,this); 
};

MenuButton.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "MenuButton.notifyMonitor() requires five arguments.");
	MenuButton.superclass.notifyMonitor.call(this,handle,value,status,severity,timestamp);
	
	if(this.xmlMenu){ 
		for(var i = 0; i < this.menu.length; i++){
			if(this.ctrlData.isNumeric){
				if(new Number(this.menu[i].value) == value){
					this.yahooMenuButton.set("label",this.menu[i].text);
					return;
				}
			}
			else{
				if(this.menu[i].value == value){
					this.yahooMenuButton.set("label",this.menu[i].text);
					return;
				}
			}
		}
		if(this.yahooMenuButton.get("label") != "(undefined)")
			this.yahooMenuButton.set("label","(undefined)"); //we did't find match
		return;
	}
	
	this.yahooMenuButton.set("label",value); //must be enum so just set the value
};

MenuButton.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "MenuButton.notifyWritableStatus() requires two arguments.");

	MenuButton.superclass.notifyWritableStatus.call(this, handle, writable);

  	if (this.connected && this.writable) {
 		this.yahooMenuButton.set("disabled", false);			
    } else { 
        this.yahooMenuButton.set("disabled", true);			 
    }	
};

MenuButton.prototype.onMenuItemSelect = function(p_sType, p_aArguments) {
	var oEvent = p_aArguments[0]; 
	if(!isRightButton(oEvent)){		
		this.manager.put(this.controlHandle,this.yahooMenuButtonMenu.activeItem.value)		
	}		
};

MenuButton.prototype.createMenu = function(){

	if(this.ctrlData){
		var labels = this.ctrlData.getLabels();
			
		if(labels != null){
			var menu = new Array;
			//This non breakable space is a hack for render bug in yui
			var nbsp = String.fromCharCode(160);
	
			for (var i =0; i < labels.length; i++){
				menu[i] = { text: labels[i] + nbsp + nbsp + nbsp + nbsp,value: labels[i]};
			}
			this.yahooMenuButtonMenu.clearContent();
			this.yahooMenuButtonMenu.addItems(menu);	
			this.yahooMenuButtonMenu.render(this.id);		
			this.xmlMenu = false;	
			
			return;
		}		
	}
	
	if(this.menu != null){		
		
		this.yahooMenuButtonMenu.clearContent();
		this.yahooMenuButtonMenu.addItems(this.menu);	
		this.yahooMenuButtonMenu.render(this.id);						
		
		this.xmlMenu = true;
		
		return;
	}
	
	//no menus - disable the button
	this.yahooMenuButton.set("disabled", true);	
	document.getElementById(this.id).setAttribute("class",this.invalidClass);	
	
	
};

MenuButton.prototype.repaint = function(){	
	this.createMenu();
};

/*
 * Overrided method from monitor object. Slide does ctrl get on controlPV
 * 
 * @return {String} resolved control PV name
 * 
 */
MenuButton.prototype.getResolvedCTRLName = function(){
	return this.resolvedControlName;
};
