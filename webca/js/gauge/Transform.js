/*
 * Copyright (c) 2003 by Cosylab d.o.o.
 *
 * The full license specifying the redistribution, modification, usage and other
 * rights and obligations is included with the distribution of this project in
 * the file license.html. If the license is not included you may find a copy at
 * http://www.cosylab.com/legal/abeans_license.htm or may write to Cosylab, d.o.o.
 *
 * THIS SOFTWARE IS PROVIDED AS-IS WITHOUT WARRANTY OF ANY KIND, NOT EVEN THE
 * IMPLIED WARRANTY OF MERCHANTABILITY. THE AUTHOR OF THIS SOFTWARE, ASSUMES
 * _NO_ RESPONSIBILITY FOR ANY CONSEQUENCE RESULTING FROM THE USE, MODIFICATION,
 * OR REDISTRIBUTION OF THIS SOFTWARE.
 */

/** Scale shape */
var AUTOMATIC_SHAPE = 0;

/** Horizontal linear scale */
var HORIZONTAL_LINEAR_SHAPE = 1;

/** Horizontal polar scale */
var HORIZONTAL_CIRCULAR_SHAPE = 2;

/** Circular polar scale */
var FULL_CIRCULAR_SHAPE = 3;

/** Vertical polar scale */
var VERTICAL_CIRCULAR_SHAPE = 4;

/** Vertical linear scale */
var VERTICAL_LINEAR_SHAPE = 5;

/** Constants used when changing scale shapes */
var FROM_LINEAR_TO_HALF_CIRCULAR = 3.5;

/** */
var FROM_HALF_CIRCULAR_TO_FULL_CIRCULAR = 1.7;

/** */
var FROM_FULL_CIRCULAR_TO_HALF_CIRCULAR = 0.65;

/** */
var HEIGHT_SMALLER_THAN_THIS_ALWAYS_LINEAR = 95;

/** */
var WIDTH_SMALLER_THAN_THIS_ALWAYS_LINEAR = 120;

/**
 * Determines the optimal renderer for this scale, given the width and
 * height of the area.
 *
 * @param w int width
 * @param h int height
 *
 * @return int
 */
function getOptimalRenderer(w, h)
{
	var ratio = (1.0 * w) / h;
	var shape;

	if(ratio > FROM_LINEAR_TO_HALF_CIRCULAR) {
		shape = HORIZONTAL_LINEAR_SHAPE;
	} else if(ratio > FROM_HALF_CIRCULAR_TO_FULL_CIRCULAR) {
		shape = HORIZONTAL_CIRCULAR_SHAPE;
	} else if(ratio > FROM_FULL_CIRCULAR_TO_HALF_CIRCULAR) {
		shape = FULL_CIRCULAR_SHAPE;
	} else if(ratio > 1 / FROM_LINEAR_TO_HALF_CIRCULAR) {
		shape = VERTICAL_CIRCULAR_SHAPE;
	} else {
		shape = VERTICAL_LINEAR_SHAPE;
	}

	if((w < (1.5 * WIDTH_SMALLER_THAN_THIS_ALWAYS_LINEAR)) && (h < (1.5 * HEIGHT_SMALLER_THAN_THIS_ALWAYS_LINEAR))) {
		shape = HORIZONTAL_LINEAR_SHAPE;
	}

	if(w < WIDTH_SMALLER_THAN_THIS_ALWAYS_LINEAR) {
		shape = VERTICAL_LINEAR_SHAPE;
	}

	if(h < HEIGHT_SMALLER_THAN_THIS_ALWAYS_LINEAR) {
		shape = HORIZONTAL_LINEAR_SHAPE;
	}

	return shape;
}

/**
 * Point class.
 */
Point2D = function() {
	this.x = 0;
	this.y = 0;
};

/**
 * Point class.
 */
Point2D = function(x, y) {
	this.x = x;
	this.y = y;
};

Point2D.prototype.getX = function() {
	return this.x;
};

Point2D.prototype.getY = function() {
	return this.y;
};

Point2D.prototype.setX = function(x) {
	this.x = x;
};

Point2D.prototype.setY = function(y) {
	this.y = y;
};

Point2D.prototype.setLocation = function(x, y) {
	this.x = x;
	this.y = y;
};

/**
 * Abstract base class for scale segments.
 */
ScaleSegment = function()
{
};

