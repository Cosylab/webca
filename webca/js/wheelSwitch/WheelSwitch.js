/**
 * Descedant of <code>Control</code> that contains a row of digits
 * and optionally a two way up-down buttons. It can be used for displaying and
 * modifying a single formatted <code>double</code> value with an optional
 * unit string (also in digits) displayed next to the value. Value manipulation
 * and display formatting is handled by the <code>WheelswitchFormatter</code>.
 *
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 *
 * @see Digit
 * @see WheelswitchFormatter
 */
WheelSwitch = function(name,id, manager,alarmSensitive,displayFormat, readOnly){
	this.base = Control;
	this.base(name,name,id, manager,alarmSensitive, readOnly);	
	
	this.digits = new Array();
	this.unitDigit = null;
	
	this.editable = true;
	this.textFocus = false;
	
	this.selectedDigit = -1;
	this.INCREASE_SELECTION = -11;
	this.DECREASE_SELECTION = -12;	
	this.INCREASE_VALUE = -1;
	this.DECREASE_VALUE = -2;	

	if(displayFormat == null || displayFormat == "")
		this.precisionFromPV = true;
	else
	{
		// wheelswitch requires sign as first character
		if (displayFormat.charAt(0) != "+")
			displayFormat = "+" + displayFormat;
		this.precisionFromPV = false;
	}	

	this.formatter = new Formatter(displayFormat);
	
	//UpDownButtons
	this.upDownButton = new UpDownButton(this.id,this);
	this.clickedId = null;
	this.beforeClickClass = "";
	
	// Used for continues increase/decrease events events
	this.changeCounter = 0;
	this.contCounter = 0;
	this.contHashTable = new Hashtable();
	this.oldTime = new Date;
	this.newTime = new Date;

	this.wheelSwitch = document.getElementById(this.id);	
	this.table = this.wheelSwitch.rows[0];

	//insert buttons
	this.table.appendChild(this.upDownButton.column);	

	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);
};
YAHOO.lang.extend(WheelSwitch, Control);





WheelSwitch.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "WheelSwitch.preInitialize() requires two arguments.");	
	WheelSwitch.superclass.preInitialize.call(this, handle,resolvedName); 
	//both readback and control PV name are the same
	this.resolvedControlName = resolvedName;
	this.upDownButton.disable();
	this.setStringValue(null);
};
	
WheelSwitch.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "WheelSwitch.notifyConnectionStatus() requires two arguments.");	
	WheelSwitch.superclass.notifyConnectionStatus.call(this, handle,connected); 	

	if (connected) {
		this.createWritableMonitor(handle);
	}
 	
 	if(connected && this.writable){
 		this.upDownButton.enable();			
    }
    else{ 
        this.upDownButton.disable();	 
		this.setStringValue(null);
    }	
};
		
WheelSwitch.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "WheelSwitch.cleanup() requires one argument.");
	this.destroyWritableMonitor(handle);
	WheelSwitch.superclass.cleanup.call(this,handle);
	this.setStringValue(null);
};	

WheelSwitch.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "WheelSwitch.notifyGetCtrl() requires two arguments.");
	WheelSwitch.superclass.notifyGetCtrl.call(this, handle, ctrlData); 

	var lowerLimit = this.ctrlData.getLowerControlLimit();
	var upperLimit = this.ctrlData.getUpperControlLimit();
	
	// Ignore limits if zero or invalid data.
	if (lowerLimit <= upperLimit && (lowerLimit != 0 || upperLimit != 0)) {
    	this.lowerControlLimit = lowerLimit;
    	this.upperControlLimit = upperLimit;
	} else {
    	this.lowerControlLimit = null;
    	this.upperControlLimit = null;
	}

	if(this.precisionFromPV){//format not set in xml so use PREC from pv
		this.formatter.setFormatFromPV(this.ctrlData.getPrecision());
	}	
	
	
	// do not work on string values...
	if (!this.ctrlData.isArray && this.ctrlData.isNumeric) {
		if(!this.monitorHandle) {
			this.monitorHandle = this.manager.createMonitor(handle,this); 
		}
	} else {
        this.upDownButton.disable();
	}	 
};

