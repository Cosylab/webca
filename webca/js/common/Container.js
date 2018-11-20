/*****************************************
Container object
******************************************/
Container = function(id, manager){
	Container.superclass.constructor.call(this, id, manager); 
	
	this.elements = new Array;
};
YAHOO.lang.extend(Container, Component); 