/**
 * Class defining linear scale segment.
 *
 * @param xs X coordinate of starting point.
 * @param ys Y coordinate of starting point.
 * @param xe X coordinate of ending point.
 * @param ye Y coordinate of ending point.
 */
LineSegment = function(xs, ys, xe, ye)
{
	this.lineStart = new Point2D(xs, ys);
	this.lineEnd = new Point2D(xe, ye);
};
YAHOO.lang.extend(LineSegment, ScaleSegment); 

/**
 * Definition of arc scale segment.
 *
 * @param c Center point
 * @param r inner radius
 * @param R Outer radius
 * @param start Starting angle
 * @param angle Included angle
 */
ArcSegment = function(c, r, R, start, angle)
{
	this.center = c;
	this.rOuter = R;
	this.rInner = r;
	this.startAngle = start;
	this.arcAngle = angle;
};
YAHOO.lang.extend(ArcSegment, ScaleSegment); 

/**
 * Constructs a new <code>Rectangle</code> whose top-left corner is 
 * specified as
 * (<code>x</code>,&nbsp;<code>y</code>) and whose width and height 
 * are specified by the arguments of the same name. 
 * @param     x the specified x coordinate
 * @param     y the specified y coordinate
 * @param     width    the width of the <code>Rectangle</code>
 * @param     height   the height of the <code>Rectangle</code>
 */
Rectangle = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

Rectangle.prototype.getX = function() {
	return this.x;
};

Rectangle.prototype.getY = function() {
	return this.y;
};

Rectangle.prototype.getHeight = function() {
	return this.height;
};

Rectangle.prototype.getWidth = function() {
	return this.width;
};


/**
 * Defines rectangular scale segment.
 *
 * @param rect Coordinates of rectangle.
 */
RectangleSegment = function(rect)
{
	this.rect = rect;
};
YAHOO.lang.extend(RectangleSegment, ScaleSegment); 



/**
 * Abstract utility class that provides the mathematic foundation for drawing
 * the Gauger scales. Scale is defined in its own coordinate system with the
 * axis (u, v). In this system the extents of the scale are defined to be  (0,
 * 0) and (1, 1), meaning that any point on this scale can be specified  with
 * the (u, v) parameter value between 0 and 1. This class is the
 * implementation of this transformation and the component cartesian
 * coordinate system.
 */
ScaleTransform = function()
{
	this.tempPoint = new Point2D();
	this.labelPosition = new Point2D();
	this.polar = false;
	this.segments = []; //new Array("a");
};

/**
 * Sets whether this transform is polar. A polar scale will be rendered in
 * polar coordinates rather then cartesian. Lines will be rendered as arcs
 * and text will be rotated.
 *
 * @param value True if polar.
 */
ScaleTransform.prototype.setPolar = function(value)
{
	this.polar = value;
};

/**
 * Returns whether this scale is polar.
 *
 * @return True if polar.
 *
 * @see setPolar(boolean)
 */
ScaleTransform.prototype.isPolar = function()
{
	return this.polar;
};

/**
 * Sets the component parameters for this transformation.
 *
 * @param w width of the component that will display this transformation
 * @param h height of the component that will display this transformation
 * @param marginX not used
 * @param marginY not used
 * @param tickOffset space between the edge of the scale and the first tick
 */
ScaleTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset) {};

/**
 * Maps the point specified with (u, v) coordinates in the scale space to
 * cartesian space with coordinates (x, y). (u, v) values must be in
 * [0..1]  range, the (x, y) points will be in (0..w-1, 0..h-1) range.
 *
 * @param scaleSpace point in scale space
 * @param cartesianSpace point in cartesian space
 */
ScaleTransform.prototype.mapUVtoXY = function(scaleSpace, cartesianSpace) {};

/**
 * Maps the point specified with (u, v) coordinates in the scale space to
 * cartesian space with coordinates (x, y). (u, v) values must be in
 * [0..1] range, the (x, y) points will be in (0..w-1, 0..h-1) range.
 *
 * @param u coordinate in scale space
 * @param v coordinate in scale space
 * @param cartesianSpace point in cartesian space
 */
ScaleTransform.prototype.mapUVtoXY3 = function(u, v, cartesianSpace)
{
	this.tempPoint.setLocation(u, v);
	this.mapUVtoXY(this.tempPoint, cartesianSpace);
};

