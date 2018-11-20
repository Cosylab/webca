
Slider = function(controlName,readbackName,id, manager,alarmSensitive,increment,displayFormat,minValue,maxValue, readOnly){	
	//used to display reaback PV if different from control PV
	if((controlName != readbackName) && readbackName != null)
		this.readback = true;
	else
		this.readback = false;	
	
	if(readbackName == null){
		readbackName = controlName;
	}		
	//call super class constructor	
	Slider.superclass.constructor.call(this, controlName,readbackName,id, manager,alarmSensitive, readOnly); 
	
	if(minValue != null && maxValue != null && typeof(minValue) == "number" && typeof(maxValue) == "number"){
		this.limitsFromPV = false;
		this.maxValue = maxValue;
		this.minValue = minValue;
	}
	else
		this.limitsFromPV = true;
	
	//slider increment
	if(increment != null && typeof(increment) == "number")
		this.increment = increment;
	else
		this.increment = 0.1;
	
	//always numeric	
	this.isNumeric = true;	
	
	if (this.isNumeric) {	
		if (displayFormat == null || displayFormat == "")
			this.precisionFromPV = true;
		else
		{
			this.precisionFromPV = false;		
			this.formatter = new Formatter(displayFormat);						
		}
	}

	//html object
	this.htmlElement = document.getElementById(id);
	
	this.currentClass = this.invalidClass;
	
	this.value = 0;
	this.oldValue = 0;

	this.createSlider();	


	//call register	
	this.controlHandle = this.manager.register(this.controlName,this);	
	if(this.readback)
		this.readbackHandle = this.manager.register(this.readbackName,this);
		
	// repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.repaint, this, true); 	
	

	this.enabled = true;
	this.disable();
	this.setClass(this.currentClass);
    if (this.readback) {
		this.setReadbackClass(this.currentClass);
    }
};
YAHOO.lang.extend(Slider, Control);

//routines definition
Slider.prototype.reregister = function(handle){
	assert(arguments.length == 1, "Slider.reregister() requires one argument.");
	if(this.readbackHandle == handle)
		Slider.superclass.reregister.call(this, this.readbackHandle); 
	else
		this.controlHandle = this.manager.register(this.controlName,this);
};
	
Slider.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "Slider.preInitialize() requires two arguments.");	
	if(this.readbackHandle == handle){
		Slider.superclass.preInitialize.call(this,this.readbackHandle,resolvedName); 		
	}
	else{
		this.resolvedControlName = resolvedName;
		this.manager.connect(this.controlHandle,resolvedName);			
	}
};

Slider.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "Slider.initialize() requires one argument.");	
	if(this.controlHandle == handle) //do ctrlGet only on control PV 
		Slider.superclass.initialize.call(this, this.controlHandle); 
};

Slider.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "Slider.notifyConnectionStatus() requires two arguments.");	
	Slider.superclass.notifyConnectionStatus.call(this, handle,connected); 
	// do monitor on readback 
	if(this.readbackHandle == handle){
		if(connected){
			if(this.monitorHandle == null) this.monitorHandle = this.manager.createMonitor(handle,this); 
			this.setReadbackClass(this.cssClass);
			
		}
		else
			this.setReadbackClass(this.invalidClass);
	}
	else{
    	if (connected) {
		    this.createWritableMonitor(handle);
	    }
		this.setClass(connected ? this.cssClass : this.invalidClass);
		
		if (connected && this.writable) {
			this.enable();
		} else {
			this.disable();
		}
	}	
};
		
Slider.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "Slider.cleanup() requires one argument.");	
	if(this.readbackHandle == handle){
		Slider.superclass.cleanup.call(this,this.readbackHandle); 
		this.readbackText.data = "-";
		this.setReadbackClass(this.invalidClass);
		
	}
	else{
    	this.destroyWritableMonitor(handle);
		this.manager.destroyMonitor(this.controlMonitorHandle);
		this.controlMonitorHandle = null;
		this.manager.disconnect(this.controlHandle);
		this.manager.unregister(this.controlHandle);	
		this.controlReadbackText.data = "-";
		this.htmlElement.setAttribute("class",this.invalidClass);

		this.setClass(this.invalidClass);	
		this.disable();
	}
};	

