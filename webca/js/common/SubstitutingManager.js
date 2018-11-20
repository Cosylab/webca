SubstitutingManager = function(parentManager, macroValuePairs, globalManager) {

	this.parentManager = parentManager; 
	this.globalManager = globalManager; 
	
	this.substitutors = new Hashtable();

	this.substitutorCounter = 0;
	
	// private substitutor
	this.substitutor = new HashSubstitutor("ManagerPrivateMux", null, macroValuePairs);	

	this.childrenManagers = new Array();
	if (this.parentManager) {
		this.parentManager.addChildManager(this);
	}
	
	this.components = new Hashtable();
};

SubstitutingManager.prototype.handleEvents = function(manager) {
    this.globalManager.handleEvents(manager);
};

SubstitutingManager.prototype.register = function(name,component){
	assert(arguments.length == 2, "SubstitutingManager.register() requires two arguments.");
    return this.globalManager.register(this.substitute(name), component);
};

SubstitutingManager.prototype.unregister = function(handle) {
    this.globalManager.unregister(handle);
};

SubstitutingManager.prototype.connect = function(handle,resolvedName) {
	this.globalManager.connect(handle, resolvedName);
};

SubstitutingManager.prototype.disconnect = function(handle){	
	this.globalManager.disconnect(handle);
};

SubstitutingManager.prototype.getCtrl = function(handle) {
	this.globalManager.getCtrl(handle);
};

SubstitutingManager.prototype.get = function(handle) {
	this.globalManager.get(handle);
};

SubstitutingManager.prototype.put = function(handle,value) {	
	this.globalManager.put(handle, value);
};

SubstitutingManager.prototype.createMonitor = function(handle,monitorComponent) {
	return this.globalManager.createMonitor(handle, monitorComponent);
};

SubstitutingManager.prototype.destroyMonitor = function(monitorHandle) {
	this.globalManager.destroyMonitor(monitorHandle);
};

SubstitutingManager.prototype.createWritableMonitor = function(handle) {
	this.globalManager.createWritableMonitor(handle);
};

SubstitutingManager.prototype.destroyWritableMonitor = function(monitorHandle) {
	this.globalManager.destroyWritableMonitor(monitorHandle);
};

SubstitutingManager.prototype.registerSubstitutor = function(substitutor){
	assert(arguments.length == 1, "SubstitutingManager.registerSubstitutor() requires one argument.");	
	this.substitutorCounter++;
	try{
		this.substitutors.put(this.substitutorCounter,substitutor);
	}catch (e){
		e.message = "SubstitutingManager.registerSubstitutor: " + e.message;
		throw new Error(e.message);
	}
	return this.substitutorCounter;
};

SubstitutingManager.prototype.unregisterSubstitutor =  function(handle){
	assert(arguments.length == 1, "SubstitutingManager.unregisterSubstitutor() requires one argument.");	
	this.substitutors.remove(handle);
};

SubstitutingManager.prototype.revalidateSubstitutions = function(handle){
	this.globalManager.revalidateSubstitutions(handle);
};

// Calls registered substitutors to substiture given name.
SubstitutingManager.prototype.substitute = function(name){
	assert(arguments.length == 1, "SubstitutingManager.substitute() requires one argument.");	
	var substitutedName = name;
	
	//first try private substitutor
	substitutedName = this.substitutor.substitute(substitutedName);
	
	//for each registered substitutor call substitute	
	if(!this.substitutors.isEmpty()){
		var subsArray = this.substitutors.values();

		for (var x = subsArray.length - 1; x >= 0; x--){
			substitutedName = subsArray[x].substitute(substitutedName);
		}		
	}	
	
	if (this.parentManager) {
		return this.parentManager.substitute(substitutedName); 
	}
	return substitutedName;
};

// Returns array of active macro value pairs of all registered substitutors.
SubstitutingManager.prototype.getActiveMacros = function(macroPairs) {
	if (!macroPairs) {
	    macroPairs = new Array();
	}
	//first for private substitutor
    macroPairs = this.substitutor.getActiveMacros(macroPairs);
	
	//now for each registered substitutor 
	if(!this.substitutors.isEmpty()){
		var subsArray = this.substitutors.values();

		for (var x = subsArray.length - 1; x >= 0; x--){
			macroPairs = subsArray[x].getActiveMacros(macroPairs);			
		}		
	}	

	if (this.parentManager) {
		return this.parentManager.getActiveMacros(macroPairs); 
	}
	return macroPairs;
};

SubstitutingManager.prototype.addChildManager = function(manager) {
    this.childrenManagers.push(manager);
};

SubstitutingManager.prototype.registerInitCall = function(type, functionVar) {
    var compArray = this.components.get(type);
    if (!compArray) {
        compArray = new Array();
        this.components.put(type, compArray);
    }
    compArray.push(functionVar);
};

SubstitutingManager.prototype.initComponents = function(mode) {
	
	if (!mode) {
		this.initComponents("normal");
		this.initComponents("tabView");
		this.initComponents("tab");
		return;
	}

	var compArray;
	
	if (mode != "normal") {
		compArray = this.components.get(mode);
		if (compArray) {
			for (var i = 0; i < compArray.length; i++) {
				this.initComponent(compArray[i], mode);
			}
		}
	} else {
		compArray = this.components.get("mux");
		if (compArray) {
			for (var i = 0; i < compArray.length; i++) {
				this.initComponent(compArray[i], "mux");
			}
		}
		var keys = this.components.keys();
		for (var j = 0; j < keys.length; j++) {
			if (keys[j] != "mux" && keys[j] != "tabView" && keys[j] != "tab") {
				compArray = this.components.get(keys[j]);
        		if (compArray) {
					for (var i = 0; i < compArray.length; i++) {
        				this.initComponent(compArray[i], keys[j]);
					}
				}
			}
		}
	}
	
	for (var i = 0; i < this.childrenManagers.length; i++) {
		this.childrenManagers[i].initComponents(mode);
	}
};

SubstitutingManager.prototype.initComponent = function(initFun, type) {
	var component = initFun();
	components.put(component.id, component);
	
	if (component.hasContextMenu()) {
  	    ids.push(component.id);
        menuComponents.push(component);
	}
};
