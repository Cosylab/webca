
Gauge = function(readbackName,id, manager,alarmSensitive,displayFormat,minValue,maxValue){	

	//call super class constructor	
	Gauge.superclass.constructor.call(this,readbackName,id, manager,alarmSensitive); 
	
	if(minValue != null && maxValue != null && typeof(minValue) == "number" && typeof(maxValue) == "number"){
		this.limitsFromPV = false;
		this.maxValue = maxValue;
		this.minValue = minValue;
	}
	else
		this.limitsFromPV = true;
	
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
	
	this.createGauge();	

	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);		
		
	// repaint event
	this.repaintObj = repaintObjInstance;
	this.repaintObj.repaintEvent.subscribe(this.repaint, this, true); 	
	
};
YAHOO.lang.extend(Gauge, Monitor);

//routines definition
Gauge.prototype.reregister = function(handle){
	assert(arguments.length == 1, "Gauge.reregister() requires one argument.");
	Gauge.superclass.reregister.call(this, this.readbackHandle); 
};
	
Gauge.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "Gauge.preInitialize() requires two arguments.");	
	Gauge.superclass.preInitialize.call(this, this.readbackHandle, resolvedName); 		
};

Gauge.prototype.initialize = function(handle){	
	assert(arguments.length == 1, "Gauge.initialize() requires one argument.");	
	Gauge.superclass.initialize.call(this, this.readbackHandle); 
};

Gauge.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "Gauge.notifyConnectionStatus() requires two arguments.");	
	Gauge.superclass.notifyConnectionStatus.call(this, handle,connected); 
	this.setAlarms();	
};
		
Gauge.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "Gauge.cleanup() requires one argument.");	
	Gauge.superclass.cleanup.call(this,handle);
	if (this.limitsFromPV) {
		this.minValue = NaN; this.maxValue = NaN;
	}
	this.recreate(); // TODO optimize: only remove ticks and needle, value
	this.setAlarms();
};	

Gauge.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "Gauge.notifyGetCtrl() requires two arguments.");
	Gauge.superclass.notifyGetCtrl.call(this,handle,ctrlData); 

	this.recreate(); // TODO optimize: only remove ticks and needle
	
	this.setCtrlData();
	if (!this.ctrlData.isArray && this.ctrlData.isNumeric)
	{
		this.monitorHandle = this.manager.createMonitor(handle,this);    
	} 
	else
	{ 
		this.readbackText.data = "-";
		this.htmlElement.setAttribute("class",this.invalidClass);	
		this.setAlarms();
	}	
};

Gauge.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "Gauge.notifyMonitor() requires five arguments.");
	Gauge.superclass.notifyMonitor.call(this,handle,value,status,severity,timestamp); 		

	this.setValue(value);
};

Gauge.prototype.setCtrlData = function(){
	//set ctrl data 
	if(this.limitsFromPV){
	
		// reset value
		this.minValue = NaN;
		this.maxValue = NaN;
	
		if(this.ctrlData.getLowerDisplayLimit() != null)
				this.minValue = this.ctrlData.getLowerDisplayLimit();
		if(this.ctrlData.getUpperDisplayLimit() != null)
				this.maxValue = this.ctrlData.getUpperDisplayLimit();
	}
	
	this.valueSpan = this.maxValue - this.minValue;

	this.createTicksAndNeedle();
};

Gauge.prototype.getTransform = function(){
	if (!this.transform) {
		this.transform = createTransform(this.gaugeWidth, this.gaugeHeight);

		// TODO get label height
		this.transform.setParameters(this.gaugeWidth, this.gaugeHeight, 0, 
			/* getValueLabel().getBounds().height */ 16, TICKS_OFFSET_PIXELS);
	}

	return this.transform;
};

var RELATIVE_NEEDLE_SIZE = 0.6;
var DEFAULT_NEEDLE_RATIO = 7.0;
Gauge.prototype.createNeedle = function(){

	var height = this.transform.scaleHeight(0.5) * RELATIVE_NEEDLE_SIZE;
	var width = (height / DEFAULT_NEEDLE_RATIO);

	this.needle = document.createElementNS(svgNS,"polygon");
	this.needle.setAttributeNS(null,"points","0," + (-height) + " " + (-width) + ",0 " + width + ",0");
	this.needle.setAttributeNS(null,"class",this.invalidClass + " needle");									
	this.svg.appendChild(this.needle);	

	if (this.value)
		this.setValue(this.value);
};

Gauge.prototype.setValue = function(value){

	this.readbackText.data = this.getFormattedValue(value, this.precisionFromPV, this.formatter) + " " + this.ctrlData.getUnits();
	this.value = value;

	// propoctional value {0..1}
	var x = (value - this.minValue) / this.valueSpan; 

	// bounds check
	if (x > 1.01) x = 1.01;
	else if (x < -0.01) x = -0.01;

	this.setAlarms();	

	// TODO do not translate if change is not big enough

	var p = new Point2D();
	this.transform.mapUVtoXY3(x, 0, p);
	var phi = this.transform.getAngle(x) * 180 / Math.PI;

	if (this.needle)
		this.needle.setAttributeNS(null,"transform","translate(" + p.x + "," + p.y + ") rotate(" + (-(phi)) + ")");		
};

Gauge.prototype.setAlarms = function(){
	var currentCss = this.htmlElement.getAttribute("class");
	this.readbackArea.setAttributeNS(null,"class",currentCss + " text");									
	if (this.needle)
		this.needle.setAttributeNS(null,"class",currentCss + " needle");									
};

