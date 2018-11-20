
var TICKS_OFFSET_PIXELS = 20;

Tick = function(value, proportional, major, text)
{
	this.proportional = proportional;
	this.major = major;
	this.text = text;
};






/** Factors for stretching and shrinking tickstep */
var TICK_STEP_FACTORS = [ 2, 2.5, 2 ];

/**
 * Creates a new TickStep object.
 *
 * @param step Initial step
 * @param start Which index in <code>FACTORS</code> should be used for
 *        stretching first.
 * @param multipliedBefore Should be current
 *        <code>FACTORS[start]</code> used for first stretching.
 */
TickStep = function(step, start, multipliedBefore)
{
	/** Current tickstep */
	this.tep = step;
	
	this.i = start;

	/** If the last performed stepchange has been stretching. */
	this.multipliedBefore = multipliedBefore;
};

/**
 * Shrinks tickstep.
 */
TickStep.prototype.divStep = function()
{
	if (this.multipliedBefore) {
		this.i = this.change(-1);
		this.multipliedBefore = false;
	}

	this.tep = this.tep / TICK_STEP_FACTORS[this.i];
	this.i = this.change(-1);
};

/**
 * Stretches tickstep.
 */
TickStep.prototype.mulStep = function()
{
	if (!this.multipliedBefore) {
		this.i = this.change(1);
		this.multipliedBefore = true;
	}

	this.tep = this.tep * TICK_STEP_FACTORS[this.i];
	this.i = this.change(+1);
};

TickStep.prototype.change = function(di)
{
	if (this.i == TICK_STEP_FACTORS.length - 1 && di == 1) {
		return 0;
	}

	if (this.i === 0 && di == -1) {
		return 2;
	}

	return this.i + di;
};





/**
 * Creates a new TickCollector object.
 *
 * @param range Definition of range.
 * @param tickSpacing Minimum space between minor ticks.
 * @param length Available space in pixels.
 */
LinearTickCollector = function(min, max, tickSpacing, length, boundTicksVisible)
{
	this.min = min;
	this.max = max;
	
	this.span = max - min;
	
	this.tickSpacing = tickSpacing;
	this.length = length;
	this.boundTicksVisible = boundTicksVisible;

	this.zeroOnScale = this.isInRange(0);
};

/**
 * Returns new ticks using default callback.
 *
 * @return Array of ticks.
 */
