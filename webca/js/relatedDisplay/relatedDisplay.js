RelatedDisplay = function(id, manager, type) {		
	//call super class constructor	
	RelatedDisplay.superclass.constructor.call(this, id, manager); 
	
	this.htmlElement = document.getElementById(id);	
};
YAHOO.lang.extend(RelatedDisplay, Component);


RelatedDisplay.prototype.stripMacro = function(macro){
	return macro.substring(2, macro.length - 1);
};

RelatedDisplay.prototype.createLink = function(){	
	//create display link with  macros
	this.link = "?";
	var macroValuePairs;
		
	//if propagation then get active macros from manager	
	if(this.displays[0].macroPropagation){	
		macroValuePairs = this.manager.getActiveMacros();
		
		var i=0;
		for(; i < macroValuePairs.length; i++){
			this.link = this.link + this.stripMacro(macroValuePairs[i].macroName) + "=" + macroValuePairs[i].macroValue + "&";
		}
	}

	//now get macros defined in related display	
	macroValuePairs = this.displays[0].macroValuePairs;
	
	var i = 0;
	for (; i < macroValuePairs.length; i++){
		this.link = this.link + this.stripMacro(macroValuePairs[i].macroName) + "=" + macroValuePairs[i].macroValue + "&";
	}

	this.link = this.link.substring(0,this.link.length - 1);
	
	this.link = this.displays[0].src + this.link;
		
	
};

RelatedDisplay.prototype.createMacroInputs = function(preservedFormElements) {
		
	this.buttons = new Array();
	var macroValuePairs;
	
	//remove all inputs except first one
	if(this.form.hasChildNodes()){
		var x = this.form.childNodes;
		
		for (var i = x.length - 1;i >= preservedFormElements;i--)
  		{
		  this.form.removeChild(x[i]);
		}
	}
		
	//if propagation then get active macros from manager	
	if(this.displays[0].macroPropagation){	
		macroValuePairs = this.manager.getActiveMacros();
		var i = 0;
		//create invisible buttons
		for(; i < macroValuePairs.length; i++){
			this.buttons[i]= document.createElement('input');
			this.buttons[i].setAttribute("type", "hidden");
			this.buttons[i].setAttribute("name", this.stripMacro(macroValuePairs[i].macroName));	
			this.buttons[i].setAttribute("value", macroValuePairs[i].macroValue);	
			this.form.appendChild(this.buttons[i]);		
		}
	}

	//now get macros defined in related display	
	macroValuePairs = this.displays[0].macroValuePairs;
	var buttonsLength = this.buttons.length;
	var i = buttonsLength;
	var j = 0;
	for (; i < (macroValuePairs.length + buttonsLength); i++,j++){
		this.buttons[i]= document.createElement('input');
		this.buttons[i].setAttribute("type", "hidden");
		this.buttons[i].setAttribute("name", this.stripMacro(macroValuePairs[j].macroName));	
		this.buttons[i].setAttribute("value", macroValuePairs[j].macroValue);	
		this.form.appendChild(this.buttons[i]);		
	}
	
};


RelatedDisplay.prototype.hasContextMenu = function() {
	return false;  
};

ImageRelatedDisplay = function(id, manager,src,alt,width,height,displays) {		
	//call super class constructor	
	ImageRelatedDisplay.superclass.constructor.call(this, id, manager); 
	
	
	if(src == null || src == '')
		throw new Error("ImageRelatedDisplay: src parameter null.");
	else
		this.src = src;
		
	//create link and image
	this.a =  document.createElement('a');
	this.htmlElement.appendChild(this.a);	
	
	this.img = document.createElement('img');
	this.a.appendChild(this.img);
	
	this.img.setAttribute("style", "border: none;");
	
	this.img.setAttribute("src", src);
	
	if(alt != null && alt != '')
		this.img.setAttribute("alt", alt);
	
	if(width != null && width != '' )
		this.img.setAttribute("width", width);
		
	if(height != null && height != '')
		this.img.setAttribute("height", height);
		
	
	this.displays = displays;		
	
	//image related display can have only one target display
	if(this.displays.length != 1)
		throw new Error("ImageRelatedDisplay: Illegal number of target displays defined. Can be only one.");
		
	
	if(displays[0].openMode != null){
		this.a.setAttribute("target", displays[0].openMode);		
	}
		
	this.createLink();
	
	YAHOO.util.Event.addListener(this.a, "click", this.onclick, this, true); 
	
};
YAHOO.lang.extend(ImageRelatedDisplay, RelatedDisplay);