Slider.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "Slider.notifyGetCtrl() requires two arguments.");
	Slider.superclass.notifyGetCtrl.call(this,handle,ctrlData); 
	
	this.setCtrlData();
	if (!this.ctrlData.isArray && this.ctrlData.isNumeric){
		if(!this.controlMonitorHandle)
			this.controlMonitorHandle = this.manager.createMonitor(handle,this); 
	} else {
		this.setClass(this.invalidClass);	
		this.disable();
	}	
};

Slider.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "Slider.notifyMonitor() requires five arguments.");
	if(this.controlHandle == handle){  // main alarm colors are dictated by control PV

	    this.setAlarm(severity);
	    // If readback present, use it instead for clipboard value/history. 
	    if (!this.readback) {
        	this.storeHistoryEntry(value, timestamp, status, severity);
	    }
		this.value = value;
		
		this.setValue(value);		
			
		var displayAsNumeric = (this.isNumeric && this.ctrlData.isNumeric);	
		if(displayAsNumeric)
			this.controlReadbackText.data = this.getFormattedValue(value, this.precisionFromPV, this.formatter)	+  " " + this.ctrlData.getUnits();				
		else
			this.controlReadbackText.data = this.getFormattedValue(value, this.precisionFromPV, this.formatter);

		
		if(this.alarmSensitive){			
			if(severity == 0)
				this.setClass(this.cssClass);
			if(severity == 1)
				this.setClass(this.minorClass);			
			if(severity == 2)
				this.setClass(this.majorClass);
			if(severity == 3)
				this.setClass(this.invalidClass);			
		}			
	}
	else if (this.readback){
		if(this.ctrlData) // if control PV not connected there is no ctrlData!!		
			this.readbackText.data = this.getFormattedValue(value, this.precisionFromPV, this.formatter)					
		else
			this.readbackText.data = value;

    	this.storeHistoryEntry(value, timestamp, status, severity);
	
		if(this.alarmSensitive){
			if(severity == 0)
				this.setReadbackClass(this.cssClass);
			if(severity == 1)
				this.setReadbackClass(this.minorClass);
			if(severity == 2)
				this.setReadbackClass(this.majorClass);
			if(severity == 3)
				this.setReadbackClass(this.invalidClass);
		}					
	}
};

Slider.prototype.notifyWritableStatus = function(handle, writable) {
	assert(arguments.length == 2, "Slider.notifyWritableStatus() requires two arguments.");
	Slider.superclass.notifyWritableStatus.call(this, handle, writable);

    if (this.connected && this.writable) {
 		this.enable();			
    } else { 
        this.disable();
    }	 
};

/*
 * Overrided method from Monitor object. Slider does ctrl get on controlPV
 * 
 * @return {String} resolved control PV name
 * 
 */
Slider.prototype.getResolvedCTRLName = function(){
	return this.resolvedControlName;
};


Slider.prototype.put = function(){
//	var value = new String(this.value);		
	this.manager.put(this.controlHandle,this.value);		
};

Slider.prototype.setCtrlData = function(){
	//set ctrl data 
	if(this.limitsFromPV){
		if(this.ctrlData.getLowerDisplayLimit() != null)
				this.value1 = this.ctrlData.getLowerDisplayLimit();
		if(this.ctrlData.getUpperDisplayLimit() != null)
				this.value2 = this.ctrlData.getUpperDisplayLimit();
	}
	else{
		this.value1 = this.minValue;
		this.value2 = this.maxValue;		
	}
			
	this.minReadbackText.data = this.getFormattedValue(this.value1, this.precisionFromPV, this.formatter)		
	this.maxReadbackText.data = this.getFormattedValue(this.value2, this.precisionFromPV, this.formatter)		
	
	var middleValue = (Math.abs(this.value2) - Math.abs(this.value1))/2;
	middleValue = (this.value1 * this.value2 < 0 )? (this.value1 > this.value2 ? (middleValue * -1): middleValue) : middleValue + this.value1;
	this.middleReadbackText.data = this.getFormattedValue(middleValue, this.precisionFromPV, this.formatter)				
};

//remove all slider GUI elements
Slider.prototype.removeSlider = function() {
	this.svg.removeChild(this.sliderSymbol);
	this.svg.removeChild(this.blackVisSliderLine);
	this.svg.removeChild(this.whiteVisSliderLine);	
	this.svg.removeChild(this.invisSliderLine);
	this.svg.removeChild(this.background);
	this.svg.removeChild(this.ticks);
	this.svg.removeChild(this.controlReadbackArea);	
	this.svg.removeChild(this.minReadbackArea);		
	this.svg.removeChild(this.maxReadbackArea);			
	this.svg.removeChild(this.middleReadbackArea);		
	if(this.readback){
		this.svg.removeChild(this.readbackArea);	
	}	
	this.svg.removeChild(this.sliderSymbPureDefs);	
	this.htmlElement.removeChild(this.svg);		
};

