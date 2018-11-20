//*****************************************
//Manager object
//*****************************************
Manager = function(epicsPlugin,virtualPlugin,pendEvents,pendEventsPeriodMs){

	if(pendEvents < 0)
		this.pendEvents = 0;
	else
		this.pendEvents = pendEvents;
	if(pendEventsPeriodMs < 1)
		this.pendEventsPeriodMs = 1;
	else
		this.pendEventsPeriodMs = pendEventsPeriodMs;
		
	this.virtualPlugin = virtualPlugin;
	// TASK:IE provide auto plugin disable when ie used
	this.epicsPlugin = epicsPlugin;
	//this.epicsPlugin = null;
	this.components = new Hashtable()
	this.resolvedPVNames = new Hashtable();
	this.connected = new Hashtable();
	this.monitors = new Hashtable();
	this.pluginConnectionHandles = new Hashtable();
	this.pluginMonitorHandles = new Hashtable();	
	this.writableMonitors = new Hashtable();
	this.pluginWritableMonitorHandles = new Hashtable();
	this.virtualPluginConnectionHandles = new Hashtable();
	this.plugins = new Hashtable();
	
	this.counter = 0;
	this.monitorCounter = 0;
	this.writableMonitorCounter = 0;
};


// handle events
Manager.prototype.handleEvents = function(manager) {

	/* Virtual PVs have priority so virtualPlugin must be called first. It processes all
	 * connection events even if there are more of them than this.pendEvents.   
	 */
	manager.virtualPlugin.pendEvents(this.pendEvents);
	if (manager.epicsPlugin) {
	    manager.epicsPlugin.pendEvents(this.pendEvents);
	}

  	setTimeout(function() { manager.handleEvents(manager); }, this.pendEventsPeriodMs);
};


//register
Manager.prototype.register = function(name,component){
	assert(arguments.length == 2, "Manager.register() requires two arguments.");

	this.counter++;
	var handle = this.counter;
	try{
		this.components.put(handle,component);
	}catch (e){
		e.message = "Manager.register: " + e.message;
		throw new Error(e.message);
	}
	
	this.resolvedPVNames.put(handle,name);

 	setTimeout(function() { callPreInitialize(component,handle,name); }, 1 );
	return handle;	
};

//TODO : change this
function callPreInitialize(component,handle,resolvedName){
	component.preInitialize(handle,resolvedName);
};

//unregister
Manager.prototype.unregister =  function(handle){
	assert(arguments.length == 1, "Manager.unregister() requires one argument.");		
	this.components.remove(handle);	
	this.resolvedPVNames.remove(handle);
	this.plugins.remove(handle);
};

//connect
Manager.prototype.connect = function(handle,resolvedName) {
	assert(arguments.length == 2, "Manager.connect() requires two arguments.");	
	
	if (this.epicsPlugin) {
		var pluginConnectionHandle = this.epicsPlugin.monitorConnectionStatus(resolvedName,"managerConnectionStatusCallback",handle);	
		if(pluginConnectionHandle != 0)
			try{
				this.pluginConnectionHandles.put(handle,pluginConnectionHandle);
			}catch (e){
				e.message = "Manager.connect: " + e.message;
				throw new Error(e.message);
			}
		else
			throw new Error("Manager.connect: plugin connection status monitor for PV name >" + resolvedName + "< failed.");		
	}
	var virtualPluginConnectionHandle = this.virtualPlugin.monitorConnectionStatus(resolvedName,"managerVirtualConnectionStatusCallback",handle);	
	this.virtualPluginConnectionHandles.put(handle,virtualPluginConnectionHandle);
};

function managerConnectionStatusCallback(handle, resolvedName, connectionStatus){
	var component = manager.components.get(handle);
	if(component == null)  // component removed (disconnected)
		return;
		
	var plugin = manager.plugins.get(handle);
	if (plugin == null) {
		manager.plugins.put(handle, manager.epicsPlugin);
	}
		
   	component.notifyConnectionStatus(handle,connectionStatus); 
   	if(connectionStatus) {
	    component.initialize(handle);
	}
};

