Mux = function(id, manager) {		
	//call super class constructor	
	Mux.superclass.constructor.call(this, id, manager); 
	
	this.sequences = new Hashtable();

	//call connect
	this.handle = this.manager.registerSubstitutor(this);		
};
YAHOO.lang.extend(Mux, Substitutor);

Mux.prototype.substitute = function(name){
	assert(arguments.length == 1, "Mux.substitute() requires one argument.");
	var y;
	var macrosToReplace = new Array;
	var macroPairs = this.sequences.get(this.selected);
	var macrosToReplace = macroPairs.keys();
	for (y = macrosToReplace.length - 1; y >= 0; y--){
			name = name.replace(macrosToReplace[y], macroPairs.get(macrosToReplace[y]));
	}	
	return name;
};

//return array of active macro value pairs 
Mux.prototype.getActiveMacros = function(macroPairsArray){
	assert(arguments.length == 1, "Mux.getActiveMacros() requires one argument.");
	var i,j;
	var macroPairs = this.sequences.get(this.selected);
	var macros = macroPairs.keys();
	var inArrayLength =  macroPairsArray.length ;
	for (i = inArrayLength,j=0 ; i < (macros.length + inArrayLength); i++,j++){
			macroPairsArray[i] = new Array();
			macroPairsArray[i]['macroName'] = macros[j];
			macroPairsArray[i]['macroValue'] = macroPairs.get(macros[j]);
	}
	
	return macroPairsArray;
};

Mux.prototype.hasContextMenu = function() {
	return false;  
};