Slider.prototype.repaint = function(){
	var rectHight = 26;
	
	this.x2 = this.htmlElement.clientWidth - this.thumbWidth/2; //the end point x of the slider move area
	
	this.length = toPolarDist((this.x2 - this.x1),(this.y2 - this.y1));
	this.direction = toPolarDir((this.x2 - this.x1),(this.y2 - this.y1));	
	
	//draw normal line for first vertex
	this.ax = this.x2 - this.x1;
	this.ay = this.y2 - this.y1;
	//normal vector 1
	this.px1 = parseFloat(this.x1) + this.ay * -1;
	this.py1 = parseFloat(this.y1) + this.ax;
	//normal vector 2
	this.px2 = parseFloat(this.x2) + this.ay * -1;
	this.py2 = parseFloat(this.y2) + this.ax;	
	
	
	//var viewBox ="0 0 " + (this.x2 + this.thumbWidth) + " " + this.sliderHeight;	
	//this.svg.setAttributeNS(null,"viewBox",viewBox); 	
		
	//rectangle - background
	this.background.setAttributeNS(null,"width",this.x2 + this.thumbWidth/2);		
	
	//ticks
	var sliderWidth = this.x2 - this.x1;
	var tick = sliderWidth/10;
	
	var paramD = "M";
	for (var i = 0; i < 10 ; i++){
		paramD = paramD + (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 23)  + " " +  (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 17) + " " + " M"; 
	}
	paramD = paramD + (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 23) + " " +  (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 17);
	
	this.ticks.setAttributeNS(null,"d",paramD);


	//invisible line
	this.invisSliderLine.setAttributeNS(null,"x2",this.x2);
	
	//black line
	this.blackVisSliderLine.setAttributeNS(null,"x2",this.x2);
	
	//white line
	this.whiteVisSliderLine.setAttributeNS(null,"x2",this.x2);
	
	//readback number
	if(this.readback)
		this.readbackArea.setAttributeNS(null,"x",this.x2/4);
	
	//control readback number
	if(this.readback)
		this.controlReadbackArea.setAttributeNS(null,"x",3 * (this.x2/4));
	else
		this.controlReadbackArea.setAttributeNS(null,"x",this.x2/2);
	
	//min readback number
	this.minReadbackArea.setAttributeNS(null,"x",this.x1);
	
	//max readback number
	this.maxReadbackArea.setAttributeNS(null,"x",this.x2);
	
	//middle readback number
	this.middleReadbackArea.setAttributeNS(null,"x",(this.x2)/2);
	

	var StartDistance = this.length - ((this.value2 - this.value) / (this.value2 - this.value1)) * this.length;
	this.thumbPosition.x  = this.x1 + toRectX(this.direction,StartDistance);
	this.thumbPosition.y = this.y1 + toRectY(this.direction,StartDistance);
	this.setThumb(this.thumbPosition.x,this.thumbPosition.y);

	//set classes - safari render problem on resize
	this.setClass(this.currentClass);
	if (this.readback)
		this.setReadbackClass(this.currentClass);
};


