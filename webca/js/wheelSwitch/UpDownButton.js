/**
 * Class that contains two 
 * <code>ArrowButton</code>s acting as a two-way (up/down) control. 
 * 
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * @version $id$
 */
UpDownButton = function(id,wheelSwitch){
	this.wheelSwitch = wheelSwitch;

    this.baseImageClass = "wheelSwitchButtonImage";

	this.imgUp = document.createElement("img");	
	this.imgUp.setAttribute("src",webCaPath + "js/wheelSwitch/images/up.png");
	this.imgUp.setAttribute("class", this.baseImageClass);
	this.imgUp.setAttribute("style","float: left;");

	this.imgDown = document.createElement("img");	
	this.imgDown.setAttribute("src",webCaPath + "js/wheelSwitch/images/down.png");
	this.imgDown.setAttribute("class", this.baseImageClass);
	this.imgDown.setAttribute("style","float: left;");

	var table = document.createElement("table");
	var trUp = document.createElement("tr");
	trUp.setAttribute("valign","middle");
	table.appendChild(trUp);
	var tdUp = document.createElement("td");
	trUp.appendChild(tdUp);
	tdUp.appendChild(this.imgUp);

	var trDown = document.createElement("tr");
	trDown.setAttribute("valign","middle");
	table.appendChild(trDown);
	var tdDown = document.createElement("td");
	trDown.appendChild(tdDown);
	tdDown.appendChild(this.imgDown);

	this.column = document.createElement("td");
	this.column.setAttribute("align","center");
	this.column.appendChild(table);

	this.column.setAttribute("class","wheelSwitchUpDownButton");
	
	this.upButton = this.imgUp;
	this.upButton.setAttribute("id",id + "upButton");

	this.downButton = this.imgDown;
	this.downButton.setAttribute("id",id + "downButton");

	//add event handlers
	YAHOO.util.Event.addListener(this.upButton, "click", this.handleEvent, this, true); 	
	YAHOO.util.Event.addListener(this.upButton, "mousedown", this.handleEvent, this, true); 	
	YAHOO.util.Event.addListener(this.upButton, "mouseup", this.handleEvent, this, true); 		
	//YAHOO.util.Event.addListener(this.upButton, "mouseover", this.handleEvent, this, true); 
	YAHOO.util.Event.addListener(this.upButton, "mouseout", this.handleEvent, this, true); 				

	//add event handlers
	YAHOO.util.Event.addListener(this.downButton, "click", this.handleEvent, this, true); 
	YAHOO.util.Event.addListener(this.downButton, "mousedown", this.handleEvent, this, true); 	
	YAHOO.util.Event.addListener(this.downButton, "mouseup", this.handleEvent, this, true); 		
	//YAHOO.util.Event.addListener(this.downButton, "mouseover", this.handleEvent, this, true); 
	YAHOO.util.Event.addListener(this.downButton, "mouseout", this.handleEvent, this, true);

	//for focus 
	//YAHOO.util.Event.addListener(this.div1, "mouseover", this.onMouseOver, this, true); 
	//YAHOO.util.Event.addListener(this.div1, "mouseout", this.onMouseOut, this, true); 	
	//YAHOO.util.Event.addListener(this.div2, "mouseover", this.onMouseOver, this, true); 
	//YAHOO.util.Event.addListener(this.div2, "mouseout", this.onMouseOut, this, true); 	
	//YAHOO.util.Event.addListener(this.column, "mouseover", this.onMouseOver, this, true); 
	//YAHOO.util.Event.addListener(this.column, "mouseout", this.onMouseOut, this, true); 	
};
 
 
UpDownButton.prototype.enable = function(event){	
	this.upButton.disabled = false;
	this.imgUp.setAttribute("class", this.baseImageClass);
	
	this.downButton.disabled = false;	
	this.imgDown.setAttribute("class", this.baseImageClass);
};

UpDownButton.prototype.disable = function(event){	
	this.upButton.disabled = true;
	this.imgUp.setAttribute("class", this.baseImageClass + " disabled");
	
	this.downButton.disabled = true;
	this.imgDown.setAttribute("class", this.baseImageClass + " disabled");
};

UpDownButton.prototype.handleEvent = function(event) {

    var sourceId = YAHOO.util.Event.getTarget(event).id; 

	if (sourceId == this.upButton.getAttribute("id")) {
        if (this.upButton.disabled) {
        	return;
        }		
	} else if (sourceId == this.downButton.getAttribute("id")) {
        if (this.downButton.disabled) {
        	return;
        }		
	} else {
		return;
	}

	if (event.type == "click")	{
		this.wheelSwitch.onButtonClick(event);
	} else if (event.type == "mousedown") {
		this.wheelSwitch.onMouseDown(event);
	} else if (event.type == "mouseup") {
		this.wheelSwitch.onMouseUp(event);
	} else if (event.type == "mouseover") {
		//this.wheelSwitch.onMouseOver(event);
	} else if (event.type == "mouseout") {
		this.wheelSwitch.onMouseOut(event);
	}		
};
 
/*UpDownButton.prototype.onMouseOver = function(event){	
	event.stopPropagation();
}

UpDownButton.prototype.onMouseOut = function(event){		
	event.stopPropagation();
} */