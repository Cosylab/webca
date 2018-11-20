BitButton = function(id, bitPosition, bitControl){
	this.id = id;
	this.bitPosition = bitPosition;
	this.selected = false;
	this.bitControl = bitControl;
	this.severityClass = "";

	this.paragraph = document.createElement("div");
	this.paragraph.setAttribute("class","bitControlText");

	this.img = document.createElement("img");	
	this.img.setAttribute("src", webCaPath + "js/bitControl/images/bg.png");
	
	this.div = document.createElement("div");	
	this.div.setAttribute("class","box gradwhite");

	this.column = document.createElement("td");	
	this.column.setAttribute("id",id);	
	this.column.setAttribute("class", this.invalidClass);

	this.placeholder = document.createElement("div");
	this.placeholder.setAttribute("style", "min-width: 1em; visibility: hidden; position: relative;");
	this.div.appendChild(this.placeholder); 	
	
	this.div.appendChild(this.img); 	
	this.div.appendChild(this.paragraph); 	
	this.column.appendChild(this.div); 	

	YAHOO.util.Event.addListener(this.column, "click", this.onClick, this, true);
};


BitButton.prototype.onClick = function(event) {
	
	if (isRightButton(event)) {
		return;
	}
	this.bitControl.onBitButtonStateChange(this.bitPosition);
};

BitButton.prototype.setState = function(selected, connected, severityClass){
	
	if (this.selected == selected && this.severityClass == severityClass) {
		return;
	}
	this.selected = selected;
	this.severityClass = severityClass;
	this.column.setAttribute("class", this.severityClass + (selected || !connected ? " bitButtonSelected alarmBg" : ""));
};

BitButton.prototype.isSelected = function() {
	return this.selected;
};