Slider.prototype.createSlider = function(){
	//set default values
	this.sliderHeight = 75; // default height of slider		
	this.thumbWidth = 14; // width of the thumb	
	this.x1 = 0 + this.thumbWidth/2; //the start point x of the slider move area
	this.y1 = this.sliderHeight/2; //the start point y of the slider
	this.value1 = 0; //the value at the start point, min slider value - lower display limit from PV
	this.x2 = this.htmlElement.clientWidth - this.thumbWidth/2; //the end point x of the slider move area
	this.y2 = this.sliderHeight/2; //the end point y of the slider
	this.value2 = 100; //the value at the end point, max slider value - upper display limit from PV
		
	this.length = toPolarDist((this.x2 - this.x1),(this.y2 - this.y1));
	this.direction = toPolarDir((this.x2 - this.x1),(this.y2 - this.y1));
	
	this.slideStatus = 0;
	this.mouseOverThumb = false;	
	//used for offset from center of thumb to mouse coordinates
	this.deltaThumb;
	//position of center of thumb
	this.thumbPosition = new Array;
	this.oldThumbPosition = new Array;
	
	//draw normal line for first vertex
	this.ax = this.x2 - this.x1;
	this.ay = this.y2 - this.y1;
	//normal vector 1
	this.px1 = parseFloat(this.x1) + this.ay * -1;
	this.py1 = parseFloat(this.y1) + this.ax;
	//normal vector 2
	this.px2 = parseFloat(this.x2) + this.ay * -1;
	this.py2 = parseFloat(this.y2) + this.ax;			
	
	//slider GUI elements	
	//this.svg =null;
	this.background = null;	
	this.invisSliderLine = null;	
	this.ticks = null;	
	this.blackVisSliderLine = null;	
	this.whiteVisSliderLine = null;
	this.controlReadbackArea = null;
	this.maxReadbackArea = null;
	this.minReadbackArea = null;		
	this.middleReadbackArea = null;	
	this.sliderSymbol = null;
	this.sliderSymbPureDefs = null;
	
	this.svg = document.createElementNS(svgNS,"svg");
	this.svg.setAttributeNS(null,"height",this.sliderHeight + "px"); 
	
	//var viewBox ="0 0 " + (this.x2 + this.thumbWidth) + " " + this.sliderHeight;	
	//this.svg.setAttributeNS(null,"viewBox",viewBox); 
	
	//this.svg.setAttributeNS(null,"preserveAspectRatio","none"); 
	this.htmlElement.appendChild(this.svg);
	
	var rectHight = 26;
		
	//rectangle - background
	this.background = document.createElementNS(svgNS,"rect");
	this.background.setAttributeNS(null,"x",0);
	this.background.setAttributeNS(null,"y",this.y1 - 3);
	this.background.setAttributeNS(null,"width",this.x2 + this.thumbWidth/2);		
	this.background.setAttributeNS(null,"height",rectHight);	
	this.background.setAttributeNS(null,"class",this.invalidClass + " background");						
	this.svg.appendChild(this.background);	
	
	//ticks
	var sliderWidth = this.x2 - this.x1;
	var tick = sliderWidth/10;
	
	this.ticks = document.createElementNS(svgNS,"path");
	this.ticks.setAttributeNS(null,"class",this.cssClass + " ticks");						

	var paramD = "M";
	for (var i = 0; i < 10 ; i++){
		paramD = paramD + (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 23)  + " " +  (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 17) + " " + " M"; 
	}
	paramD = paramD + (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 23) + " " +  (this.thumbWidth/2 + tick * i) + "," + (this.y1 + 17);
	
	this.ticks.setAttributeNS(null,"d",paramD);
	this.svg.appendChild(this.ticks);

	//invisible line
	this.invisSliderLine = document.createElementNS(svgNS,"line");
	this.invisSliderLine.setAttributeNS(null,"x1",this.x1);
	this.invisSliderLine.setAttributeNS(null,"y1",this.y1 - 3 + rectHight/2);
	this.invisSliderLine.setAttributeNS(null,"x2",this.x2);
	this.invisSliderLine.setAttributeNS(null,"y2",this.y2 - 3 + rectHight/2);
	this.invisSliderLine.setAttributeNS(null,"stroke","black");
	this.invisSliderLine.setAttributeNS(null,"stroke-width", rectHight);
	this.invisSliderLine.setAttributeNS(null,"stroke-opacity","0");
	this.invisSliderLine.setAttributeNS(null,"fill-opacity","0");
	this.invisSliderLine.setAttributeNS(null,"stroke-linecap","square");
	//YAHOO.util.Event.addListener(this.invisSliderLine, "mousedown", this.handleEvent, this, true); 	
	//YAHOO.util.Event.addListener(this.invisSliderLine, "click", this.handleEven, this, true); 		
	this.invisSliderLine.addEventListener("mousedown",this,false);		
	this.invisSliderLine.addEventListener("click",this,false);		
	this.svg.appendChild(this.invisSliderLine);
	
	//black line
	this.blackVisSliderLine = document.createElementNS(svgNS,"line");
	this.blackVisSliderLine.setAttributeNS(null,"x1",this.x1);
	this.blackVisSliderLine.setAttributeNS(null,"y1",this.y1 + 5);
	this.blackVisSliderLine.setAttributeNS(null,"x2",this.x2);
	this.blackVisSliderLine.setAttributeNS(null,"y2",this.y2 + 5);		
	this.blackVisSliderLine.setAttributeNS(null,"pointer-events","none");		
	this.blackVisSliderLine.setAttributeNS(null,"class",this.invalidClass + " blackLine");			
	this.svg.appendChild(this.blackVisSliderLine);		
	
	//white line
	this.whiteVisSliderLine = document.createElementNS(svgNS,"line");
	this.whiteVisSliderLine.setAttributeNS(null,"x1",this.x1);
	this.whiteVisSliderLine.setAttributeNS(null,"y1",this.y1 + 6);
	this.whiteVisSliderLine.setAttributeNS(null,"x2",this.x2);
	this.whiteVisSliderLine.setAttributeNS(null,"y2",this.y2 + 6);
	this.whiteVisSliderLine.setAttributeNS(null,"pointer-events","none");		
	this.whiteVisSliderLine.setAttributeNS(null,"class",this.invalidClass + " whiteLine");							
	this.svg.appendChild(this.whiteVisSliderLine);			
	
	//readback number
	if(this.readback){
			
		this.readbackArea = document.createElementNS(svgNS,"text");
		this.readbackArea.setAttributeNS(null,"x",this.x2/4);
		this.readbackArea.setAttributeNS(null,"y",this.y1 - 8);
		this.readbackArea.setAttributeNS(null,"text-anchor","middle");		
		//this.readbackArea.setAttributeNS(null,"font-size","10");		
		this.readbackArea.setAttributeNS(null,"class",this.invalidClass + " text");									
		this.readbackText = document.createTextNode("-");
      	this.readbackArea.appendChild(this.readbackText);		
		this.svg.appendChild(this.readbackArea);					
			
	}
	
	//control readback number
	this.controlReadbackArea = document.createElementNS(svgNS,"text");
	if(this.readback)
		this.controlReadbackArea.setAttributeNS(null,"x",3 * (this.x2/4));
	else
		this.controlReadbackArea.setAttributeNS(null,"x",this.x2/2);
	this.controlReadbackArea.setAttributeNS(null,"y",this.y1 - 8);
	this.controlReadbackArea.setAttributeNS(null,"text-anchor","middle");		
	//this.controlReadbackArea.setAttributeNS(null,"font-size","10");		
	this.controlReadbackArea.setAttributeNS(null,"class",this.invalidClass + " text");									
	this.controlReadbackText = document.createTextNode("-");
  	this.controlReadbackArea.appendChild(this.controlReadbackText);		
	this.svg.appendChild(this.controlReadbackArea);			
	
	//min readback number
	this.minReadbackArea = document.createElementNS(svgNS,"text");
	this.minReadbackArea.setAttributeNS(null,"x",this.x1);
	this.minReadbackArea.setAttributeNS(null,"y",this.y1 + 37);
	this.minReadbackArea.setAttributeNS(null,"text-anchor","start");		
	//this.minReadbackArea.setAttributeNS(null,"font-size","8");	
	this.minReadbackArea.setAttributeNS(null,"class",this.invalidClass + " text");				
	this.minReadbackText = document.createTextNode("-");
  	this.minReadbackArea.appendChild(this.minReadbackText);		
	this.svg.appendChild(this.minReadbackArea);			
	
	//max readback number
	this.maxReadbackArea = document.createElementNS(svgNS,"text");
	this.maxReadbackArea.setAttributeNS(null,"x",this.x2);
	this.maxReadbackArea.setAttributeNS(null,"y",this.y1 + 37);
	this.maxReadbackArea.setAttributeNS(null,"text-anchor","end");		
	//this.maxReadbackArea.setAttributeNS(null,"font-size","8");		
	this.maxReadbackArea.setAttributeNS(null,"class",this.invalidClass + " text");	
	this.maxReadbackText = document.createTextNode("-");
  	this.maxReadbackArea.appendChild(this.maxReadbackText);		
	this.svg.appendChild(this.maxReadbackArea);	
	
	//middle readback number
	this.middleReadbackArea = document.createElementNS(svgNS,"text");
	this.middleReadbackArea.setAttributeNS(null,"x",(this.x2)/2);
	this.middleReadbackArea.setAttributeNS(null,"y",this.y1 + 37);
	this.middleReadbackArea.setAttributeNS(null,"text-anchor","middle");		
	//this.middleReadbackArea.setAttributeNS(null,"font-size","8");
	this.middleReadbackArea.setAttributeNS(null,"class","text");
	this.middleReadbackArea.setAttributeNS(null,"class",this.invalidClass + " text");			
	this.middleReadbackText = document.createTextNode("-");
  	this.middleReadbackArea.appendChild(this.middleReadbackText);		
	this.svg.appendChild(this.middleReadbackArea);	
	
	this.sliderSymbPureDefs = document.createElementNS(svgNS,"defs");		

    /* A separate slider thumb of appropriate class is created for every alarm state, and the
     * slider symbol switches between them accordingly.
     * This is a workaround to bug in Safari 3.1.2 (525.21), which crashes on accessing class
     * property under slider thumb.
     */
    this.createSliderThumb(this.invalidClass);
    this.createSliderThumb(this.cssClass);
    this.createSliderThumb(this.majorClass);
    this.createSliderThumb(this.minorClass);

	this.svg.appendChild(this.sliderSymbPureDefs);
		
	//slider thumb
	this.sliderSymbol = document.createElementNS(svgNS,"use");
	this.sliderSymbol.setAttributeNS(null,"class",this.cssClass);	
	this.sliderSymbol.setAttributeNS(xlinkNS,"xlink:href","#"+"sliderSymbol" + this.id);
	var StartDistance = this.length - ((this.value2) / (this.value2 - this.value1)) * this.length;
	this.thumbPosition.x  = this.x1 + toRectX(this.direction,StartDistance);
	this.thumbPosition.y = this.y1 + toRectY(this.direction,StartDistance);
	this.setThumb(this.thumbPosition.x,this.thumbPosition.y);
	//YAHOO.util.Event.addListener(this.sliderSymbol, "mouseover", this.handleEvent, this, true); 	
	//YAHOO.util.Event.addListener(this.sliderSymbol, "mouseout", this.handleEvent, this, true); 	
	//YAHOO.util.Event.addListener(this.sliderSymbol, "mousedown", this.handleEvent, this, true); 	
	this.sliderSymbol.addEventListener("mouseover",this,false);
	this.sliderSymbol.addEventListener("mouseout",this,false);		
	this.sliderSymbol.addEventListener("mousedown",this,false);			
	this.svg.appendChild(this.sliderSymbol);		
};

