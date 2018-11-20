VirtualPVManager = function() {

    this.pvs = new Hashtable();
    this.connectionMonitors = new Hashtable();
    this.valueMonitors = new Hashtable();

    this.writableMonitors = new Hashtable();
    
    this.lowPrioEvents = new LinkedList();
    this.highPrioEvents = new LinkedList();
};

VirtualPVManager.prototype.addEvent = function(callback, args, highPriority) {
    if (highPriority) {
        this.highPrioEvents.insertEnd({callback: callback, args: args.clone()});
    } else {
        this.lowPrioEvents.insertEnd({callback: callback, args: args.clone()});
    }
};

VirtualPVManager.prototype.execute = function(event) {
	var evalString = event.callback + "(";
	for (var j = 0; j < event.args.length; j++) {
		evalString += "event.args[" + j + "]";
			
		if (j < event.args.length - 1) {
		    evalString += ", ";
		}
	}
	evalString += ")";
	eval(evalString);
};

VirtualPVManager.prototype.notifyConnectionChange = function(pv, state) {
	var name = pv.getName();
	var monitorTable = this.connectionMonitors.get(name);
	if (monitorTable != null) {
		var keys = monitorTable.keys();
		for (var i = keys.length - 1; i >= 0; i--) {
            // Add high priority event.
            this.addEvent(monitorTable.get(keys[i]), [keys[i], name, state], true);
		}
	}
	
};

VirtualPVManager.prototype.notifyValueChange = function(pv) {
	var name = pv.getName();
	var monitorTable = this.valueMonitors.get(name);
	if (monitorTable != null) {
		var keys = monitorTable.keys();
		for (var i = keys.length - 1; i >= 0; i--) {
            this.addEvent(monitorTable.get(keys[i]), [keys[i], name, pv.getValue(), pv.getStatus(), pv.getSeverity(), pv.getTimestamp()]);
		}
	}
};

VirtualPVManager.prototype.notifyWritableChange = function(pv) {
	var name = pv.getName();
	var monitorTable = this.writableMonitors.get(name);
	if (monitorTable != null) {
		var keys = monitorTable.keys();
		for (var i = keys.length - 1; i >= 0; i--) {
            this.addEvent(monitorTable.get(keys[i]), [keys[i], name, pv.getWritable()]);
		}
	}
};

// virtualpvs <-> VirtualPVManager interface

VirtualPVManager.prototype.addPV = function(pv) {
	var name = pv.getName();
	if (this.pvs.get(name) == null) {
    	this.pvs.put(pv.getName(), pv);
    	this.notifyConnectionChange(pv, true);
        this.notifyValueChange(pv);
	} else {
	    //throw new Error("VirtualPVManager.addPV: PV >" + name + "< already exists.");
	}
};

VirtualPVManager.prototype.removePV = function(pv) {
	var name = pv.getName();
	if (this.pvs.remove(name) != null) {
	    this.notifyConnectionChange(pv, false);
	} else {
	    //throw new Error("VirtualPVManager.removePV: PV >" + name + "< is not registered.");
	}
};

VirtualPVManager.prototype.onPVChange = function(pv) {
	var name = pv.getName();
	if (this.pvs.get(name) != null) {
        this.notifyValueChange(pv);
	} else {
	    //throw new Error("VirtualPVManager.onPVChange: PV >" + name + "< is not registered.");
	}
};

VirtualPVManager.prototype.onPVWritableChange = function(pv) {
	var name = pv.getName();
	if (this.pvs.get(name) != null) {
        this.notifyWritableChange(pv);
	} else {
	    //throw new Error("VirtualPVManager.onPVChange: PV >" + name + "< is not registered.");
	}
};

// Manager<->VirtualPVManager interface

VirtualPVManager.prototype.pendEvents = function(pendEvents) {

	// Execute all high priority events. 
	var event = this.highPrioEvents.firstNode;
	var i = 0;
	while (event != null) {
        this.execute(event);		
		this.highPrioEvents.remove(event);

	    event = this.highPrioEvents.firstNode;
		i++;
	}

	// Execute low priority events until pendEvents limit reached. 
	event = this.lowPrioEvents.firstNode;
	while (i < pendEvents && event != null) {
        this.execute(event);		
		this.lowPrioEvents.remove(event);

	    event = this.lowPrioEvents.firstNode;
		i++;
	}
};

