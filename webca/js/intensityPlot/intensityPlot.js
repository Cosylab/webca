function toHex(v) { v=Math.round(Math.min(Math.max(0,v),255)); return("0123456789ABCDEF".charAt((v-v%16)/16)+"0123456789ABCDEF".charAt(v%16)); }
function rgb2hex(r,g,b) { return(toHex(r)+toHex(g)+toHex(b)); }

IntensityPlot = function(name,id, manager,alarmSensitive,width,height,maxValue,waterfall){	
	//call super class constructor	
	IntensityPlot.superclass.constructor.call(this,name,id, manager,alarmSensitive); 	

	this.maxValue = maxValue; 
	this.width = width;
	this.height = height;
	this.waterfall = waterfall;

	//html object
	this.htmlElement = document.getElementById(id);
	this.ctx = this.htmlElement.getContext("2d");

	// use putImageData if supported, otherwise simulate
	if (this.ctx.putImageData)
	{
		this.img = this.ctx.getImageData(0, 0, this.width, this.height);
		this.transform = 255/this.maxValue;
	}
	else
	{
		// prepare colors, if necessary
		this.colors = new Array(256);
		for (var i = 0; i < 256; i++)
			//this.colors[i] = "rgb(" + i + "," + i + "," + i + ")";
			this.colors[i] = "#" + rgb2hex(i, i, i);	// this is faster as above

		this.maxColorIndex = this.colors.length - 1;
		this.transform = this.maxColorIndex/this.maxValue;
	}

	this.initializeCanvas();

	//call register
	this.readbackHandle = this.manager.register(this.readbackName,this);		
};
YAHOO.lang.extend(IntensityPlot, Monitor);

IntensityPlot.prototype.initializeCanvas = function(){
	if (this.ctx.putImageData)
	{	var ix = 0;
		var imgdata = this.img.data;
		var len = this.width * this.height;
		// all back, preinit alpha to max
		for (var i = 0; i < len; i++)
		{
			imgdata[ix++] = 0;
			imgdata[ix++] = 0;
			imgdata[ix++] = 0;
			imgdata[ix++] = 255;
		}	
		this.ctx.putImageData(this.img, 0, 0);
	}
	else
	{
		this.ctx.fillStyle = this.colors[0];
		this.ctx.fillRect(0, 0, this.width, this.height);

		// static w/ red line
		if (this.waterfall)
		{		
			this.pos = 0;
			this.ctx.fillStyle = "#FF0000";
			this.ctx.fillRect(0, this.pos, this.width, 1);
		}
	}
};

//routines definition
IntensityPlot.prototype.preInitialize = function(handle,resolvedName){
	assert(arguments.length == 2, "IntensityPlot.preInitialize() requires two arguments.");	
	IntensityPlot.superclass.preInitialize.call(this, handle,resolvedName);
};	

IntensityPlot.prototype.notifyConnectionStatus = function(handle,connected){
	assert(arguments.length == 2, "IntensityPlot.notifyConnectionStatus() requires two arguments.");		
    IntensityPlot.superclass.notifyConnectionStatus.call(this, handle,connected);
   	if(!connected){
		this.initializeCanvas();
    }    
};		
		
IntensityPlot.prototype.cleanup = function(handle){
	assert(arguments.length == 1, "IntensityPlot.cleanup() requires one argument.");
	IntensityPlot.superclass.cleanup.call(this,handle);
	this.initializeCanvas();
};

IntensityPlot.prototype.notifyGetCtrl = function(handle,ctrlData){
	assert(arguments.length == 2, "IntensityPlot.notifyGetCtrl() requires two arguments.");
	IntensityPlot.superclass.notifyGetCtrl.call(this,handle,ctrlData);
	if(!this.monitorHandle)
		this.monitorHandle = this.manager.createMonitor(handle,this);    
};	

IntensityPlot.prototype.notifyMonitor = function(handle,value,status,severity,timestamp){
	assert(arguments.length == 5, "IntensityPlot.notifyMonitor() requires five arguments.");
	IntensityPlot.superclass.notifyMonitor.call(this,handle,value,status,severity,timestamp);

	var i = 0;
	/*
	// fake values
	var v = value;
	if (this.value);
	else
		this.value = new Array(this.width * this.height);
	value = this.value;
	for (; i < value.length; i++)
		value[i] = (v*10) % this.maxValue;
	*/
	
	// if array
	if (value.length)
	{
		var len = Math.min(value.length, this.waterfall ? this.width : this.width * this.height);

		if (this.ctx.putImageData)
		{
			// shift up, last line is always left empty...
			if (this.waterfall)
				this.img = this.ctx.getImageData(0, 1, this.width, this.height-1);

			var c;
			var ix = this.waterfall ? (this.height - 2) * this.width * 4 : 0;
			var imgdata = this.img.data;
			for (i = 0; i < len; i++)
			{
				c = Math.min(Math.floor(value[i]*this.transform), 255);
				imgdata[ix++] = c;
				imgdata[ix++] = c;
				imgdata[ix++] = c;
				ix++;	// skip alpha
			}
		  	this.ctx.putImageData(this.img, 0, 0);	
		}
		else
		{
			var ix = this.waterfall ? this.pos * this.width : 0;

			if (this.waterfall)
			{
				this.pos++;
				this.pos = this.pos % (this.height - 1);
				//this.ctx.fillStyle = "#FF0000";
				this.ctx.fillRect(0, this.pos, this.width, 1);
			}
			
			for (i = 0; i < len; i++, ix++)
			{
				this.ctx.strokeStyle = this.colors[Math.min(Math.floor(value[i]*this.transform), this.maxColorIndex)];
				this.ctx.strokeRect(ix % this.width, Math.floor(ix / this.width), 1, 0);
			}
		}
	}
	
};


