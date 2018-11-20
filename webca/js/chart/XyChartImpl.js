XyChartImpl = function(elementId) {

	this.topElement = document.getElementById(elementId);
};

XyChartImpl.prototype.plotTitleChanged = function(name) {
	//webcaLog("plotTitleChanged: " + name);
};

XyChartImpl.prototype.axisXLabelChanged = function(name) {
	//webcaLog("axisXLabelChanged: " + name);
};

/* timeScale - if true, the x values are treated as timestamps
 * sizeLimit - the maximum amount of kept appended values
 * valueFormat - the timestamp display format
 */
XyChartImpl.prototype.axisXPropertiesChanged = function(timeScale, sizeLimit, valuesFormat) {
	//webcaLog("axisXPropertiesChanged: " + timeScale + " " + sizeLimit + " " + valuesFormat);
};

XyChartImpl.prototype.axisYLabelChanged = function(name) {
	//webcaLog("axisYLabelChanged: " + name);
};

/* timeScale - if true, the y values are treated as timestamps
 * sizeLimit - the maximum amount of kept appended values
 * valueFormat - the timestamp display format
 */
XyChartImpl.prototype.axisYPropertiesChanged = function(timeScale, sizeLimit, valuesFormat) {
	//webcaLog("axisYPropertiesChanged: " + timeScale + " " + sizeLimit + " " + valuesFormat);
};
 
XyChartImpl.prototype.redraw = function() {
	//webcaLog("redraw: ");
};

XyChartImpl.prototype.resize = function(width, height) {
	//webcaLog("resize: " + width + " " + height);
};

XyChartImpl.prototype.seriesNameChanged = function(index, name) {
	//webcaLog("seriesNameChanged: " + index + " " + name);
};

/* index - he index of the series whose properties are changed
 * color - the string of the color to use
 * type - the display type, "line" or "scatter"
 */
XyChartImpl.prototype.seriesPropertiesChanged = function(index, color, type) {
	//webcaLog("seriesPropertiesChanged: " + index + " " + color + " " + type);
};

/* Replaces the series data with the given values. 
 * 
 * x - an array of x values
 * y - an array of y values
 * 
 * The x and y array sizes must match. x or y can be null, in this case the
 * implementation should replace the missing array with identity.
 */
XyChartImpl.prototype.seriesDataReplaced = function(index, x, y) {
    //webcaLog("seriesDataReplaced: " + index + " " + x + " " + y);
};

/* Appends the series data with the given point (x, y). 
 * x - scalar x value
 * y - scalar y value
 * 
 * x or y can be null, in this case the implementation should replace the
 * missing scalar with incremental value (0, 1, 2, ...).
 */
XyChartImpl.prototype.seriesDataAppended = function(index, x, y) {
    //webcaLog("seriesDataAppended: " + index + " " + x + " " + y);
};
