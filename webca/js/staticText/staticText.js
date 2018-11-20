StaticText = function(name,id, manager,href,openMode, extPar) {
	//call super class constructor	
	StaticText.superclass.constructor.call(this,name,id, manager); 
	
	this.extPar = extPar;

	//html object
	this.htmlElement = document.getElementById(id);
	this.link = false;
	this.text = this.htmlElement;
	
	this.visibleClass = this.htmlElement.getAttribute("class");
	this.hiddenClass = this.htmlElement.getAttribute("class") + " hidden";
	
	if (this.extPar.visibilityPV) {
    	this.htmlElement.setAttribute("class", this.hiddenClass);
	}
	
	if(href != null){
		this.link = true;
		this.a = document.createElement("a");
		this.htmlElement.appendChild(this.a);
		this.a.setAttribute("href",href);
		this.a.setAttribute("target",openMode);
		this.text = this.a;
	}
	
	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);
	
	if (this.extPar.visibilityPV) {
	    this.visibilityHandle = this.manager.register(this.extPar.visibilityPV, this);
	}
};
YAHOO.lang.extend(StaticText, Monitor);

StaticText.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "StaticText.preInitialize() requires two arguments.");

	if (handle == this.readbackHandle) {
    	this.resolvedReadbackName = resolvedName;	
    	this.text.innerHTML = resolvedName;
	} else if (handle == this.visibilityHandle) {
    	this.visibilityResolvedName = resolvedName;
    	this.manager.connect(handle, resolvedName);	
	}
};	

StaticText.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "StaticText.initialize() requires one argument.");
	
	if (handle == this.readbackHandle) {
	    StaticText.superclass.initialize.call(this, handle);
	} else if (handle == this.visibilityHandle) {
		if (!this.visibilityMonitorHandle) {
		    this.visibilityMonitorHandle = this.manager.createMonitor(handle, this);
		}    		
	}
};

StaticText.prototype.reregister = function(handle){
	assert(arguments.length == 1, "StaticText.reregister() requires one argument.");		

	if (handle == this.readbackHandle) {
    	StaticText.superclass.reregister.call(this, handle);
	} else if (handle == this.visibilityHandle) {
    	if (this.extPar.visibilityPV) {
	        this.visibilityHandle = this.manager.register(this.extPar.visibilityPV, this);
	    }
	}
};

StaticText.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "StaticText.cleanup() requires one argument.");
    
	if (handle == this.readbackHandle) {
	    this.manager.unregister(this.readbackHandle);	
    	this.text.innerHTML = this.readbackName;
	
	} else if (handle == this.visibilityHandle) {
		this.manager.destroyMonitor(this.visibilityMonitorHandle);
		this.manager.disconnect(handle);
		this.manager.unregister(handle);
	} 
};

StaticText.prototype.notifyMonitor = function(handle, value, status, severity, timestamp) {
	assert(arguments.length == 5, "StaticText.notifyMonitor() requires five arguments.");
	if (handle == this.visibilityHandle) {
		if (typeof(value) == "number") {
    		var inInterval = this.extPar.visibilityMin <= value && value < this.extPar.visibilityMax;
    		if (this.extPar.visibilityInvert) {
    			inInterval = !inInterval;
    		}
    		this.htmlElement.setAttribute("class", inInterval ? this.visibleClass : this.hiddenClass);
		}
	}
};

StaticText.prototype.hasContextMenu = function() {
	return false;  
};