WheelSwitch.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "WheelSwitch.notifyGetCtrl() requires five arguments.");
	WheelSwitch.superclass.notifyMonitor.call(this, handle,value,status,severity,timestamp); 

	var strValue = new String(value);
	
	this.setStringValue(strValue);
};

WheelSwitch.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "WheelSwitch.notifyWritableStatus() requires two arguments.");
	WheelSwitch.superclass.notifyWritableStatus.call(this, handle, writable);

    if (this.connected && this.writable) {
 		this.upDownButton.enable();			
    } else { 
        this.upDownButton.disable();
    }	 
};

/*
 * Contructs units digit from scratch.
 */
WheelSwitch.prototype.setupUnitsDigits = function(){
	//remove all children except buttons 
	if(this.table.hasChildNodes()){
		var x = this.table.childNodes;
		
		for (var i = x.length - 2;i >= 0;i--)
  		{
		  this.table.removeChild(x[i]);
		}
	}
	
	if(!this.ctrlData) return;
	
	var unit = this.ctrlData.getUnits();

	if (unit == null || unit == "") {
		return;
	}

	this.unitDigit = new UnitDigit(this.id + "Units", unit ,this);
		
	this.table.insertBefore(this.unitDigit.column,this.upDownButton.column);

};

/*
 * Contructs value digits from scratch.
 */
WheelSwitch.prototype.setupValueDigits = function(){
	
	var stringValue = this.formatter.getString();
	
	var digitValue = 0;
	var oldDigit = null;
	var digit = null;
	
	for (var i = 0; i < stringValue.length; i++) {
		digitValue = stringValue.charAt(i);
		
		oldDigit = i < this.digits.length ? this.digits[i] : null; 

		if ((digitValue >= '0') && (digitValue <= '9')) {
			if (oldDigit && oldDigit instanceof ValueDigit) {
    			digit = oldDigit;
    			digit.setValue(stringValue.substring(i, i + 1));
			} else {
    			digit = new ValueDigit(this.id + "Digit" + ((i<10)? "0" + i : i),stringValue.substring(i, i + 1),this);
			}
			digit.setSelected(this.selectedDigit == i?true:false);
		} 
		else {
			if (oldDigit && oldDigit instanceof StaticDigit) {
    			digit = oldDigit;
    			digit.setValue(stringValue.substring(i, i + 1));
			} else {
    			digit = new StaticDigit(this.id + "Digit" + ((i<10)? "0" + i : i),stringValue.substring(i, i + 1),this);
			}
			digit.setSelected(this.selectedDigit == i?true:false);
		}

		this.digits[i] = digit;
	}
		
	this.digits.splice(stringValue.length, this.digits.length - stringValue.length);
};

/*
 * Repositions the components inside the wheelswitch.
 */
WheelSwitch.prototype.setupLayout = function(){

	// Preserve textFocus state.
	var textFocus = this.textFocus;

	//remove all children except buttons and units
	if(this.table.hasChildNodes()){
		var x = this.table.childNodes;
		var numberOfchildren = x.length - 2;
		
		for (var i = numberOfchildren ;i >= 0;i--)
  		{
		  this.table.removeChild(x[i]);
		}
	}
	
	this.setupUnitsDigits();
	
	if(this.digits.length > 0){
		this.table.insertBefore(this.digits[this.digits.length - 1].column,x[0]);
	
		for (var i = this.digits.length - 2; i >= 0; i--) {
			this.table.insertBefore(this.digits[i].column,this.digits[i+1].column);
		}		
	}

	this.textFocus = textFocus;
};



/*
 * Sets a new Digit selection.
 * @param i new digit selection.
 */