/**
 * Maps point specified with (u, v) coordinates in scale space to
 * cartesian space with coordinates (x, y)
 *
 * @param u coordinate in scale space.
 * @param v coordinate in scale space.
 *
 * @return Point2D cartesianSpace point.
 *
 * @see mapUVtoXY(u, v, Point2D)
 */
ScaleTransform.prototype.mapUVtoXY2 = function(u, v)
{
	var point = new Point2D();
	this.mapUVtoXY3(u, v, point);
	return point;
};

/**
 * Returns angle between horizontal and specified relative position in
 * scale space. This angle is defined as angle between X axis and line
 * from point (x, 0.0) to point (x, 100.0). This is the angle at which
 * vertical straight line in polar mode is rotated in cartesian space.
 *
 * @param x Relative point in scale space in range 0.0 to 1.0.
 *
 * @return double angle in radians
 */
ScaleTransform.prototype.getAngle = function(x)
{
	var p1 = this.mapUVtoXY2(x, 0);
	var p2 = this.mapUVtoXY2(x, 100000.0);

	var dx = (p2.getX() - p1.getX());
	var dy = (p2.getY() - p1.getY());

	var phi = (dx === 0.0) ? 0 : -Math.atan(dy / dx) - Math.PI * 0.5;

	if(dx < 0) {
		phi = phi + Math.PI;
	}

	return phi;
};

/**
 * Returns the width of scale in pixels at the specified location v in the
 * scale space. Although the scale for v is only defined in the range
 * [0..1], this value can generaly return even values outside this range,
 * although this is not guaranteed.
 *
 * @return Width of scale in pixels.
 */
ScaleTransform.prototype.scaleWidth = function(v) {};

/**
 * Returns the height of scale in pixels at the specified location u in the
 * scale space. Although the scale for u is only defined in the range
 * [0..1], this value can generaly return even values outside this range,
 * although this is not guaranteed.
 *
 * @return Height of scale in pixels.
 */
ScaleTransform.prototype.scaleHeight = function(u) {};

/**
 * Returns the point where the label should be positioned. This point
 * represents geometric center of the text. There are no limits to the
 * size  of the text written around this position.
 *
 * @return Center point for label.
 */
ScaleTransform.prototype.getLabelPosition = function()
{
	return this.labelPosition;
};

/**
 * Returns the number of segments describing this scale. Even if the value
 * is zero, this transform may still provide space transformation
 * functionality.
 *
 * @return Number of segments.
 */
ScaleTransform.prototype.getSegmentCount = function()
{
	return this.segments.length;
};

/**
 * Adds segment to this transform.
 * 
 * @param segment to add.
 */
ScaleTransform.prototype.addSegment = function(segment)
{
	this.segments.push(segment);
};

/**
 * Returns scale segment at specified index.
 *
 * @param i Index of segment.
 *
 * @return Scale segment.
 */
ScaleTransform.prototype.getSegment = function(i)
{
	return this.segments[i];
};

/**
 * Sets position of value label. The position is center point of label.
 * 
 * @param x coordinate of label center.
 * @param y coordinate of label center.
 */
ScaleTransform.prototype.setLabelPosition = function(x, y)
{
	this.labelPosition.x = x;
	this.labelPosition.y = y;
};

/**
 * Measues the width of tick label.
 *
 * @param g Graphic context.
 * @param x Relative position of tick.
 * @param text Tick label.
 *
 * @return Width of label in pixels.
 */
ScaleTransform.prototype.measureTick = function(g, x, text)
{
	// TODO !!!
	return 10*text.length;
	//return g.getFontMetrics().stringWidth(text);
};

/**
 * Create segment.
 *
 * @param svg SVG element.
 * @return created SVG element.
 */
ScaleTransform.prototype.createSegment = function(segment, svg) {};




/**
 * Base class for polar transforms. All polar transforms will be rendered using
 * scale in the shape of arc.
 */
PolarTransform = function()
{
	PolarTransform.superclass.constructor.call(this); 

	this.centre = new Point2D();
	this.R = 0;
	this.r = 0;
	this.alpha = 0;
	this.span = 0;
	this.height = 0;
	this.tickOffset = 0;
};
YAHOO.lang.extend(PolarTransform, ScaleTransform); 

/*
 * @see ScaleTransform#setParameters(int, int, int, int, int)
 */
PolarTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	this.setPolar(true);
};