VirtualPVManager.prototype.monitorConnectionStatus = function(name, callback, handle) {
    
	var monitorTable = this.connectionMonitors.get(name);
	if (monitorTable == null) {
		monitorTable = new Hashtable();
        this.connectionMonitors.put(name, monitorTable);
	}
	monitorTable.put(handle, callback);
	
    var pv = this.pvs.get(name);
    if (pv != null) {
        this.addEvent(callback, [handle, name, true]);
    }
    
    return {type: "connection", name: name, handle: handle};
};

VirtualPVManager.prototype.getCTRL = function(name, callback, handle) {
    
    var pv = this.pvs.get(name);
    if (pv != null) {
    	this.addEvent(callback, [handle, name, pv.getValue(), pv.getStatus(), pv.getSeverity(), pv.getCtrl()]);
    } else {
	    throw new Error("VirtualPVManager.getCTRL: PV >" + name + "< not connected.");
    }		
};

VirtualPVManager.prototype.getPV = function(name, callback, handle) {
    var pv = this.pvs.get(name);
    if (pv != null) {
    	this.addEvent(callback, [handle, name, pv.getValue(), pv.getStatus(), pv.getSeverity(), pv.getTimestamp()]);
    } else {
	    throw new Error("VirtualPVManager.getPV: PV >" + name + "< not connected.");
    }		
};

VirtualPVManager.prototype.putPV = function(name, callback, handle, value) {
    var pv = this.pvs.get(name);
    if (pv != null) {
    	var competionStatus = epicsDef.ECA_NORMAL;
    	try {
    	    pv.setValue(value);
    	} catch(exception) {
    		competionStatus = epicsDef.ECA_PUTFAIL;
    	}
    	this.addEvent(callback, [handle, name, pv.getValue(), competionStatus]);
    	
     	this.notifyValueChange(pv);
    } else {
	    throw new Error("VirtualPVManager.putPV: PV >" + name + "< not connected.");
    }		
};

VirtualPVManager.prototype.monitorPV = function(name, callback, handle) {

	var monitorTable = this.valueMonitors.get(name);
	if (monitorTable == null) {
		monitorTable = new Hashtable();
        this.valueMonitors.put(name, monitorTable);
	}
	monitorTable.put(handle, callback);

    var pv = this.pvs.get(name);
    if (pv != null) {
        this.addEvent(callback, [handle, pv.getName(), pv.getValue(), pv.getStatus(), pv.getSeverity(), new Date().getTime()]);
    }		
    return {type: "value", name: name, handle: handle};
};

VirtualPVManager.prototype.monitorWritableStatus = function(name, callback, handle) {

	var monitorTable = this.writableMonitors.get(name);
	if (monitorTable == null) {
		monitorTable = new Hashtable();
        this.writableMonitors.put(name, monitorTable);
	}
	monitorTable.put(handle, callback);

    var pv = this.pvs.get(name);
    if (pv != null) {
        this.addEvent(callback, [handle, pv.getName(), pv.getWritable()]);
    }		
    return {type: "writable", name: name, handle: handle};
};

VirtualPVManager.prototype.destroyMonitor = function(monitorId) {
    var table = null;
    if (monitorId.type == "connection") {
        table = this.connectionMonitors;
    } else if (monitorId.type == "value") {
        table = this.valueMonitors;
    } else if (monitorId.type == "writable") {
        table = this.writableMonitors;
    }
    
    if (table != null) {
	    var monitorTable = table.get(monitorId.name);
	    
	    if (monitorTable != null) {
	    	if (monitorTable.remove(monitorId.handle) != null) {
	    		return;
	    	}
	    }
    }
    throw new Error("VirtualPVManager.destroyMonitor: unknown monitor: type >" + monitorId.type + "<, pv name >" + monitorId.name + "<, handle >" + monitorId.handle + "<.");
};