WheelSwitch.prototype.setSelectedDigit = function(i){
	assert(arguments.length == 1, "WheelSwitch.setSelectedDigit() requires one argument.");
	if (this.editable) {
		if (i == this.selectedDigit) {
			if (this.textFocus) {
         	    this.digits[i].setFocused();
			}
			return;
		}

		if ((this.selectedDigit >= 0) && (this.selectedDigit < this.digits.length)) {
			this.digits[this.selectedDigit].setSelected(false);
		}

		if ((i == this.INCREASE_SELECTION)
		    || ((i >= 0) && (i < this.digits.length)
		    && this.digits[i] instanceof StaticDigit)) {
			if (i == this.INCREASE_SELECTION) {
				i = this.selectedDigit;
			}

			while ((++i < this.digits.length)
			    && this.digits[i] instanceof StaticDigit) {
				;
			}

			if (i == this.digits.length) {
				i = -1;

				while (this.digits[++i] instanceof StaticDigit) {
					;
				}
			}
		} else if (i == this.DECREASE_SELECTION) {
			i = this.selectedDigit;

			while ((--i >= 0) && this.digits[i] instanceof StaticDigit) {
				;
			}

			if (i < 0) {
				i = this.digits.length;

				while (this.digits[--i] instanceof StaticDigit) {
					;
				}
			}
		}

		if ((i >= 0) && (i < this.digits.length)) {
			this.digits[i].setSelected(true);
			if (this.textFocus) {
             	this.digits[i].setFocused();
            }
		}

		this.selectedDigit = i;
	}
};

/*
 * Returns the currently selected digit.
 * @return int selection index
 */
WheelSwitch.prototype.getSelectedDigit = function()
{
	return this.selectedDigit;
};


