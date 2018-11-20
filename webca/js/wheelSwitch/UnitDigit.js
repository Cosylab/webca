/**
 * Descedant of <code>Digit</code> displaying static text.
 * Objects of this class also cannot be selected. 
 * 
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */
UnitDigit = function(id,value,wheelSwitch){
	//call super class constructor	
	UnitDigit.superclass.constructor.call(this,id,wheelSwitch);  	
	
	// add some extra width	
	this.placeholder.setAttribute("style", this.placeholder.getAttribute("style") + "margin-left: 0.3em; margin-right: 0.3em;");
	
	this.value = value;
	this.paragraph.innerHTML = value;	
	this.placeholder.innerHTML = value;	
};
YAHOO.lang.extend(UnitDigit, Digit);
/**
* This method has been overriden to disable hook of select event handlers
*/
UnitDigit.prototype.hookEventHandlers = function(newSelected){	
};

/**
* This method has been overriden to disable selection of static digits.
*/
UnitDigit.prototype.setSelected = function(newSelected){};

/**
 * This method has been overriden to disable selection of static digits.
 */
UnitDigit.prototype.isSelected = function(){
	return false;
};

	