Slider.prototype.createSliderThumb = function(cssClass) {
	
	//slider thumb symbol					
	var sliderSymbPure = document.createElementNS(svgNS,"symbol");
	
	sliderSymbPure.setAttributeNS(null,"id","sliderSymbol" + cssClass + this.id);
	sliderSymbPure.setAttributeNS(null,"overflow","visible");
	
	var sliderSymbPath1 = document.createElementNS(svgNS,"path");
	sliderSymbPath1.setAttributeNS(null, "class", cssClass + " thumbMain");
	sliderSymbPath1.setAttributeNS(null, "d","M-7,1 -7,10 0,17 7,10 7,1 Z");
	sliderSymbPure.appendChild(sliderSymbPath1);
	
	var sliderSymbPath2 = document.createElementNS(svgNS,"path");
	sliderSymbPath2.setAttributeNS(null,"class","slider thumbUpperLine");
	sliderSymbPath2.setAttributeNS(null,"d","M-7,10 -7,1 7,1");
	sliderSymbPure.appendChild(sliderSymbPath2);			
	sliderSymbPath3 = document.createElementNS(svgNS,"path");
	sliderSymbPath3.setAttributeNS(null,"class","slider thumbLowerLine");
	sliderSymbPath3.setAttributeNS(null,"d","M0,17 7,10 7,1");
	sliderSymbPure.appendChild(sliderSymbPath3);			
	
	this.sliderSymbPureDefs.appendChild(sliderSymbPure);
};