/*
* Sets the value at the i-th digit
*/
WheelSwitch.prototype.setDigitValue = function(i, newValue){
	assert(arguments.length == 2, "WheelSwitch.setDigitValue() requires two arguments.");
	if (this.digits[i] instanceof StaticDigit) {
		return;
	}

	var oldStringValue = this.formatter.getString();
	var newStringValue = oldStringValue;

	//flip increase/decrease for negative values
	if ((newValue == this.INCREASE_VALUE)
	    || (newValue ==this.DECREASE_VALUE)) {
		var expIndex = oldStringValue.indexOf('E');

		if (expIndex == -1) {
			expIndex = oldStringValue.length;
		}

		if (((oldStringValue.charAt(0) == '-') && (i < expIndex))
		    ^ ((i > expIndex) && (expIndex < (oldStringValue.length - 1))
		    && (oldStringValue.charAt(expIndex + 1) == '-'))) {
			if (newValue == this.INCREASE_VALUE) {
				newValue = this.DECREASE_VALUE;
			} else {
				newValue = this.INCREASE_VALUE;
			}
		}
	}

	if ((newValue >= 0) && (newValue <= 9)) {
		newStringValue = oldStringValue.substring(0, i)
			+ new String(newValue) + oldStringValue.substring(i + 1);
	} else if (newValue == this.INCREASE_VALUE) {
		var j;

		for (j = i;
		    ((j >= 0) && (oldStringValue.charAt(j) != 'E')
		    && (oldStringValue.charAt(j) != '+')
		    && (oldStringValue.charAt(j) != '-') && (newValue != 0));
		    j--) {
			if (oldStringValue.charAt(j) == '.') {
				continue;
			} else if (oldStringValue.charAt(j) != '9') {
				newStringValue = newStringValue.substring(0, j)
					+ new String(new Number(newStringValue.substring(j, j + 1)) + 1)
					+ newStringValue.substring(j + 1);
				newValue = 0;
			} else {
				newStringValue = newStringValue.substring(0, j) + "0"
					+ newStringValue.substring(j + 1);
			}
		}

		if (newValue != 0) {
			if (oldStringValue.charAt(0) == '.') {
				newStringValue = "1" + newStringValue;
			} else if ((oldStringValue.charAt(j + 1) == '.')
			    && ((oldStringValue.charAt(j) == '+')
			    || (oldStringValue.charAt(j) == '-')
			    || (oldStringValue.charAt(j) == 'E'))) {
				newStringValue = newStringValue.substring(0, 1) + "1"
					+ newStringValue.substring(1);
			} else {
				newStringValue = newStringValue.substring(0, j + 1) + "10"
					+ newStringValue.substring(j + 2);
			}
		}
	} else if (newValue == this.DECREASE_VALUE) {
		var signTag = false;

		for (var j = i;
		    ((j >= 0) && (oldStringValue.charAt(j) != 'E')
		    && (oldStringValue.charAt(j) != '+')
		    && (oldStringValue.charAt(j) != '-')); j--) {
			if ((oldStringValue.charAt(j) != '.')
			    && (oldStringValue.charAt(j) != '0')) {
				signTag = true;
			}
		}

		if (signTag) {
			for (var j = i;
			    ((j >= 0) && (oldStringValue.charAt(j) != 'E')
			    && (oldStringValue.charAt(j) != '+')
			    && (oldStringValue.charAt(j) != '-') && (newValue != 0));
			    j--) {
				if (oldStringValue.charAt(j) == '.') {
					;
				} else if (oldStringValue.charAt(j) != '0') {
					newStringValue = newStringValue.substring(0, j)
						+ new String(new Number(newStringValue.substring(j, j + 1)) - 1)
						+ newStringValue.substring(j + 1);
					newValue = 0;
				} else {
					newStringValue = newStringValue.substring(0, j) + "9"
						+ newStringValue.substring(j + 1);
				}
			}
		} else {
			var indexOfE = oldStringValue.indexOf('E');

			if (i > indexOfE) {
				if (oldStringValue.charAt(indexOfE + 1) == '+') {
					newStringValue = newStringValue.substring(0,
						    indexOfE + 1) + "-"
						+ newStringValue.substring(indexOfE + 2, i) + "1"
						+ newStringValue.substring(i + 1);
				} else if (oldStringValue.charAt(indexOfE + 1) == '-') {
					newStringValue = newStringValue.substring(0,
						    indexOfE + 1) + "+"
						+ newStringValue.substring(indexOfE + 2, i) + "1"
						+ newStringValue.substring(i + 1);
				} else {
					newStringValue = newStringValue.substring(0,
						    indexOfE + 1) + "-"
						+ newStringValue.substring(indexOfE + 1, i) + "1"
						+ newStringValue.substring(i + 1);
				}
			} else {
				if (oldStringValue.charAt(0) == '+') {
					newStringValue = "-" + newStringValue.substring(1, i)
						+ "1" + newStringValue.substring(i + 1);
				} else if (oldStringValue.charAt(0) == '-') {
					newStringValue = "+" + newStringValue.substring(1, i)
						+ "1" + newStringValue.substring(i + 1);
				} else {
					newStringValue = "-" + newStringValue.substring(0, i)
						+ "1" + newStringValue.substring(i + 1);
				}
			}
		}
	}
		
	newStringValue = this.toControlRange(newStringValue);

    //call manager and do put	
   	this.manager.put(this.readbackHandle,newStringValue);
};

/*
 * Called by setDigitValue() when the user modifies the digits.
 * Sets a new string value.
 */
WheelSwitch.prototype.setStringValue = function(newStringValue)
{
	assert(arguments.length == 1, "WheelSwitch.setStringValue() requires one argument.");
	var oldDigitSelection = this.getSelectedDigit();
	var decimalSelection = this.parseDecimalPosition(oldDigitSelection);	


	//var oldValue = this.formatter.getValue();
	//var oldStringValue = this.formatter.getString();
	
	if (newStringValue == null)
		newStringValue = "---.----------";

	this.formatter.setString(newStringValue);

	var newValue = this.formatter.getValue();
	newStringValue = this.formatter.getString();
		
	//TODO: optimization - implement process
	//this.process(oldStringValue, newStringValue);
	this.setupValueDigits();
	this.setupLayout();	
		
	var newDigitSelection = this.parseDigitPosition(decimalSelection);
    
	if ((newDigitSelection < this.digits.length) && (newDigitSelection >= 0)) {
		this.setSelectedDigit(newDigitSelection);	
	} else {
		this.setSelectedDigit(0);
	}	
};


