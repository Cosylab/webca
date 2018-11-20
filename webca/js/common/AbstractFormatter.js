/**
 * 
 * Abstract forrmater. Sets default format if none given in costructor.
 *
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */
AbstractFormatter = function(newFormatString)
{

	this.formatString = null;
	this.defaultFormatString = new String("+0.00");
	this.valueString = "0.00";
	this.value = 0.;
	this.simpleFixedPrecision = -1;
	
	this.setFormat(newFormatString);
};
	
	

/**
 * Sets the format string specifiing the format of <code>Wheelswitch</code>
 * display. The format is first checked for validity by the
 * <code>checkFormat(String)</code> method.
 *
 * @param newFormatString
 *
 * @throws IllegalArgumentException DOCUMENT ME!
 *
 */
AbstractFormatter.prototype.setFormat = function(newFormatString)
{
	if (newFormatString == this.formatString) {
		return;
	} else if (newFormatString == null || newFormatString == "") {
		this.formatString = null;
	} else if (this.checkFormat(newFormatString)) {
		this.formatString = newFormatString;
	} else {
		//throw new Error("IllegalArgumentException: Invalid format string entered.");
		this.formatString = this.defaultFormatString;
	}

	this.setString(new String(this.value));
};

/**
 * Sets the format string from precision obtained from PV's PREC field
 *
 * @param Number precision from PV
 *
 */
AbstractFormatter.prototype.setFormatFromPV = function(precision){
	if (precision < 0)
		precision = -1;

//	var format = "+0"
	var format = "0";
	if(precision != 0){
		format += ".";
		for(var i = 0; i < precision ; i++)
			format += "0";
	}
	this.setFormat(format);	

	this.simpleFixedPrecision = precision;
};

/**
 * Gets the currently stored format string.
 *
 * @return DOCUMENT ME!
 */
AbstractFormatter.prototype.getFormat = function()
{
	return this.formatString;
};


/**
 * DOCUMENT ME!
 *
 * @param newValueString String representing the number to be formatted.  It only accepts values
 * within bounds (maximum and minimum).
 */
AbstractFormatter.prototype.setString = function(newValueString)
{
	this.internalSetString(newValueString);
};

/*
 * Sets value and valueString when newValueString is set.
 */
AbstractFormatter.prototype.internalSetString = function(newValueString){
	//Abstract method - must be implemented by subclasses
};

	
/**
 * Gets the formatted string representing the currently stored value.
 *
 * @return String
 */
AbstractFormatter.prototype.getString = function()
{
	return this.valueString;

};

/**
 * Sets a new value and stores its formatted string. It accepts any value.
 *
 * @param newValue DOCUMENT ME!
 *
 */
AbstractFormatter.prototype.setValue = function(newValue)
{
	var strValue = new String(newValue);
	
	if(strValue.charAt(0) != '-' && strValue.charAt(0) != '+')
			strValue = '+' + strValue;
	
	this.internalSetString(strValue);
};
	


	
/**
 * Gets the currently stored value.
 *
 * @return double
 */
AbstractFormatter.prototype.getValue = function()
{
	return this.value;
};

/**
 * Checks the number format string. The format string should only  consist
 * of characters '#' reperesenting a single number digit, '+' representing
 * a sign digit, '.' representing the decimal symbol  digit and 'E'
 * representing the exponent denominator. These  characters should be
 * arranged in such way that substitution of  the characters '#' with any
 * numerical digits would result in a  correct double expression
 * acceptible by <code>Double.parseDouble()</code>.
 *
 * @param format
 *
 * @return true if a correct format string was entered, false otherwise.
 */
AbstractFormatter.prototype.checkFormat = function(format)
{
	var dotted = false;
	var edotted = false;

	for (var i = 0; i < format.length; i++) {
		if (format.charAt(i) != '0' && format.charAt(i) != '#' && format.charAt(i) != '.'
		    && format.charAt(i) != 'E' && format.charAt(i) != '+') {
			return false;
		}

		if (format.charAt(i) == '.') {
			if (dotted) {
				return false;
			} else {
				dotted = true;
			}
		}

		if (format.charAt(i) == 'E') {
			if (edotted) {
				return false;
			} else {
				dotted = edotted = true;
			}

			if (i == format.length - 1) {
				return false;
			}
		}
		
		if (format.charAt(i) == '#') {
			for (var j = 0; j < format.length; j++) {
				if(format.charAt(j) == 'E' )
					return false;
			}
		}

		if (format.charAt(i) == '+') {
			if (i != 0 && format.charAt(i - 1) != 'E') {
				return false;
			}

			if (i == format.length - 1) {
				return false;
			}

			if (format.charAt(i + 1) == 'E') {
				return false;
			}
		}
	}

	return true;
};


/* __oOo__ */