//handle events
Slider.prototype.handleEvent = function(evt) {
	if(isRightButton(evt)) // ignore if right mouse button pressed
		return;
	
	if(evt.type == "mouseover")	{ //this is used for slider thumb
		this.mouseOverThumb = true;
	}		
	if(evt.type == "mouseout")	{ //this is used for slider thumb
		this.mouseOverThumb = false;
	}			
	if ((evt.type == "mousedown" && this.mouseOverThumb)) {
		//get coordinate in slider coordinate system
		var coordPoint = this.calcCoord(evt,this.invisSliderLine);


		this.slideStatus = 1;
			
		//YAHOO.util.Event.addListener(document, "mousemove", this.handleEvent, this, true); 		
		//YAHOO.util.Event.addListener(document, "mouseup", this.handleEvent, this, true); 	
		document.documentElement.addEventListener("mousemove",this,false);
		document.documentElement.addEventListener("mouseup",this,false);		
	
		
		//used to get offset of mouse from center of thumb
		this.deltaThumb = this.oldThumbPosition.x - coordPoint.x;
	}
	if(evt.type == "mousemove" && this.slideStatus == 1){
		//get coordinate in slider coordinate system
		var coordPoint = this.calcCoord(evt,this.invisSliderLine);
		coordPoint.x = coordPoint.x + this.deltaThumb;
		
		if (leftOfTest(coordPoint.x,coordPoint.y,this.x1,this.y1,this.px1,this.py1) == 0 && leftOfTest(coordPoint.x,coordPoint.y,this.x2,this.y2,this.px2,this.py2) == 1) {		
			NewPos = intersect2lines(this.x1,this.y1,this.x2,this.y2,coordPoint.x,coordPoint.y,coordPoint.x  + this.ay * -1,coordPoint.y + this.ax);
			this.thumbPosition.x = NewPos['x'];		
			this.thumbPosition.y = NewPos['y'];				
			var Percentage = toPolarDist(this.thumbPosition.x - this.x1,this.thumbPosition.y - this.y1) / this.length;
			this.value = this.value1 + Percentage * (this.value2 - this.value1);
		}
		else {			
			this.checkLimits(coordPoint.x,coordPoint.y);					
		}
		
		this.manager.put(this.controlHandle,this.value);	
		
		this.setThumb(this.thumbPosition.x,this.thumbPosition.y);
		
		
	}
	if (evt.type == "mouseup" && (evt.detail == 1 || evt.detail == 0)) {
		if (this.slideStatus == 1) {
			//YAHOO.util.Event.removeListener(document, "mousemove", this.handleEvent, this, true); 		
			//YAHOO.util.Event.removeListener(document, "mouseup", this.handleEvent, this, true);
			document.documentElement.removeEventListener("mousemove",this,false);
			document.documentElement.removeEventListener("mouseup",this,false); 						

		}
		this.slideStatus = 0;
	}
	if (evt.type == "click"){		
		var coordPoint = this.calcCoord(evt,this.invisSliderLine);
		
		var newVal;
	
		if(coordPoint.x > this.oldThumbPosition.x){
			this.oldValue = this.value;
			if(this.value1 < this.value2)
				this.value  = this.oldValue + this.increment;
			else
				this.value  = this.oldValue - this.increment;
		}
		else{
			this.oldValue = this.value;
			if(this.value1 < this.value2)
				this.value  = this.oldValue - this.increment;
			else
				this.value  = this.oldValue + this.increment;
		}
			
		var PercAlLine = (this.value - this.value1) / (this.value2 - this.value1);
		this.thumbPosition.x = this.x1 + toRectX(this.direction,this.length * PercAlLine);
		this.thumbPosition.y = this.y1 + toRectY(this.direction,this.length * PercAlLine);	
		
		this.checkLimits(this.thumbPosition.x,this.thumbPosition.y);
			
		this.setThumb(this.thumbPosition.x,this.thumbPosition.y);	
		
		this.manager.put(this.controlHandle,this.value);	
		this.slideStatus = 0;
	}
};