/*
 * Called by setStringValue(String). Computes the decimal position represented
 * by the digit position
 */
WheelSwitch.prototype.parseDecimalPosition = function(digitPosition)
{
	assert(arguments.length == 1, "WheelSwitch.parseDecimalPosition() requires one argument.");
	if (digitPosition == -1) {
		return Number.MAX_VALUE;
	}

	var digits = this.formatter.getString();
	var decimalPosition = 0;
	var expIndex = digits.indexOf('E');
	var dotIndex = digits.indexOf('.');

	if ((expIndex == -1) || (digitPosition < expIndex)) {
		if (dotIndex != -1) {
			decimalPosition += (dotIndex - digitPosition);
		} else if (expIndex != -1) {
			decimalPosition += (expIndex - digitPosition);
		} else {
			decimalPosition += (digits.length - digitPosition);
		}

		if (decimalPosition > 0) {
			decimalPosition--;
		}

		if (expIndex != -1) {
			var exponent = new Number(digits.substring(expIndex + 1));
			decimalPosition += exponent;
		}
	} else {
		//multiples of hundreds are returned for exponent digits
		decimalPosition = 100 * (digits.length - digitPosition);
	}

	return decimalPosition;
};

/*
 * Called by setStringValue(String) Computes the digit position given the decimal
 * position
 */
WheelSwitch.prototype.parseDigitPosition = function(decimalPosition)
{
	assert(arguments.length == 1, "WheelSwitch.parseDigitPosition() requires one argument.");
	if (decimalPosition == Number.MAX_VALUE) {
		return -1;
	}

	var digits = this.formatter.getString();
	var digitPosition = 0;
	var expIndex = digits.indexOf('E');
	var dotIndex = digits.indexOf('.');

	if (((decimalPosition % 100) == 0) && (decimalPosition != 0)) {
		decimalPosition /= 100;

		if ((expIndex == -1)
		    || ((digits.length - expIndex) < decimalPosition)) {
			return Number.MAX_VALUE;
		}

		digitPosition = digits.length - decimalPosition;

		if ((digits.charAt(digitPosition) == '+')
		    || (digits.charAt(digitPosition) == '-')) {
			return Number.MAX_VALUE;
		}

		return digitPosition;
	}

	if (dotIndex != -1) {
		digitPosition += (dotIndex - decimalPosition);
	} else if (expIndex != -1) {
		digitPosition += (expIndex - decimalPosition - 1);
	} else {
		digitPosition += (digits.length - decimalPosition - 1);
	}

	if (expIndex != -1) {
		var exponent = new Number(digits.substring(expIndex + 1));
		digitPosition += exponent;
	}

	if ((expIndex != -1) && (digitPosition >= expIndex)) {
		return Number.MAX_VALUE;
	} else if (digitPosition >= digits.length) {
		return Number.MAX_VALUE;
	}

	if (digitPosition <= dotIndex) {
		digitPosition--;
	}

	if ((digitPosition < 0)
	    || ((digitPosition == 0)
	    && ((digits.charAt(0) == '+') || (digits.charAt(0) == '-')))) {
		return Number.MAX_VALUE;
	}

	return digitPosition;
};

