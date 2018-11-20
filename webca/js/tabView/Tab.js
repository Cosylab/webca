Tab = function(name, id, manager) {
	//call super class constructor	
	Tab.superclass.constructor.call(this,name,id, manager);
	
	this.content = document.getElementById(id);

	this.index = 0;
	var siblingIndex = 0;
	var debug = ""; 
	var siblings = this.content.parentNode.childNodes;
	while (siblingIndex < siblings.length &&  this.content != siblings[siblingIndex]) {
		if (siblings[siblingIndex].id && siblings[siblingIndex].id.startsWith("tab")) {
    		this.index++;
		}
		siblingIndex++;
	}

    var htmlTabView = document.getElementById(id).parentNode;
    while (htmlTabView && !htmlTabView.id.startsWith("tabView")) {
    	htmlTabView = htmlTabView.parentNode;
    }
    
    this.yahooTab = null;
    if (htmlTabView) {
    	var tabView = components.get(htmlTabView.id);
    	if (tabView) {
            this.yahooTab = tabView.getYahooTabView().get('tabs')[this.index];
    	}
    }
	this.readbackHandle = this.manager.register(this.readbackName, this);		
};
YAHOO.lang.extend(Tab, Monitor);


Tab.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "Tab.preInitialize() requires two arguments.");
	this.readbackHandle = handle;
	this.resolvedReadbackName = resolvedName;	
	this.setLabel(resolvedName);
};	


Tab.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "Tab.cleanup() requires one argument.");
	this.manager.unregister(this.readbackHandle);	
	this.setLabel(this.readbackName);
};

Tab.prototype.hasContextMenu = function() {
	return false;  
};

Tab.prototype.setLabel = function(label) {
    if (this.yahooTab) {
        this.yahooTab.set('label', label);    	
    } 
};