ImageRelatedDisplay.prototype.onclick = function(){
	
	this.createLink();
	
};

ImageRelatedDisplay.prototype.createLink = function(){	
	
	ImageRelatedDisplay.superclass.createLink.call(this);
		
	this.a.setAttribute("href", this.link);	
};


ButtonRelatedDisplay = function(id, manager, displays) {		
	//call super class constructor	
	ButtonRelatedDisplay.superclass.constructor.call(this, id, manager); 
	
	//create button	
	this.form = document.createElement('form');
	this.htmlElement.appendChild(this.form);	
		
	
	this.button =  document.createElement('input');
	this.form.appendChild(this.button);
	
	this.button.setAttribute("type", "submit");
	this.form.setAttribute("method", "link");
	
	
	this.displays = displays;		
	
	//button related display can have only one target display
	if(this.displays.length != 1)
		throw new Error("ImageRelatedDisplay: Illegal number of target displays defined. Can be only one.");
		
	if(displays[0].openMode)
		this.form.setAttribute("target", displays[0].openMode);		
		
	this.createLink();
	
	this.button.setAttribute("value", displays[0].name);
	
	this.form.setAttribute("action", displays[0].src);
	
	this.onclick();
	
	YAHOO.util.Event.addListener(this.button, "click", this.onclick, this, true); 	
	
};
YAHOO.lang.extend(ButtonRelatedDisplay, RelatedDisplay);


ButtonRelatedDisplay.prototype.onclick = function(){
    this.createMacroInputs(1);
};

TextRelatedDisplay = function(id, manager, width, height, displays) {		
	//call super class constructor	
	TextRelatedDisplay.superclass.constructor.call(this, id, manager);

	if (width == null || width == "") {
		width = "128px";
	} 
	if (height == null || height == "") {
		height = "64px";
	} 
    if (!this.htmlElement.style.width) {
    	var style = this.htmlElement.getAttribute("style");
        this.htmlElement.setAttribute("style", (style ? style : "") + " width: " + width + ";");
    }
    if (!this.htmlElement.style.height) {
    	var style = this.htmlElement.getAttribute("style");
        this.htmlElement.setAttribute("style", (style ? style : "") + " height: " + height + ";");    	
    }

	this.form = document.createElement('form');
	this.form.setAttribute("method", "link");

	this.displays = displays;		
	
	// text related display can have only one target display
	if (this.displays.length != 1) {
		throw new Error("TextRelatedDisplay: Illegal number of target displays defined. Can be only one.");
	}

	this.div = document.createElement("div");
	this.form.appendChild(this.div);
		
    this.div.setAttribute("class", "button");
    this.div.innerHTML = displays[0].name;
    
	this.input = document.createElement("input");	
    this.input.setAttribute("class", "image");
    this.input.setAttribute("type","image");
	this.input.setAttribute("src",webCaPath + "js/wheelSwitch/images/empty.png");
		
	this.form.appendChild(this.input);	
	this.htmlElement.appendChild(this.form);	

	if(displays[0].openMode) {
		this.form.setAttribute("target", displays[0].openMode);
	}		

	this.createLink();
	this.form.setAttribute("action", displays[0].src);
	
	this.onclick();
	YAHOO.util.Event.addListener(this.input, "click", this.onclick, this, true); 	
};
YAHOO.lang.extend(TextRelatedDisplay, RelatedDisplay);

TextRelatedDisplay.prototype.onclick = function(){
    this.createMacroInputs(2);
};
