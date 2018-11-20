var MacroValuePairs = {
	
	urlStringToHashtable: function(string) {

		var macroValuePairs = new Hashtable();
		var locvartemp = ( string.indexOf( "?" ) + 1 ) ? string.substr( string.indexOf( "?" ) + 1 ) : null;
		if(locvartemp != null){
		    locvartemp = locvartemp.split("&");
		
			for( var x = 0; x < locvartemp.length; x++ ) {
			    var lvTempVar = locvartemp[x].split( "=" );
				if(	lvTempVar[0] == null || lvTempVar[0] == '' || lvTempVar[1] == null || lvTempVar[1] == '')
				    ;//throw new Error("Invalid macro specification in url!");			
				else 
				    macroValuePairs.put('$(' + unescape(lvTempVar[0]) + ')',unescape(lvTempVar[1]));	
		    }
		}
		return macroValuePairs;
	},

	listToHashtable: function(list) {

		var table = new Hashtable();
		for(var i = 0; i < list.length; i++){
		    table.put(list[i].macroName, list[i].macroValue);	
		}
		return table;
	}
};
