/**
 * Class representing one digit (character).
 *
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */
Digit = function(id,wheelSwitch){
	// Id is created in wheelSwitch.setupValueDigits and is of format: wheelSwitch.id + "Digit" + number indicating 
	// position of the digit (00,01,...)
	this.id = id;
	this.selected = false;
	this.wheelSwitch = wheelSwitch;

	this.paragraph = document.createElement("div");
	this.paragraph.setAttribute("class","wheelSwitchText");
	
	this.img = document.createElement("img");	
	this.img.setAttribute("src",webCaPath + "js/wheelSwitch/images/bg.png");

	this.input = document.createElement("input");	
    this.input.setAttribute("type","image");
    this.input.setAttribute("id", "input" + id);
	this.input.setAttribute("src",webCaPath + "js/wheelSwitch/images/empty.png");

	this.div = document.createElement("div");	
	this.div.setAttribute("class","box gradwhite");

	this.column = document.createElement("td");	
	this.column.setAttribute("id",id);	

	this.placeholder = document.createElement("div");
	this.placeholder.setAttribute("style", "min-width: 1em; visibility: hidden; position: relative;");
	this.div.appendChild(this.placeholder); 	
	
	this.div.appendChild(this.img);	
	this.div.appendChild(this.paragraph);	
	this.div.appendChild(this.input);
	this.column.appendChild(this.div); 	

	this.hookEventHandlers();
	
	//YAHOO.util.Event.addListener(this.column, "mouseover", this.onMouseOver, this, true); 
	//YAHOO.util.Event.addListener(this.column, "mouseout", this.onMouseOut, this, true); 	
	
	//YAHOO.util.Event.addListener(this.paragraph, "mouseover", this.onMouseOver, this, true); 
	//YAHOO.util.Event.addListener(this.paragraph, "mouseout", this.onMouseOut, this, true); 	
	
	//TODO set css classes on paragraph
};

Digit.prototype.hookEventHandlers = function(newSelected){
	//add event handlers
	YAHOO.util.Event.addListener(this.column, "click", this.wheelSwitch.onSelectedEvent, this.wheelSwitch, true); 
	YAHOO.util.Event.addListener(this.input, "keydown", this.wheelSwitch.onKeyDownEvent, this.wheelSwitch, true); 
	YAHOO.util.Event.addListener(this.input, "focus", this.wheelSwitch.onFocusEvent, this.wheelSwitch, true); 
	YAHOO.util.Event.addListener(this.input, "blur", this.wheelSwitch.onBlurEvent, this.wheelSwitch, true); 
};

Digit.prototype.setFocused = function() {
    this.input.focus();	
};

/**
 * Sets or removes the selection from the <code>Digit</code>.
 *
 * @param newSelected
 */
Digit.prototype.setSelected = function(newSelected){

	if (this.selected == newSelected) {
		return;
	}
	this.selected = newSelected;

	if(newSelected)
		this.column.setAttribute("class","wheelSwitchSelected");
	else
		this.column.setAttribute("class","");
};

/**
 * Checks for selection of the <code>Digit</code>.
 *
 * @return true if the <code>Digit</code> is selected, false otherwise.
 */
Digit.prototype.isSelected = function(){
	return this.selected;
};

Digit.prototype.onMouseOver = function(event){	
	event.stopPropagation();
};

Digit.prototype.onMouseOut = function(event){		
	event.stopPropagation();
};
