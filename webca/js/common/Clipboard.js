var Clipboard = {
	
	copy: function(string) {
		
		if (window.clipboardData) {
	    	// For Internet Explorer/Netscape. 
		    if (!window.clipboardData.setData("Text", string)) {
			    //alert("Text was not copied to clipboard!");
			    return false;
			}
			return true;
		}
		
	
		var execCommandCopyOk = true;
		try {
		    document.execCommand("Copy", false);    
		} catch(e) {
			execCommandCopyOk = false;
		}
		
		if (execCommandCopyOk) {
	    	// For Safari.
		    string = Clipboard.convertToHtmlTable(string);
			
			var div = document.createElement("div");
			div.innerHTML = string;
			document.body.appendChild(div);
	
	    	try {
		        DomSelector.Selection.clear();
	    	} catch (e) {
	    	}
	    	try {
			    DomSelector.Selection.add(DomSelector.Ranges.selectNode(div));
			    document.execCommand("Copy", false);
	    	} catch(e) {
			    return false;
		    } finally {
				document.body.removeChild(div);
		    }
			return true;
		}
	
	    // For Firefox. 
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")}
		catch(e) {
			alert("Your current security settings do not allow copying to clipboard.");
			return false;
		}
			
		try {
			e = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
		} catch(e) {
			return false;
		}
		try{
			b = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		} catch(e) {
			return false;
		}

		string = Clipboard.convertToString(string);
		
		b.addDataFlavor("text/unicode");
		o = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		o.data = string;
		b.setTransferData("text/unicode", o, string.length * 2);

		try {
			t = Components.interfaces.nsIClipboard;
		} catch(e) {
			return false;
		}
			
		e.setData(b, null, t.kGlobalClipboard);
	
		//alert("Text successfully copied to clipboard:\n\n" + string);
		return true;
	},
	
	/* Returns a string with tab and line delimiters.
	 */
	convertToString: function(value, notLast) {
    	// For arrays.
    	if (Clipboard.isArray(value)) {
		    var string = "";
		    var i = 0;
		    for (i = 0; i < value.length - 1; i++) {
		    	string += Clipboard.convertToString(value[i], true);
		    }
		    if (i < value.length) {
		    	string += Clipboard.convertToString(value[i]);
		    }
		    value = string;
		    if (notLast) {
		    	value += "\n"; 
		    }
    	// For single values.
    	} else {
    		value = value.toString();
		    if (notLast) {
		    	value += "\t"; 
		    }
    	}
    	return value;
	},

	/* Returns a html formatted table.
	 */
	convertToHtmlTable: function(value, notLast) {
        // Make 2d array.
    	if (!Clipboard.isArray(value)) {
    		value = [[value]];
    	} else if (!Clipboard.isArray(value[0])) {
    		value = [value];
    	}
    	
    	var table = "<table>";
    	var line;
		
		for (var i = 0; i < value.length; i++) {
			line = "";
	  		for (var j = 0; j < value[i].length; j++) {
	  			line += "<td>" + value[i][j] + "</td>"; 
			}
			table += "<tr>" + line + "</tr>";
		}
    	table += "</table>";
    	
    	return table;
	},

	isArray: function(value) {
    	var valueType = typeof(value);
		return valueType == "function" || valueType == "object";
	}
};
