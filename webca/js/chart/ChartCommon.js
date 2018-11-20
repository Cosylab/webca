var ChartCommon = {

	init: function(chart) {
		chart.xAxisStyleFormat = new Date().getTime();
	},

    setChartDivSize: function(chart) {
        if (!chart.chartDiv.style.width) {
        	if (!chart.parentNode || !chart.parentNode.width
        	        || chart.parentNode.width == "") {
    			chart.chartDiv.style.width = chart.defaultWidth + 'px';		
        	}
        }

        if (!chart.chartDiv.style.height) {
            // check if height in % or not set
        	if (!chart.parentNode || !chart.parentNode.height
        	        || chart.parentNode.height == "" || chart.parentNode.height.indexOf('%') != -1) {
    			chart.chartDiv.style.height = chart.defaultHeight + 'px';		
        	} else {
     	    	chart.chartDiv.style.height = chart.parentNode.height + (chart.parentNode.height.indexOf('px') == -1 ? 'px' : '');
        	}
        }
    },

	parseXAxisStyle: function(chart) {
	    // Format is style(time_format).
	    if (!ChartCommon.xAxisStyleFormat) {
	    	ChartCommon.xAxisStyleFormat = new RegExp("^([^(]+)(?:[(]([^)]*)[)])?$");
	    }
	    var result = ChartCommon.xAxisStyleFormat.exec(chart.xAxisStyle);
	    if (result != null) {
	    	chart.xAxisStyle = result[1];
	    	if (result[2] != null) {
	    	    chart.xAxisStyleFormat = result[2];
	    	}
	    }
	},

	getXAxisLabel: function(time, format) {
	    if (typeof(format) == "number") {
	    	return (time - format) / 1000;
	    } else {
    	    if (!ChartCommon.date) {
 	        	ChartCommon.date = new Date();
	        }
	        ChartCommon.date.setTime(time);
	        return dateFormat(ChartCommon.date, format);
	    }
	},

	clipValues: function(chart) {
		
        var pvValues = null;
        var timestamps = null;
		
		if (chart.pvTimestamps) {
			
    		var currentTimestamp = null;
			var timestamp = null;
			for (var s = 0; s < chart.pvTimestamps.length; s++) {
    			timestamps = chart.pvTimestamps[s];
			    if (timestamps && timestamps.length) {
					timestamp = timestamps[timestamps.length - 1];
					if (currentTimestamp == null || currentTimestamp < timestamp) {
						currentTimestamp = timestamp;
					}
				}
			}
			if (currentTimestamp) {
    			var clipTimestamp = currentTimestamp - chart.numberOfpoints * 1000;
    			
    			var i = 0;
    			var size = 0;
			 
	    		for (var s = 0; s < chart.pvTimestamps.length; s++) {
	    			timestamps = chart.pvTimestamps[s];
                 	pvValues = chart.pvValues[s];
                 	
				    if (timestamps && timestamps.length && pvValues && pvValues.length) {
				    	
				    	i = 0;
				    	while (i < timestamps.length && timestamps[i] < clipTimestamp) {
				    		i++;
				    	}
				    	size = timestamps.length - i; 
				    	
				    	if (i > 0) {
				    	    ChartCommon.trimArray(timestamps, size);
				    	    ChartCommon.trimArray(pvValues, size);
                            chart.pvUpdated[s] = true;
				    	}
				    }
			    }
			}
			
		} else {
			for (var s = 0; s < chart.pvValues.length; s++) {
             	pvValues = chart.pvValues[s];
				if (pvValues && pvValues.length) {
					ChartCommon.trimArray(pvValues, chart.numberOfpoints);
                    chart.pvUpdated[s] = true;
				}
			}
		}
	},

	trimArray: function(array, size) {
		var trimSize = array.length - size;
		if (trimSize > 0) {
            for (var i = 0; i < array.length - trimSize; i++) {
                array[i] = array[i + trimSize];
 			}
            for (var i = 0; i < trimSize; i++) {
     		 array.pop();
            }
		}
	},

	getPvNames: function(chart) {

	    var pvNamesTable = [];
	    var i;

		for(var n = 0; n < chart.pvNames.length; n++) {
			if (chart.pvNames[n].PVName != '') {
	     	    i = chart.findIndexInArray(chart.pvNames[n].PVName, chart.names);	
				if (i >= 0) {
		    	    pvNamesTable.push([chart.resolvedNames[i]]);
		        }
			}
		}
	    return pvNamesTable;
	},
	
	getPvNamesXYOrIndexed: function(chart) {

	    var pvNamesTable = [];
	    var i;
	    var x;	 		
	    var y;
	    var twoD = false;	
	
		for(var n = 0; n < chart.pvNames.length; n++) {
			if (chart.pvNames[n].xName == '' && chart.pvNames[n].yName != '') {
				
	     	    i = chart.findIndexInArray(chart.pvNames[n].yName, chart.pvIndexNames);	
				if (i >= 0) {
		    	    pvNamesTable.push([chart.resolvedNames[i]]);
		        }
			} else if (chart.pvNames[n].xName != '' && chart.pvNames[n].yName != '') {
	    	    
	    	    x = chart.findIndexInArray(chart.pvNames[n].xName, chart.pvXNames);	 		
		        y = chart.findIndexInArray(chart.pvNames[n].yName, chart.pvYNames);	
				
			    if (x >= 0 && y >= 0) {
		        	pvNamesTable.push([chart.resolvedPVXNames[x], chart.resolvedPVYNames[y]]);
	    	    	twoD = true;
		        }
			}
		}
	    
	    // Return two columns if at least one plot is xy, otherwise one. 
	    if (twoD) {
	    	for (var i = 0; i < pvNamesTable.length; i++) {
	    		if (pvNamesTable[i].length == 1) {
	    			pvNamesTable[i] = ['', pvNamesTable[i][0]]; 
	    		}
	    	}
	    }
	    return pvNamesTable;
	}
};