var DEG_TO_RAD = Math.PI / 180.0;
function pointPolarToCartesian(point, r, phi)
{
	var rPhi = phi * DEG_TO_RAD;
	point.setLocation((r * Math.cos(rPhi)), -(r * Math.sin(rPhi)));
}

function polarToCartesian(r, phi)
{
	var point = new Point2D();
	pointPolarToCartesian(point, r, phi);
	return point;
}

/*
 * @see ScaleTransform#mapUVtoXY(PointDouble, Point)
 */
PolarTransform.prototype.mapUVtoXY = function(scaleSpace, cartesianSpace)
{
	var phi = this.alpha - (this.tickOffset + scaleSpace.getX() * (this.span - 2.0 * this.tickOffset));

	pointPolarToCartesian(cartesianSpace, this.r + scaleSpace.getY() * this.height, phi);

	cartesianSpace.setLocation(cartesianSpace.getX() + this.centre.getX(), cartesianSpace.getY() + this.centre.getY());
};

/*
 * @see ScaleTransform#scaleWidth(double)
 */
PolarTransform.prototype.scaleWidth = function(v)
{
	return Math.abs(((this.r + v * this.height) * Math.PI * (this.span - 2 * this.tickOffset) / 180.0));
};

/*
 * @see ScaleTransform#scaleHeight(double)
 */
PolarTransform.prototype.scaleHeight = function(u)
{
	return this.height;
};

/*
 * @see ScaleTransform#createSegment(svg)
 */
PolarTransform.prototype.createSegment = function(segment, svg) {

	var r = segment.rInner;
	var R = segment.rOuter;

	var cx = segment.center.getX();
	var cy = segment.center.getY();

	var P1 = polarToCartesian(R, segment.startAngle);
	var P2 = polarToCartesian(R, segment.startAngle - segment.arcAngle);

	var p1 = polarToCartesian(r, segment.startAngle);
	var p2 = polarToCartesian(r, segment.startAngle - segment.arcAngle);

	var longArc = (segment.arcAngle > 180) ? 1 : 0; 

	// arc path
	var arc = document.createElementNS(svgNS,"path");

	// polar simple, polar vertical
	arc.setAttributeNS(null,"d", "M" + (P1.x + cx) + "," + (P1.y + cy) + 
		" A" + R + "," + R + " 0 " + longArc + ",1 " + (P2.x + cx) + "," + (P2.y + cy) + 
		" L" + (p2.x + cx) + "," + (p2.y + cy) + 
		" A" + r + "," + r + " 0 " + longArc + ",0 " + (p1.x + cx) + "," + (p1.y + cy) + 
		" z");

	svg.appendChild(arc);	

	return arc;
};




/**
 * Defines horizontal polar transform. This transform will render the scale
 * as arc of less the 180 degrees with minimum at left and maximum at right.
 */
PolarHorizontalTransform = function()
{
	PolarHorizontalTransform.superclass.constructor.call(this); 

	this.MAXIMUM_HEIGHT = 90;
	this.MINIMUM_HEIGHT = 35;
	this.MAXIMUM_HEIGHT_2 = this.MAXIMUM_HEIGHT / 2;
	this.MAXIMUM_HEIGHT_6 = this.MAXIMUM_HEIGHT / 6;
	this.RELATIVE_X_OFFSET = 0.05;
	this.RELATIVE_Y_OFFSET = 0.15; //0.10;
	this.RELATIVE_SCALE_SIZE_COMPARED_TO_HEIGHT = 0.3;
};
YAHOO.lang.extend(PolarHorizontalTransform, PolarTransform); 

/*
 * @see ScaleTransform#setParameters(int, int, int, int, int)
 */
PolarHorizontalTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	PolarHorizontalTransform.superclass.setParameters(w, h, marginX, marginY, tickOffset);

	this.height = h;

	var widthDouble = w * (1 - this.RELATIVE_X_OFFSET);
	var heightDouble = (h - this.MAXIMUM_HEIGHT_2) * (1 - this.RELATIVE_Y_OFFSET);

	this.height = (heightDouble * this.RELATIVE_SCALE_SIZE_COMPARED_TO_HEIGHT);
	this.height = Math.min(this.height, this.MAXIMUM_HEIGHT);
	this.height = Math.max(this.height, this.MINIMUM_HEIGHT);

	var RDouble = (0.5 * heightDouble * (1 + Math.pow(widthDouble / (2 * heightDouble), 2)));

	this.R = RDouble;
	this.r = this.R - this.height;

	var offset = this.RELATIVE_Y_OFFSET * heightDouble / 2 + this.MAXIMUM_HEIGHT_6;

	this.centre = new Point2D(w / 2, this.R + offset);

	// TODO if width is rel. large, phi can be too much
	var phi = Math.asin((widthDouble) / (2 * RDouble)) * 180 / Math.PI;

	this.alpha = (90.0 + phi);
	this.span = (2.0 * phi);

	this.setLabelPosition(this.centre.getX(), h * 0.75 + 6 /* TODO = font height/2 */);

	this.tickOffset = (tickOffset * 180.0 / Math.PI) / this.r;

	var segment = new ArcSegment(this.centre, this.r, this.R, this.alpha, this.span);
	this.addSegment(segment);
};





/**
 * Defines vertical polar transform. This transform will define gauger with 
 * arc scale with origin at left and arc spanning to the right. Minimum will
 * be at top and maximum at bottom.
 */
PolarVerticalTransform = function()
{
	PolarVerticalTransform.superclass.constructor.call(this); 

	this.MAXIMUM_HEIGHT = 90;
	this.MINIMUM_HEIGHT = 35;
	this.RELATIVE_X_OFFSET = 0.1;
	this.RELATIVE_Y_OFFSET = 0.05;
	this.RELATIVE_SCALE_SIZE_COMPARED_TO_WIDTH = 0.3;
};
YAHOO.lang.extend(PolarVerticalTransform, PolarTransform); 

/*
 * @see ScaleTransform#setParameters(int, int, int, int, int)
 */
PolarVerticalTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	PolarVerticalTransform.superclass.setParameters(w, h, marginX, marginY, tickOffset);

	var heightDouble = h * (1 - this.RELATIVE_Y_OFFSET);
	var widthDouble = (w - this.MAXIMUM_HEIGHT / 2) * (1 - this.RELATIVE_X_OFFSET);

	this.height = (widthDouble * this.RELATIVE_SCALE_SIZE_COMPARED_TO_WIDTH);
	this.height = Math.min(this.height, this.MAXIMUM_HEIGHT);
	this.height = Math.max(this.height, this.MINIMUM_HEIGHT);

	var RDouble = 0.5 * widthDouble * (1 + Math.pow(0.5 * heightDouble / widthDouble, 2));

	var phi = (Math.asin(0.5 * heightDouble / RDouble) * 180 / Math.PI);

	this.R = RDouble;
	this.r = this.R - this.height;

	var cw = this.R + (this.RELATIVE_X_OFFSET * widthDouble / 2 + this.MAXIMUM_HEIGHT / 6);

	this.centre = new Point2D((w - cw), h / 2);
	this.alpha = phi;
	this.span = 2 * phi;

	this.tickOffset = ((tickOffset * 180.0 / Math.PI) / this.r);

	this.setLabelPosition((3 * w / 8), this.centre.getY());

	var segment = new ArcSegment(this.centre, this.r, this.R, this.alpha, this.span);
	this.addSegment(segment);
};




/**
 * Defines polar transform for angles larger than 180 degrees, but less than
 * 360. Minimum will be at lower left and maximum at lower right. 
 */
PolarFullTransform = function()
{
	PolarFullTransform.superclass.constructor.call(this); 
	
	this.MAXIMUM_HEIGHT = 60;
	this.MINIMUM_HEIGHT = 35;
	this.RELATIVE_OFFSET = 0.9;
	this.RELATIVE_SCALE_SIZE_COMPARED_TO_SIZE = 0.15;
};
YAHOO.lang.extend(PolarFullTransform, PolarTransform); 

/*
 * @see ScaleTransform#setParameters(int, int, int, int, int)
 */
PolarFullTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	PolarFullTransform.superclass.setParameters(w, h, marginX, marginY, tickOffset);

	var size = (Math.min(w, h * 1.171573411) * this.RELATIVE_OFFSET);

	this.R = size / 2.0;
	this.centre = new Point2D(0.5 * w, 0.5 * h + (this.R * 0.17));

	h = (h * this.RELATIVE_SCALE_SIZE_COMPARED_TO_SIZE);
	h = Math.min(h, this.MAXIMUM_HEIGHT);
	h = Math.max(h, this.MINIMUM_HEIGHT);
	this.height = h;

	this.r = this.R - h;

	this.alpha = 225.0;
	this.span = 270.0;

	this.setLabelPosition(this.centre.getX(), this.centre.getY());

	this.tickOffset = (tickOffset * (180.0 / Math.PI)) / this.r;

	var segment = new ArcSegment(this.centre, this.r, this.R, this.alpha, this.span);
	this.addSegment(segment);
};