Gauge.prototype.createTicksAndNeedle = function(){

	if (!this.minValue || !this.maxValue || isNaN(this.minValue) || isNaN(this.maxValue))
		return;

	var ltc = new LinearTickCollector(this.minValue, this.maxValue, 3 /*tickSpacing*/, this.transform.scaleWidth(0.7), false);
	var ticks = ltc.calculateTicks();
	
	if ((ticks == null) || (ticks.length < 2)) {
		return;
	}

	var n = ticks.length;

	var p1 = this.transform.mapUVtoXY2(0.5, 0);
	var p2 = this.transform.mapUVtoXY2(0.5, 10000.0);
	var xOfs = -this.transform.scaleHeight(0.5);
	var mult = 1.0;
	
	if (Math.abs(xOfs) < 2*/*metrics.getHeight()*/16) {
		mult = 0.5;
	}

	var textOffs  = xOfs * 0.6 *mult;
	var minorOffs = xOfs * 0.25*mult;
	var majorOffs = xOfs * 0.5 *mult;

	var i; var tick; var phi; var line; var text; var textArea;
	for(i = 0; i < n; i++) {
		tick = ticks[i];

		this.transform.mapUVtoXY3(tick.proportional, 0.0, p1);
		phi = this.transform.getAngle(tick.proportional) * 180 / Math.PI - 90;

		if(tick.major) {
			p2 = polarToCartesian(majorOffs, phi);
			line = document.createElementNS(svgNS,"line");
			line.setAttributeNS(null,"x1",p1.x);
			line.setAttributeNS(null,"y1",p1.y);
			line.setAttributeNS(null,"x2",p1.x + p2.x);
			line.setAttributeNS(null,"y2",p1.y + p2.y);
			line.setAttributeNS(null,"class",this.cssClass + " tick");
			this.svg.appendChild(line);

			p2 = polarToCartesian(textOffs, phi);
			p2.x = p1.x + p2.x; 
			p2.y = p1.y + p2.y; 

			textArea = document.createElementNS(svgNS,"text");
			textArea.setAttributeNS(null,"x",p2.x);
			textArea.setAttributeNS(null,"y",p2.y);
			textArea.setAttributeNS(null,"text-anchor","middle");		
			textArea.setAttributeNS(null,"transform","rotate(" + (-(phi+90)) + "," + p2.x + "," + p2.y + ")");		
			textArea.setAttributeNS(null,"class",this.cssClass + " tickText");									
			text = document.createTextNode(tick.text);
		  	textArea.appendChild(text);		
			this.svg.appendChild(textArea);	
		} else {
			p2 = polarToCartesian(minorOffs, phi);
			line = document.createElementNS(svgNS,"line");
			line.setAttributeNS(null,"x1",p1.x);
			line.setAttributeNS(null,"y1",p1.y);
			line.setAttributeNS(null,"x2",p1.x + p2.x);
			line.setAttributeNS(null,"y2",p1.y + p2.y);
			line.setAttributeNS(null,"class",this.cssClass + " tick");
			this.svg.appendChild(line);
		}
	}

	// and after ticks there comes a needle	
	this.createNeedle();				
};


Gauge.prototype.createGauge = function(){
		
	this.gaugeHeight = this.htmlElement.clientHeight;
	this.gaugeWidth = this.htmlElement.clientWidth;

	// add SVG object
	this.svg = document.createElementNS(svgNS,"svg");
	this.svg.setAttributeNS(null,"height",this.gaugeHeight + "px"); 
	this.svg.setAttributeNS(null,"width",this.gaugeWidth + "px"); 
	this.htmlElement.appendChild(this.svg);
	
	// rectangle - background
	this.background = document.createElementNS(svgNS,"rect");
	this.background.setAttributeNS(null,"x",0);
	this.background.setAttributeNS(null,"y",0);
	this.background.setAttributeNS(null,"width", this.gaugeWidth);	
	this.background.setAttributeNS(null,"height", this.gaugeHeight);	
//	this.background.setAttributeNS(null,"class",this.invalidClass + " background");						
	this.background.setAttributeNS(null,"class",this.cssClass + " background");						
	this.svg.appendChild(this.background);	

	var transform = this.getTransform();
	for (var seg = transform.segments.length - 1; seg >= 0; seg--)
	{
		var segEl = transform.createSegment(transform.segments[seg], this.svg);
		segEl.setAttributeNS(null,"class",this.cssClass + " scale");						
	}
	
	this.readbackArea = document.createElementNS(svgNS,"text");
	this.readbackArea.setAttributeNS(null,"x",transform.getLabelPosition().getX());
	this.readbackArea.setAttributeNS(null,"y",transform.getLabelPosition().getY());
	this.readbackArea.setAttributeNS(null,"text-anchor","middle");		
	this.readbackArea.setAttributeNS(null,"class",this.invalidClass + " text");									
	this.readbackText = document.createTextNode("-");
  	this.readbackArea.appendChild(this.readbackText);		
	this.svg.appendChild(this.readbackArea);	
};

Gauge.prototype.repaint = function(){
	this.recreate();
	this.createTicksAndNeedle();
	return;
};

Gauge.prototype.recreate = function(){
	// simply recreate gauge
	this.removeGauge();
	this.createGauge();
};

// remove all slider GUI elements
Gauge.prototype.removeGauge = function() {
	this.transform = null;	
	this.htmlElement.removeChild(this.svg);		
};
