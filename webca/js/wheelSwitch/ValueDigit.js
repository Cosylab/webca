/**
 * Descedant of <code>Digit</code> displaying a integer value digit.
 *
 * @author <a href="mailto:jernej.kamenik@cosylab.com">Jernej Kamenik</a>
 * @version $id$
 */
ValueDigit = function(id,value,wheelSwitch){
	//call super class constructor	
	ValueDigit.superclass.constructor.call(this,id,wheelSwitch);  
	
	this.INCREASE_VALUE = -1;
	this.DECREASE_VALUE = -2;
	
	this.value;
	this.oldValue;	
	
	this.setValue(value);
};
YAHOO.lang.extend(ValueDigit, Digit);

/**
 * Sets the value displayed.
 *
 * @param newValue INCREASE_VALUE increases the value,
 * DECREASE_VALUE decreases the value, else the number newValue is set.
 */
ValueDigit.prototype.setValue = function(newValue){
	if (newValue>=0 && newValue<=9) {
		this.oldValue = this.value;
		this.value = newValue;
	} 
	else if (newValue == this.INCREASE_VALUE) {
		if (this.value==9) this.value = 0;
		else this.value++;
	} 
	else if (newValue == this.DECREASE_VALUE) {
		if (this.value == 0) this.value = 9;
		else this.value--;
	} 
	//TODO//else throw new IllegalArgumentException();	
	this.paragraph.innerHTML = this.value;	
};


/**
 * Gets the value displayed.
 *
 * @return int
 */
ValueDigit.prototype.getValue = function(){
	return this.value;
};
	
	
	
	
	
	
	
	
	
	