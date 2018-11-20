/**
 * Formats the string (number) to be displayed.
 *
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */ 
Formatter = function(newFormatString){
	//call super class constructor	
	Formatter.superclass.constructor.call(this,newFormatString);  	

};
YAHOO.lang.extend(Formatter, AbstractFormatter);



/**
 * Formats the string (number) to be displayed.
 *
 * @param String newValueString string to be formatted
 * 
 */
Formatter.prototype.internalSetString = function(newValueString) {
		var newValue = new Number(newValueString);
		var tempFormatString = this.formatString;		

		// optimization
		if (this.simpleFixedPrecision >= 0)
		{
			this.value = newValue;
			this.valueString = newValue.toFixed(this.simpleFixedPrecision);	
			if (isNaN(this.valueString))
				this.valueString = newValueString;
			return;
		}


		if (this.formatString == null) {
			tempFormatString = this.defaultFormatString;
		}
		
		var newExpIndex = Math.max(newValueString.indexOf("E"),
				newValueString.indexOf("e"));

		if (newExpIndex < 0) {
			newExpIndex = newValueString.length;
		}

		var formatExpIndex = tempFormatString.indexOf("E");

		if (formatExpIndex < 0) {
			formatExpIndex = tempFormatString.length;
		}

		var newDotIndex = Math.max(newValueString.indexOf("."),
				newValueString.indexOf(","));

		if (newDotIndex < 0) {
			newDotIndex = newExpIndex;
		}	

		var formatDotIndex = tempFormatString.indexOf(".");

		if (formatDotIndex < 0) {
			formatDotIndex = formatExpIndex;
		}
		
		var newSignTag = 0;

		if (newValueString.charAt(0) == '+') {
			newSignTag++;
		} else if (newValueString.charAt(0) == '-') {
			newSignTag--;
		}

		var formatSignTag = 0;

		if (tempFormatString.charAt(0) == '+') {
			formatSignTag++;
		}
		
		var formatExpSignTag = 0;

		if (formatExpIndex + 1 < tempFormatString.length
			&& tempFormatString.charAt(formatExpIndex + 1) == '+') {
			formatExpSignTag++;
		}

		var newExpValue = 0;

		if (newExpIndex < newValueString.length - 1) {
			newExpValue += new Number(newValueString.substring(newExpIndex	+ 1));
		}

		//sync the exp value with format
		newExpValue += newDotIndex - formatDotIndex;
		
		if (newSignTag != 0) {
			newExpValue--;
		}

		if (formatSignTag != 0) {
			newExpValue++;
		}		

		//display mantissa as integer
		newValueString = newValueString.substring(0, newDotIndex)
			+ ((newDotIndex < newExpIndex - 1)
			? (newValueString.substring(newDotIndex + 1, newExpIndex)) : (""));
		
		if (newSignTag != 0) {
			newValueString = newValueString.substring(1);
		}
		
		while (newValueString.charAt(0) == '0' && newValueString.length > 1) {
			newValueString = newValueString.substring(1);
			newExpValue--;
		}
		
		if (newValue == 0) {
			if(this.oldExponentValue && (formatExpIndex + formatExpSignTag + 1 < tempFormatString.length))
				newExpValue = this.oldExponentValue;
			else
				newExpValue+=newExpIndex-3;
		}
		
		this.oldExponentValue = newExpValue;
		
		// Ike: Check if eponent over double range
		// TODO: this does not eliminates problem if decimal in whole value over range, even if exp is in range.
		if (newExpValue<-323) {
			newExpValue=-323;
		} else {
			if (newExpValue>308) {
				newExpValue=308;
			}
		}

		//sync mantissa with format
		while (newValueString.length < formatExpIndex - formatSignTag
			- ((formatDotIndex < formatExpIndex) ? (1) : (0))) {
			newValueString += "0";
		}
	
		//if exponent should be displayed
		if (formatExpIndex + formatExpSignTag + 1 < tempFormatString.length) {
			//parse exponent
			var exponent = new String(newExpValue);

			var newExpSignTag = 1;

			if (newExpValue < 0) {
				newExpSignTag = -1;
				exponent = exponent.substring(1);
			}

			//parse mantissa
			newValueString = newValueString.substring(0,
					formatDotIndex - formatSignTag) + "."
				+ newValueString.substring(formatDotIndex - formatSignTag);

			if (newValue != 0) {
				newValueString = newValueString.replace(",", ".");

				if (newValueString.charAt(0) == '+') {
					newValueString = newValueString.substring(1);
				}
			}

			if (newSignTag == -1) {
				newValueString = "-" + newValueString;
			} else if (formatSignTag == 1) {
				newValueString = "+" + newValueString;
			}
			
			//gjansa add
			var valueDotIndex = Math.max(newValueString.indexOf("."),
				newValueString.indexOf(","));	
				
			var newDecimalPart = newValueString.substring(valueDotIndex,newValueString.length);
			var formatDecimalPart = tempFormatString.substring(formatDotIndex + 1,formatExpIndex);
			var formatMantisa = tempFormatString.substring(0,formatExpIndex);
			while (newValueString.length > formatMantisa.length && 
					newDecimalPart.length > formatDecimalPart.length) {
				newValueString = newValueString.substring(0,newValueString.length - 1);
				newDecimalPart = newValueString.substring(valueDotIndex,newValueString.length);

			}			

			var mantissaValue = new Number(newValueString);

			newValueString += "E";

			//add exponent
			if (newExpSignTag == -1) {
				newValueString += "-";
			} else if (formatExpSignTag == 1) {
				newValueString += "+";
			}

			var exponentLength = tempFormatString.length - formatExpIndex
				- formatExpSignTag - 1;

			while (exponent.length < exponentLength) {
				exponent = "0" + exponent;
			}

			newValueString += exponent;

			// ssah: if illegal value, the exponent and its sign is replaced with '-' marks 
			if (isNaN(mantissaValue)) {
				var newValueStringLength = newValueString.length;
			    newValueString = newValueString.substring(0, newValueString.indexOf("E") + 1);
				while (newValueString.length < newValueStringLength) {
				    newValueString += "-";
			    }
			}

		} else {
			//parse mantissa only
			while (newExpValue > 0) {
				newValueString += "0";
				formatDotIndex++;
				newExpValue--;
				
			}
			while (newExpValue < 0) {
				newValueString = "0" + newValueString;
				//gjansa add
				newValueString = newValueString.substring(0,newValueString.length - 1);
				newExpValue++;
			}

			newValueString = newValueString.substring(0,
					formatDotIndex - formatSignTag) + "."
				+ newValueString.substring(formatDotIndex - formatSignTag);

			if (newSignTag == -1) {
				newValueString = "-" + newValueString;
			} else if (formatSignTag == 1) {
				newValueString = "+" + newValueString;
			}
			
			var formatDotIndex = tempFormatString.indexOf(".");

			if (formatDotIndex < 0) {
				formatDotIndex = formatExpIndex;
			}
			
			//gjansa add
			var valueDotIndex = Math.max(newValueString.indexOf("."),
				newValueString.indexOf(","));
						
			
			var newDecimalPart = newValueString.substring(valueDotIndex,newValueString.length);
			var formatDecimalPart = tempFormatString.substring(formatDotIndex,tempFormatString.length);
			while (newValueString.length > tempFormatString.length && 
					newDecimalPart.length > formatDecimalPart.length) {
				newValueString = newValueString.substring(0,newValueString.length - 1);
				newDecimalPart = newValueString.substring(valueDotIndex,newValueString.length);
				

			}
			
		}

		//gjansa add
		var sign = "";
		if (newValueString.charAt(0) == "+" || newValueString.charAt(0) == "-")
		{	
				sign = newValueString.charAt(0);
				newValueString = newValueString.substring(1,newValueString.length);
		}
		
		
		formatDotIndex = tempFormatString.indexOf(".");

		if (formatDotIndex < 0) {
			formatDotIndex = formatExpIndex;
		}		
		
		var i = 0;
		
		while(tempFormatString.charAt(i + (formatSignTag != 0?1:0)) == '#' && newValueString.charAt(0) == '0' && formatDotIndex > 0){
			formatDotIndex--;
			newValueString = newValueString.substring(1,newValueString.length);
			i++;
		}
		
		i = 1;
		
		while(tempFormatString.charAt(tempFormatString.length - i) == '#' && newValueString.charAt(newValueString.length - 1) == '0'){
			newValueString = newValueString.substring(0,newValueString.length - 1);
			i++;
		}	
		
		if(newValueString.charAt(newValueString.length - 1) == ".")
			newValueString = newValueString.substring(0,newValueString.length - 1);
			
		if(sign == "+" || sign == "-"){
			newValueString = sign + newValueString;
		}
		//end of gjansa add						

		
		this.value = newValue;
		this.valueString = newValueString;	
};


/* __oOo__ */