LinearTickCollector.prototype.calculateTicks = function()
{
	var s = new TickStep(this.getRStep(), 0, true);

	var rmin = this.getRmin(this.min, s);
	var rmax = this.getRmax(rmin, s);

	var nticks = ((rmax - rmin) / s.tep) + 1;

	var tickSpace = (this.toRelative(rmax) - this.toRelative(rmax - s.tep)) * this.length;

	// try to increase major tick density
	while (tickSpace !== 0 && nticks < 6) {
		s.divStep();
		rmin = this.getRmin(this.min, s);
		rmax = this.getRmax(rmin, s);
		nticks = ((rmax - rmin) / s.tep) + 1;
		tickSpace = (this.toRelative(rmax) - this.toRelative(rmax - s.tep)) * this.length;
	}

	// we might have to decrease major ticks count
	while (tickSpace < this.tickSpacing || nticks > 32) {
		s.mulStep();
		rmin = this.getRmin(rmin, s);
		rmax = this.getRmax(rmin, s);

		// TODO
		if (rmin == rmax || isNaN(rmin) || isNaN(rmax) /*|| Double.isInfinite(rmin) || Double.isInfinite(rmax)*/) {
			if (this.boundTicksVisible) {
				return new Array(new Tick(this.min, 0, true, ""), new Tick(this.max, 1, true, ""));
			} else if (this.zeroOnScale) {
				return new Array(new Tick(0,this.toRelative(0), true, this.formatNumber(0.0)));
			} else {
				return new Array(new Tick(rmin,this.toRelative(rmin), true, this.formatNumber(rmin)));
			}
		}

		nticks = ((rmax - rmin) / s.tep) + 1;
		tickSpace = (this.toRelative(rmax) - this.toRelative((rmax - s.tep))) * this.length;
	}

	// from now on we have to deal with labels
	var rstep = s.tep;
	var ls = new TickStep(s.tep, s.i, s.multipliedBefore);
	var rminL = rmin;
	var rmaxL = rmax;

	// measuring tick labels
	var x;

	while (true) {
		// rstepL/10 is instead of zero to prevent round-off errors 
		for (x = rminL; x < rmaxL - ls.tep / 10; x += ls.tep) {
			if (/*measurer.measureTick(this.toRelative(x),this.formatNumber(x))
			  + measurer.measureTick(this.toRelative(x + ls.tep), this.formatNumber(x + ls.tep))*/ 50 >
			   (1.3 * (this.toRelative(x + ls.tep) - this.toRelative(x)) * this.length)) {
				break;
			}
		}

		if (x >= rmaxL - ls.tep / 10) {
			break;
		} else {
			ls.mulStep();
			rminL = this.getRmin(this.min, ls);
			rmaxL = this.getRmax(rminL, ls);
		}
	}

	if (((rmaxL - rminL) / ls.tep) + 1 > 12) { // to many labeled ticks
		ls.mulStep();
		rminL = this.getRmin(this.min, ls);
		rmaxL = this.getRmax(rminL, ls);
	}

	rstep = ls.tep / 2;
	rmin = this.getRmin(this.min, new TickStep(rstep, 0, true));
	rmax = this.getRmax(rmin, new TickStep(rstep, 0, true));

	// minor ticks
	var minorStep = rstep / 5;
	var minorMin = this.getRmin(this.min, new TickStep(minorStep, 0, true));
	var minorMax = this.getRmax(minorMin, new TickStep(minorStep, 0, true));

	if ((this.toRelative(minorMax) - this.toRelative(minorMax - minorStep)) * this.length > this.tickSpacing) {
		//everything done already
	} else {
		minorStep = rstep / 2;
		minorMin = this.getRmin(this.min, new TickStep(minorStep, 0, true));
		minorMax = this.getRmax(minorMin, new TickStep(minorStep, 0, true));

		if ((this.toRelative(minorMax) - this.toRelative(minorMax - minorStep)) * this.length > this.tickSpacing) {
			//everything done already
		} else {
			minorStep = rstep;
		}
	}

	minorMin = this.getRmin(this.min, new TickStep(minorStep, 0, true));
	minorMax = this.getRmax(minorMin, new TickStep(minorStep, 0, true));

	nticks = Math.round(Math.round((rmax - rmin) / rstep) * Math.round(rstep / minorStep) + Math.round((minorMax - rmax + rmin - minorMin) / minorStep)) + 1;

	if (nticks === 0) {
		return new Array(new Tick(0, this.toRelative(x), true, this.formatNumber(0)));
	}

	var i = 0;
	var di = 0;

	if (this.boundTicksVisible) {
		if ((rmin - this.min) / (this.max - this.min) > 0.01 || (this.max - rmin) / (this.max - this.min) > 0.01) {
			nticks = nticks + 2;
			i = 1;
			di = 1;
		}
	}

	var ticks = new Array(); // Tick[nticks];

	if (i == 1) {
		// this tick was unlabelled originally
		ticks[0] = new Tick(rmin, 0.0, true, "");
	}

	var ratio2 = Math.round(ls.tep / minorStep);
	var ratio1 = Math.round(rstep / minorStep);
	x = minorMin;

	for (; x < rmin - minorStep / 10; i++, x += minorStep) {
		ticks[i] = new Tick(x, this.toRelative(x), false, "");
	}

	var cont = 0;
	
	var k;
	for (k = 0; x < rminL - minorStep / 10; i++, k++, x += minorStep) {
		if ((k % ratio1) === 0) {
			x = rmin + (cont++) * rstep; // to prevent round off errors
			ticks[i] = new Tick(x, this.toRelative(x), true, "");
		} else {
			ticks[i] = new Tick(x, this.toRelative(x), false, "");
		}
	}

	for (k = 0; i < nticks - di; i++, k++, x += minorStep) {
		if ((k % ratio2) === 0) {
			x = rmin + (cont++) * rstep; // to prevent round off errors
			x = (Math.abs(x) != 0.0 ? x : Math.abs(x)); // to prevent ugly negative zero representation -0.0 
			ticks[i] = new Tick(x, this.toRelative(x), true, this.formatNumber(x));
		} else if ((k % ratio1) === 0) {
			x = rmin + (cont++) * rstep; // to prevent round off errors
			ticks[i] = new Tick(x, this.toRelative(x), true, "");
		} else {
			ticks[i] = new Tick(x, this.toRelative(x), false, "");
		}
	}

	if (di == 1) {
		// this tick was unlabelled originally
		ticks[i] = new Tick(rmax, 1.0, true, "");
	}
	
	return ticks;
};

LinearTickCollector.prototype.formatNumber = function(x) {
	return x;
};

LinearTickCollector.prototype.getRmin = function(min, s)
{
	var rmin;

	if (this.zeroOnScale) {
		rmin = -Math.floor(-min / s.tep) * s.tep;

		if (rmin == -0.0) {
			rmin = 0.0;
		}
	} else {
		rmin = (min < 0 ? -Math.floor(-min / s.tep) * s.tep : Math.ceil(min / s.tep) * s.tep);
	}

	return rmin;
};

LinearTickCollector.prototype.getRmax = function(rmin, s)
{
	// conversion to float makes rounder values
	return rmin + Math.floor(((this.max - rmin) / s.tep)) * s.tep;
};

LinearTickCollector.prototype.getRStep = function()
{
	var rstep;

	if (Math.abs(this.max) > Math.abs(this.min)) {
		rstep = Math.pow(10,
			    Math.floor(Math.log(Math.abs(this.max)) / Math.LN10));
	} else {
		rstep = Math.pow(10,
			    Math.floor(Math.log(Math.abs(this.min)) / Math.LN10));
	}

	return rstep;
};

LinearTickCollector.prototype.isInRange = function(value)
{
	return (value >= this.min && value <= this.max);
};

LinearTickCollector.prototype.toRelative = function(x)
{
	//if (span === 0 || isNaN(span))
	//	return 0.5;

	return (x - this.min) / this.span;
};

