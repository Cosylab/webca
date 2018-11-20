// macroValuePairs can be either a list of pairs or hashtable.  
HashSubstitutor = function(id, manager, macroValuePairs) {		
	HashSubstitutor.superclass.constructor.call(this, id, manager); 
	
	if (macroValuePairs instanceof Array) {
		macroValuePairs = MacroValuePairs.listToHashtable(macroValuePairs);
	}
	this.macroValuePairs = macroValuePairs;
};
YAHOO.lang.extend(HashSubstitutor, Substitutor);

HashSubstitutor.prototype.substitute = function(name) {
	var macrosToReplace = this.macroValuePairs.keys();
	for (var i = macrosToReplace.length - 1; i >= 0; i--) {
		name = name.replace(macrosToReplace[i], this.macroValuePairs.get(macrosToReplace[i]));
	}
	return name;
};

//return array of active macro value pairs 
HashSubstitutor.prototype.getActiveMacros = function(macroPairsArray){

	var macros = this.macroValuePairs.keys();
	var j = macroPairsArray.length;
		
	for(var i = macros.length - 1; i >= 0; i--) {
		macroPairsArray[j] = {
		    macroName: macros[i],
		    macroValue: this.macroValuePairs.get(macros[i])
		};
		j++;
	}
    return macroPairsArray;
};