/**
 * Linear transform base class.
 */
LinearTransform = function()
{
	LinearTransform.superclass.constructor.call(this); 
};
YAHOO.lang.extend(LinearTransform, ScaleTransform); 

/*
 * @see ScaleTransform#createSegment(svg)
 */
LinearTransform.prototype.createSegment = function(segment, svg) {
	var r = segment.rect;

	// rectangle
	var rect = document.createElementNS(svgNS,"rect");
	rect.setAttributeNS(null,"x",r.x);
	rect.setAttributeNS(null,"y",r.y);
	rect.setAttributeNS(null,"width",r.width);
	rect.setAttributeNS(null,"height",r.height);
	svg.appendChild(rect);	

	return rect;
};





/**
 * This transform defines shape of horizontal linear gauger. It imposes
 * constraints on minimum and maximum sizes and defines borders, as well as
 * position of value label.
 */
LinearHorizontalTransform = function()
{
	LinearHorizontalTransform.superclass.constructor.call(this); 

	/** Maximum height to which the scale will grow */
	this.MAXIMUM_HEIGHT = 80;
	
	/** Minimum height to which the scale will shrink */
	this.MINIMUM_HEIGHT = 5;
	
	/** Horizontal offset of scale from border */
	this.RELATIVE_X_OFFSET = 0.05;
	
	/** Vertical offset of scale from border */
	this.RELATIVE_Y_OFFSET = 0.15;
	
	/**	 */
	this.width = 0;
	
	/**	 */
	this.height = 0;
	
	/**	 */
	this.xOffset = 0;
	
	/**	 */
	this.yOffset = 0;
	
	/**	 */
	//this.scaleWidth = 0;
	
	/**	 */
	this.tickOffset = 0;
};
YAHOO.lang.extend(LinearHorizontalTransform, LinearTransform); 

/**
 * Sets the dimensions of this scale and calculates internal parameters.
 *
 * @param w int Gauger width.
 * @param h int Gauger height.
 * @param marginX int Horizontal margin from border in pixels.
 * @param marginY int Vertical margin from border in pixels.
 * @param tickOffset int Minimum offset of first and last tick from scale
 *        in pixels.
 *
 * @see ScaleTransform#setParameters(int, int, int, int)
 */
LinearHorizontalTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	this.tickOffset = tickOffset;

	this.width = w - 2 * (marginX + this.tickOffset);
	this.height = h - 2 * marginY;

	this.height = Math.min(this.height, this.MAXIMUM_HEIGHT);
	this.height = Math.max(this.height, this.MINIMUM_HEIGHT);
	this.width = Math.max(this.width, 0);

	this.xOffset = (w - this.width) / 2.0;
	this.yOffset = (h - this.height - marginY) / 2.0;

	//this.scaleWidth = Math.abs(this.width - 2 * this.tickOffset);

	var outline = new Rectangle(this.xOffset, this.yOffset, this.width, this.height);
	this.addSegment(new RectangleSegment(outline));

	//this.setLabelPosition(w / 2, (h - (h - this.height - this.yOffset) / 2));
	this.setLabelPosition(w / 2, (h - (h - this.height - this.yOffset) / 2) + 6 /* TODO = font height/2 */);
};

/**
 * Converts point in scale space to point in gauger space. Conversion is
 * linear.
 *
 * @param scaleSpace PointDouble Point in scale space.
 * @param cartesianSpace Point Point in gauger space.
 *
 * @see ScaleTransform#mapUVtoXY(PointDouble, Point)
 */
LinearHorizontalTransform.prototype.mapUVtoXY = function(scaleSpace, cartesianSpace)
{
	var x = (this.xOffset + this.scaleWidth(0.0) * scaleSpace.getX() + this.tickOffset);
	var y = (this.yOffset + this.height * (1 - scaleSpace.getY()));
//	var y = (this.yOffset + (this.height - 1) * (1 - scaleSpace.getY()) - 1);
	cartesianSpace.setLocation(x, y);
};

