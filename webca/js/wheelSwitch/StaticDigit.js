/**
 * Descedant of <code>Digit</code> displaying static text.
 * Objects of this class also cannot be selected. 
 * 
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */
StaticDigit = function(id,value,wheelSwitch){
	//call super class constructor	
	StaticDigit.superclass.constructor.call(this,id,wheelSwitch);  
	
	this.value = value;
	this.paragraph.innerHTML = value;	
};
YAHOO.lang.extend(StaticDigit, Digit);

/**
* This method has been overriden to disable selection of static digits.
*/
StaticDigit.prototype.setSelected = function(newSelected){};

/**
 * This method has been overriden to disable selection of static digits.
 */
StaticDigit.prototype.isSelected = function(){
	return false;
};

StaticDigit.prototype.setValue = function(value){
	this.value = value;
	this.paragraph.innerHTML = this.value;	
};
