/*
* Utility functions
*/

/*
 * Used for simpler code
 * 
 * @param  {Expresion} condition expresion to be evaluated
 * @param  {errorMessage} error message to be trown	
 * 
 */
function assert(condition, errorMessage){
	if(!(condition)){
		throw new Error(errorMessage);
	}
}

/*
 * Used to log an exception
 * 
 * @param  {Expresion} condition expresion to be evaluated
 * @param  {errorMessage} error message to be trown	
 * 
 */
function logException(e){
		if(e.lineNumber && e.fileName && e.stack){
			log(e.message + " file :" + e.fileName + ":" + e.lineNumber);
			log(e.stack);
		}
		else
			log(e.message);
}

/*
 * Check which button was pressed (left or right).
 *  
 * @param e object DOM event object 
 * @return true if right button was pressed to trigger the event and false otherwise
 */
function isRightButton(e){
	if (!e) var e = window.event;

	if (e.which){ 
		if(e.which == 3){
			return true;
		}
		else if(e.which == 1){
			if(e.metaKey == 1){
				return true;
			}
			else{
				return false;
			}
		}
	}	
	return false;
}

function IsNumeric(sText)
{
   var ValidChars = "0123456789.";
   var IsNumber = true;
   var Char;
   
   if(sText.charAt(0) == '-'){
   		sText = sText.substring(1,sText.length);
   }

 
   for (var i = 0; i < sText.length && IsNumber == true; i++) 
      { 
      Char = sText.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) 
         {
         IsNumber = false;
         }
      }
   return IsNumber;   
}


function createRow(/*Obj*/ document,/*Obj*/ table,/*String*/ name,/*String*/ value){
 	var row = document.createElement("tr");
 	table.appendChild(row);    
     
 	var column = document.createElement("td");
    column.appendChild(document.createTextNode(name));    
    row.appendChild(column);
    column = document.createElement("td");
    column.appendChild(document.createTextNode(value));    
    row.appendChild(column);  	
}

function webcaLog(message) {
    if (!webcaLog.window_ || webcaLog.window_.closed) {
        var win = window.open("", null, "width=400,height=200," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
        if (!win) return;
        var doc = win.document;
        doc.write("<html><head><title>Debug Log</title></head>" +
                  "<body></body></html>");
        doc.close();
        webcaLog.window_ = win;
    }
    var date = new Date();
    var logLine = webcaLog.window_.document.createElement("div");
    logLine.appendChild(webcaLog.window_.document.createTextNode(date.toLocaleString() + " : >" + message + "<"));
    //webcaLog.window_.document.body.appendChild(logLine);
    if (this.line) {
        webcaLog.window_.document.body.insertBefore(logLine, this.line);
    } else {
        webcaLog.window_.document.body.appendChild(logLine);
    }
    this.line = logLine;
}
	