/**
 * Returns width of scale at relative vertical position. Returns constant
 * width.
 *
 * @param v double Relative vertical position in range 0.0 to 1.0
 *
 * @return double Width in pixels.
 *
 * @see ScaleTransform#scaleWidth(double)
 */
LinearHorizontalTransform.prototype.scaleWidth = function(v)
{
	return Math.abs(this.width - 2 * this.tickOffset);
};

/**
 * Returns scale height at relative horizontal position. Returns constant
 * height.
 *
 * @param u double Relative horizontal position in range 0.0 to 1.0.
 *
 * @return double Heightin pixels.
 *
 * @see ScaleTransform#scaleHeight(double)
 */
LinearHorizontalTransform.prototype.scaleHeight = function(u)
{
	return this.height;
};









/**
 * Defines vertical linear transform.
 */
LinearVerticalTransform = function()
{
	LinearVerticalTransform.superclass.constructor.call(this); 

	this.MAXIMUM_WIDTH = 80;
	this.MINIMUM_WIDTH = 25;
	this.RELATIVE_X_OFFSET = 0.1;
	this.RELATIVE_Y_OFFSET = 0.05;
	
	/**	 */
	this.width = 0;
	
	/**	 */
	this.height = 0;
	
	/**	 */
	this.xOffset = 0;
	
	/**	 */
	this.yOffset = 0;
	
	/**	 */
	//this.scaleWidth = 0;
	
	/**	 */
	this.tickOffset = 0;
};
YAHOO.lang.extend(LinearVerticalTransform, LinearTransform); 

/**
 * @see ScaleTransform#setParameters(int, int, int, int)
 */
LinearVerticalTransform.prototype.setParameters = function(w, h, marginX, marginY, tickOffset)
{
	this.tickOffset = tickOffset;

	this.width = w - (2 * w * this.RELATIVE_X_OFFSET) - 5;
	this.height = h - (2 * h * this.RELATIVE_Y_OFFSET) - 5;
	this.width = Math.min(this.width, this.MAXIMUM_WIDTH);
	this.width = Math.max(this.width, this.MINIMUM_WIDTH);
	this.height = Math.max(this.height, 0);

	this.xOffset = (0.5 * (w - this.width));
	this.yOffset = (0.5 * (h - this.height));

	var outline = new Rectangle(this.xOffset, this.yOffset, this.width, this.height);
	this.addSegment(new RectangleSegment(outline));

	//this.setLabelPosition((w / 2), (0.5 * (h - this.height - this.yOffset)));
	this.setLabelPosition((w / 2), (this.yOffset + 8 /* TODO = font height/2 */)/ 2);
};

/**
 * @see ScaleTransform#mapUVtoXY(PointDouble, Point)
 */
LinearVerticalTransform.prototype.mapUVtoXY = function(scaleSpace, cartesianSpace)
{
	var x = (this.xOffset + this.width * scaleSpace.getY());
	var y = (this.yOffset + this.scaleWidth(0.0) * scaleSpace.getX()) + this.tickOffset;
	cartesianSpace.setLocation(x, y);
};

/**
 * @see ScaleTransform#scaleWidth(double)
 */
LinearVerticalTransform.prototype.scaleWidth = function(v)
{
	return Math.abs(this.height - 2 * this.tickOffset);
};

/**
 * @see ScaleTransform#scaleHeight(double)
 */
LinearVerticalTransform.prototype.scaleHeight = function(u)
{
	return this.width;
};




/**
 * Creates a new instance of transform that is best suited for given size.
 *
 * @param w int
 * @param h int
 *
 * @return ScaleTransform
 */
function createTransform(w, h)
{
	var type = getOptimalRenderer(w, h);

	switch (type) {
		case HORIZONTAL_LINEAR_SHAPE:
			return new LinearHorizontalTransform();
	
		case HORIZONTAL_CIRCULAR_SHAPE:
			return new PolarHorizontalTransform();

		case FULL_CIRCULAR_SHAPE:
			return new PolarFullTransform();

		case VERTICAL_CIRCULAR_SHAPE:
			return new PolarVerticalTransform();

		case VERTICAL_LINEAR_SHAPE:
			return new LinearVerticalTransform();
	
		default:
			return new LinearVerticalTransform();
	}
}






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
	while (tickSpace < this.tickSpacing || nticks > 25) {
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