Slider.prototype.setValue = function(value) {
	if(this.slideStatus != 0){ //when moving slider don't update it from other scripts
		return;
	}			
	var PercAlLine = (value - this.value1) / (this.value2 - this.value1);
	this.thumbPosition.x = this.x1 + toRectX(this.direction,this.length * PercAlLine);
	this.thumbPosition.y = this.y1 + toRectY(this.direction,this.length * PercAlLine);
	
	this.checkLimits(this.thumbPosition.x,this.thumbPosition.y);
	
	this.setThumb(this.thumbPosition.x,this.thumbPosition.y);
};

Slider.prototype.checkLimits = function(posX, posY){
	if (leftOfTest(posX,posY,this.x1,this.y1,this.px1,this.py1) == 0 && leftOfTest(posX,posY,this.x2,this.y2,this.px2,this.py2) == 0) {
		//more than max
		this.value = this.value2;
		this.thumbPosition.x  = this.x2;
		this.thumbPosition.y  = this.y2;
	}
	if (leftOfTest(posX,posY,this.x1,this.y1,this.px1,this.py1) == 1 && leftOfTest(posX,posY,this.x2,this.y2,this.px2,this.py2) == 1) {
		//less than min
		this.value = this.value1;
		this.thumbPosition.x  = this.x1;
		this.thumbPosition.y  = this.y1;
	}	
};