WheelSwitch.prototype.process = function(oldStringValue,newStringValue)
{
	assert(arguments.length == 2, "WheelSwitch.process() requires two arguments.");
	if ((oldStringValue.length == newStringValue.length)
	    && (oldStringValue.indexOf(".") == newStringValue.indexOf("."))
	    && (oldStringValue.indexOf("E") == newStringValue.indexOf("E"))
	    && (oldStringValue.indexOf("e") == newStringValue.indexOf("e"))
	    && (oldStringValue.indexOf("+") == newStringValue.indexOf("+"))
	    && (oldStringValue.indexOf("-") == newStringValue.indexOf("-"))
	    && (oldStringValue.indexOf("+", oldStringValue.indexOf("E")) == newStringValue
	    .indexOf("+", newStringValue.indexOf("E")))
	    && (oldStringValue.indexOf("+", oldStringValue.indexOf("e")) == newStringValue
	    .indexOf("+", newStringValue.indexOf("e")))
	    && (oldStringValue.indexOf("-", oldStringValue.indexOf("e")) == newStringValue
	    .indexOf("-", newStringValue.indexOf("e")))
	    && (oldStringValue.indexOf("-", oldStringValue.indexOf("E")) == newStringValue
	    .indexOf("-", newStringValue.indexOf("E")))) {
		//TODO : implement this?
		//this.initDigits();
	} else {
		this.setupValueDigits();
		this.setupLayout();
	}
};



/*
* All wheelswitch events are handled here
*/
WheelSwitch.prototype.onSelectedEvent = function(event){	
	if(isRightButton(event))
		return;

	this.textFocus = true;

	// must be current target so that it works also over <p></p> (alternative would be to 
	// add handler also on <p></p>)	
	x=event.currentTarget; 
	
	//get selected digit number from id (last two chars)
	var selectedDigit = x.id.substring(x.id.length-2,x.id.length);
	
	this.setSelectedDigit(new Number(selectedDigit));
	
};

WheelSwitch.prototype.onKeyDownEvent = function(event){
	
	var keyCode = event.keyCode;
	var keyValue = keyCode - 48;
	var source = event.currentTarget; 
	var digitIndex = new Number(source.id.substring(source.id.length - 2));
	
	var keyEffect = false;
	if (keyValue >= 0 && keyValue <= 9) {
    	this.setDigitValue(digitIndex, keyValue);
    	keyEffect = true;
	} else if (keyCode == 38) {
    	this.setDigitValue(digitIndex, this.INCREASE_VALUE);
    	keyEffect = true;
	} else if (keyCode == 40) {
    	this.setDigitValue(digitIndex, this.DECREASE_VALUE);
    	keyEffect = true;
	} else if (keyCode == 39) {
    	this.setSelectedDigit(this.INCREASE_SELECTION);
    	keyEffect = true;
	} else if (keyCode == 37) {
    	this.setSelectedDigit(this.DECREASE_SELECTION);
    	keyEffect = true;
    }
    
    if (keyEffect) {
        event.stopPropagation();
		event.preventDefault();
    }
};

WheelSwitch.prototype.onFocusEvent = function(event) {
	this.textFocus = true;

	var source = event.currentTarget; 
	var digitIndex = new Number(source.id.substring(source.id.length - 2));

	if (digitIndex != this.selectedDigit) {
	    this.setSelectedDigit(digitIndex);
	}
};

WheelSwitch.prototype.onBlurEvent = function(event) {
	this.textFocus = false;
};

WheelSwitch.prototype.onButtonClick = function(event){	
	/*if(isRightButton(event))
		return;
	
	x = YAHOO.util.Event.getTarget(event);
	var i = this.getSelectedDigit(); 
	if(x.id == (this.id + "upButton")){
		this.setDigitValue(i,this.INCREASE_VALUE);
	}
	else if(x.id == (this.id + "downButton")){
		this.setDigitValue(i,this.DECREASE_VALUE);		
	}*/
};

/*WheelSwitch.prototype.onFocus = function(event){	
	//if (this.getSelectedDigit() == -1) {
	//	this.setSelectedDigit(this.formatter.getString().length - 1);
	//}	
	log(this.mouseOver + " " + his.hasFocus)
	if(this.mouseOver && !this.hasFocus){
		this.hasFocus = true;
		log("focusGained");		
	}
}

WheelSwitch.prototype.onBlur = function(event){	
	if(!this.mouseOver && this.hasFocus){
		this.hasFocus = false
		log("focus Lost");		
	}		
	//this.setSelectedDigit(-1);	
}*/