function managerVirtualConnectionStatusCallback(handle, resolvedName, connectionStatus){
	var component = manager.components.get(handle);
	if(component == null)  // component removed (disconnected)
		return;
	
	var plugin = manager.plugins.get(handle);
	if (plugin == null) {
		manager.plugins.put(handle, manager.virtualPlugin);
	}

   	component.notifyConnectionStatus(handle,connectionStatus); 
   	if(connectionStatus) {
	    component.initialize(handle);
	}
};

//disconnect
Manager.prototype.disconnect = function(handle){	
	assert(arguments.length == 1, "Manager.disconnect() requires one argument.");	
	if(this.pluginConnectionHandles.get(handle) != null){
		this.epicsPlugin.destroyMonitor(this.pluginConnectionHandles.get(handle));
		this.pluginConnectionHandles.remove(handle);
	}
	if(this.virtualPluginConnectionHandles.get(handle) != null){
		this.virtualPlugin.destroyMonitor(this.virtualPluginConnectionHandles.get(handle));
		this.virtualPluginConnectionHandles.remove(handle);
	}
};

//getCtrl
Manager.prototype.getCtrl = function(handle){
	assert(arguments.length == 1, "Manager.getCtrl() requires one argument.");		
	var component = this.components.get(handle);
	if(component == null){ // this should not happen
		throw new Error("Manager.getCtrl: component with handle >" + handle + "< does not exist.");		
	}
		
	this.plugins.get(handle).getCTRL(this.resolvedPVNames.get(handle), "managerGetCtrlCallback" ,handle);
};

function managerGetCtrlCallback(handle, resolvedName, value, status, severity, ctrl){
	var component = manager.components.get(handle);	
	if(component == null){ // component removed (disconnected)
		return;
	}		
	var ctrlData = new CTRLData(status, severity, value, ctrl);	
	component.notifyGetCtrl(handle,ctrlData);	
};

//get
Manager.prototype.get = function(handle){
	assert(arguments.length == 1, "Manager.get() requires one argument.");	
	var component = this.components.get(handle);
	if(component == null){ // this should not happen
		throw new Error("Manager.get: component with handle >" + handle + "< does not exist.");		
	}	
	
	this.plugins.get(handle).getPV( this.resolvedPVNames.get(handle) , "managerGetCallback" ,handle);
};

function managerGetCallback(handle, resolvedName, value, status, severity, timestamp){
	var component = manager.components.get(handle);
	if(component == null){ // component removed (disconnected)
		return;
	}		
	component.notifyGet(handle, value, status, severity, timestamp);
};


//put
Manager.prototype.put = function(handle,value){	
	assert(arguments.length == 2, "Manager.put() requires two arguments.");			
	var component = this.components.get(handle);
	if(component == null){ // this should not happen
		throw new Error("Manager.put: component with handle >" + handle + "< does not exist.");				
	}
	if (this.plugins.get(handle)) { // some components call put even if not connected
	    this.plugins.get(handle).putPV( this.resolvedPVNames.get(handle) , "managerPutCallback" ,handle, value);
	}
};

function managerPutCallback(handle, resolvedName, value, completionStatus){
	var component = manager.components.get(handle);
	if(component == null){ // component removed (disconnected)		
		return;
	}		
	component.notifyPut(handle,completionStatus);
};