Slider.prototype.setThumb = function(PosX,PosY) {
	//rendering position is from top left corner
	var TransformString = "translate("+PosX+","+PosY+") rotate(" + Math.round(this.direction / Math.PI * 180) + ")";
	this.sliderSymbol.setAttributeNS(null,"transform",TransformString);
	this.oldThumbPosition.x = this.thumbPosition.x;
	this.oldThumbPosition.y = this.thumbPosition.y;	
};

Slider.prototype.setReadbackClass = function(cssClass) {
	this.currentClass = cssClass;
    this.readbackArea.setAttributeNS(null,"class",cssClass + " text");			
};

Slider.prototype.setClass = function(cssClass) {

	this.currentClass = cssClass;
	this.background.setAttributeNS(null,"class",this.cssClass + " background");
	this.sliderSymbol.setAttributeNS(xlinkNS,"xlink:href","#"+"sliderSymbol" + (this.writable ? cssClass : this.invalidClass) + this.id);
	this.ticks.setAttributeNS(null,"class",cssClass + " ticks");						
	this.blackVisSliderLine.setAttributeNS(null,"class",cssClass + " blackLine");			
	this.whiteVisSliderLine.setAttributeNS(null,"class",cssClass + " whiteLine");							
	this.controlReadbackArea.setAttributeNS(null,"class",cssClass + " text");									
	this.sliderSymbol.setAttributeNS(null,"class",cssClass);	
	this.maxReadbackArea.setAttributeNS(null,"class",cssClass + " text");	
	this.minReadbackArea.setAttributeNS(null,"class",cssClass + " text");	
	this.middleReadbackArea.setAttributeNS(null,"class",cssClass + " text");			
};
	
Slider.prototype.disable = function(){
	if (this.enabled) {
		this.enabled = false;
		this.sliderSymbol.removeEventListener("mouseover",this,false);
		this.sliderSymbol.removeEventListener("mouseout",this,false);		
		this.sliderSymbol.removeEventListener("mousedown",this,false);	
		this.invisSliderLine.removeEventListener("mousedown",this,false);		
		this.invisSliderLine.removeEventListener("click",this,false);

    	this.sliderSymbol.setAttributeNS(xlinkNS,"xlink:href","#"+"sliderSymbol" + (this.writable ? this.currentClass : this.invalidClass) + this.id);
	}	
};

Slider.prototype.enable = function(){
	if (!this.enabled) {
		this.enabled = true;
		this.sliderSymbol.addEventListener("mouseover",this,false);
		this.sliderSymbol.addEventListener("mouseout",this,false);		
		this.sliderSymbol.addEventListener("mousedown",this,false);	
		this.invisSliderLine.addEventListener("mousedown",this,false);		
		this.invisSliderLine.addEventListener("click",this,false);	

    	this.sliderSymbol.setAttributeNS(xlinkNS,"xlink:href","#"+"sliderSymbol" + (this.writable ? this.currentClass : this.invalidClass) + this.id);
	}	
};
	
Slider.prototype.calcCoord = function(evt,ctmNode) {
	var svgPoint = this.svg.createSVGPoint();
	svgPoint.x = evt.clientX;
	svgPoint.y = evt.clientY;
	if (!this.svg.getScreenCTM) {
		//undo the effect of transformations
		if (ctmNode) {
			var matrix = getTransformToRootElement(ctmNode);
		}
		else {
			var matrix = getTransformToRootElement(evt.target);			
		}
  		svgPoint = svgPoint.matrixTransform(matrix.inverse().multiply(this.m));
	}
	else {
		//case getScreenCTM is available
		if (ctmNode) {
			var matrix = ctmNode.getScreenCTM();
		}
		else {
			var matrix = evt.target.getScreenCTM();		
		}
  		svgPoint = svgPoint.matrixTransform(matrix.inverse());
	}
  //undo the effect of viewBox and zoomin/scroll
	return svgPoint;
};
	