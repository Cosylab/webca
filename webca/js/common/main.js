//Repaint event
function repaintObj() { 
    // define a custom event 
    this.repaintEvent = new YAHOO.util.CustomEvent("repaint", this); 
} 				

// Global objects initialization.
var components = new Hashtable();	 

var contextMenu; 
var ids = new Array; 	
var menuComponents = new Array;	 

var epicsPlugin = document.getElementById("EPICSPlugin");	
var epicsDef = new EpicsDef(); 		 
var virtualPVManager = new VirtualPVManager();
var manager = new Manager(epicsPlugin, virtualPVManager, pendEventsVar, pendEventsPeriodsMsVar);		 
var repaintObjInstance = new repaintObj(); 	
