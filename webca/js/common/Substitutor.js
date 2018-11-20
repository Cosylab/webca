/*****************************************
Substitutor object
******************************************/
Substitutor = function(id, manager) {
	Substitutor.superclass.constructor.call(this, id, manager); 
};
YAHOO.lang.extend(Substitutor, Component); 

Substitutor.prototype.substitute = function(name){
    return name;
};

Substitutor.prototype.getActiveMacros = function(macroPairsArray){
	return macroPairsArray;
};