//monitor
Manager.prototype.createMonitor = function(handle,monitorComponent){
	assert(arguments.length == 2, "Manager.createMonitor() requires two arguments.");	
	this.monitorCounter++;		
	var component = this.components.get(handle);
	if(component == null){ // this should not happen
		throw new Error("Manager.createMonitor: component with handle >" + handle + "< does not exist.");		
	}	
	try{
		this.monitors.put(this.monitorCounter,handle);
	}catch (e){
		e.message = "Manager.createMonitor: " + e.message;
		throw new Error(e.message);
	}
	var pluginMonitorHandle = this.plugins.get(handle).monitorPV(this.resolvedPVNames.get(handle),"managerMonitorCallback", this.monitorCounter);
	if(pluginMonitorHandle != 0 )
		try{
			this.pluginMonitorHandles.put(this.monitorCounter,pluginMonitorHandle);
		}catch (e){
			e.message = "Manager.createMonitor: " + e.message;
			throw new Error(e.message);
		}		
	else
		throw new Error("Manager.createMonitor: plugin monitor for PV name >" + this.resolvedPVNames.get(handle)+ "< failed.");		
		
	return this.monitorCounter;
};

function managerMonitorCallback(monitorHandle, resolvedName, value, status, severity, timestamp){
	var handle = manager.monitors.get(monitorHandle);
	if(handle == null) // monitor destroyed 
		return;
	var component = manager.components.get(handle);
	if(component == null){ // component removed (disconnected)	
		return;
	}	
	component.notifyMonitor(handle, value, status, severity, timestamp);
};

Manager.prototype.destroyMonitor = function(monitorHandle){
	assert(arguments.length == 1, "Manager.destroyMonitor() requires one argument.");
	var pluginMonitorHandle = this.pluginMonitorHandles.get(monitorHandle);
	if(pluginMonitorHandle == null){ //monitor was not yet created
		return;		
	}	
	var handle = manager.monitors.get(monitorHandle);
	this.plugins.get(handle).destroyMonitor(pluginMonitorHandle);
	this.pluginMonitorHandles.remove(monitorHandle);
	this.monitors.remove(monitorHandle);
};

//writable monitor
Manager.prototype.createWritableMonitor = function(handle) {
	assert(arguments.length == 1, "Manager.createWritableMonitor() requires two arguments.");	

	var component = this.components.get(handle);
	if(component == null){ // this should not happen
		throw new Error("Manager.createWritableMonitor: component with handle >" + handle + "< does not exist.");		
	}	

	if (this.plugins.get(handle).monitorWritableStatus) {
    	this.writableMonitorCounter++;
    	this.writableMonitors.put(this.writableMonitorCounter, handle);		
	    var monitorHandle = this.plugins.get(handle).monitorWritableStatus(this.resolvedPVNames.get(handle), "managerWritableMonitorCallback", this.writableMonitorCounter);
    	this.pluginWritableMonitorHandles.put(this.writableMonitorCounter, monitorHandle);
    	return this.writableMonitorCounter;
	}
	return null;
};

function managerWritableMonitorCallback(monitorHandle, resolvedName, writable){

	var handle = manager.writableMonitors.get(monitorHandle);
	if (handle == null) { // monitor destroyed 
		return;
	}
	var component = manager.components.get(handle);
	if(component == null) { // component removed (disconnected)	
		return;
	}	
	component.notifyWritableStatus(handle, writable);
};

Manager.prototype.destroyWritableMonitor = function(monitorHandle){
	assert(arguments.length == 1, "Manager.destroyWritableMonitor() requires one argument.");
	if (monitorHandle) {
		var pluginHandle = this.pluginWritableMonitorHandles.remove(monitorHandle);
    	var handle = this.writableMonitors.remove(monitorHandle);
    	this.plugins.get(handle).destroyMonitor(pluginHandle);
	}
};

Manager.prototype.revalidateSubstitutions = function(handle){
	assert(arguments.length == 1, "Manager.revalidateSubstitutions() requires one argument.");	
	var handleArray = this.components.keys();
	var component;
	//for each registered component call cleanup and reregister
	var x,y;
	for (x = handleArray.length - 1; x >= 0; x--){
		component = this.components.get(handleArray[x]);
		if(component == null){
			throw new Error("Manager.revalidateSubstitutions: component with handle >" + handleArray[x] + "< does not exist.");						
		}
		component.cleanup(handleArray[x]);
		component.reregister(handleArray[x]);		
		
	}
};