WheelSwitch.prototype.onMouseDown = function(event){	
	if(isRightButton(event))
		return;
	
	x = YAHOO.util.Event.getTarget(event);
	this.clickedId = x.id;
	this.beforeClickClass = x.getAttribute("class"); 
	x.setAttribute("class", this.beforeClickClass + " pressed");
	wheelSwitch = this;
	
	if(this.contCounter > 10)
		this.contCounter = 0;
	this.contCounter++;
	
	if(x.id == (this.id + "upButton")){
		this.changeCounter = 0;
		this.contHashTable.put(this.contCounter,this.contCounter);
		this.increaseValueCont(this,this.contCounter);
	}
	else if(x.id == (this.id + "downButton")){
		this.changeCounter = 0;
		this.contHashTable.put(this.contCounter,this.contCounter);
		this.decreaseValueCont(this,this.contCounter);
	}
};
/*
 * Sets a new Digit selection.
 * @param i new digit selection.
 */
WheelSwitch.prototype.onMouseUp = function(event){	
	if(isRightButton(event))
		return;
	
	x = YAHOO.util.Event.getTarget(event);
	
	if (this.clickedId == x.id)
		x.setAttribute("class", this.beforeClickClass);
	
	if(x.id == (this.id + "upButton")){
		this.contHashTable.remove(this.contCounter);
	}
	else if(x.id == (this.id + "downButton")){
		this.contHashTable.remove(this.contCounter);
	}
};

WheelSwitch.prototype.increaseValueCont = function(wheelSwitch,contCounter){	
	if(wheelSwitch.changeCounter < 3)
		var timeout = 500;
	else
		var timeout = 150;

	if(wheelSwitch.contHashTable.get(contCounter) != null){		
		var i = wheelSwitch.getSelectedDigit(); 		
		wheelSwitch.setDigitValue(i,wheelSwitch.INCREASE_VALUE);
		wheelSwitch.changeCounter++;
		setTimeout(function() { wheelSwitch.increaseValueCont(wheelSwitch,contCounter); }, timeout);
	}	
};

WheelSwitch.prototype.decreaseValueCont = function(wheelSwitch,contCounter){		

	if(wheelSwitch.changeCounter < 3)
		var timeout = 500;
	else
		var timeout = 150;		

	if(wheelSwitch.contHashTable.get(contCounter) != null){	
		var i = wheelSwitch.getSelectedDigit(); 		
		wheelSwitch.setDigitValue(i,wheelSwitch.DECREASE_VALUE);
		wheelSwitch.changeCounter++;
		setTimeout(function() { wheelSwitch.decreaseValueCont(wheelSwitch,contCounter); }, timeout);
	}	
};

/*WheelSwitch.prototype.onMouseOver = function(event){	
	x = YAHOO.util.Event.getTarget(event);
	if(x.id == (this.id + "upButton")){
		this.overUpButton = true;
	}
		
}
*/
WheelSwitch.prototype.onMouseOut = function(event){		
	x = YAHOO.util.Event.getTarget(event);
	
	if (this.clickedId == x.id)
		x.setAttribute("class", this.beforeClickClass);
	
	if(x.id == (this.id + "upButton")){
		this.contHashTable.remove(this.contCounter);
	}
	else if(x.id == (this.id + "downButton")){
		this.contHashTable.remove(this.contCounter);
	}
};

WheelSwitch.prototype.toControlRange = function(valueString) {
    // Memorize current formatter state.
    var oldValueString = this.formatter.getString(); 

	// Use formatter to obtain the string of a clamped value.
	this.formatter.setString(valueString);
	var value = this.formatter.getValue();

	if (this.lowerControlLimit != null) {
		if (value < this.lowerControlLimit) {
			value = this.lowerControlLimit;
		}
	}
	if (this.upperControlLimit != null) {
		if (value > this.upperControlLimit) {
			value = this.upperControlLimit;
		}
	}
	this.formatter.setValue(value);
	valueString = this.formatter.getString();
	
	// Restore formatter state.
	this.formatter.setString(oldValueString);
	
	return valueString;
};
