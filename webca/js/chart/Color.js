/**
 * This cllas is used to generate random color.  * 
 * 
 * @author <a href="mailto:gasper.jansa@cosylab.com">Gasper Jansa</a>
 * 
 */
Color = function(){	
	this.h = 0;
	this.s = 1;
	this.v = 1;
    
};

Color.prototype.getRandomColor = function () {        
      var color = this.getColor(this.h,this.s,this.v);
      
      this.h = this.h + 60;
      if(this.h > 360){
      	this.h = 0;
      	this.s = this.s - 0.1;
      	if(this.s < 0){
      		this.s = 1;
      		this.v = this.v - 0.1;
      		if(this.v < 0)
      			this.v = 1;
      	}
      }
      return color;
};  

Color.prototype.getColor = function (h,s,v) {        
      var rgb = this.hsvToRGB(h,s,v);
      var rgbString = this.toHexString(rgb.r,rgb.g,rgb.b);
      return rgbString;
};  

Color.prototype.toHexString = function (r,g,b) {        
        var ccc = this.clampColorComponent;
        var rval = new String();
        rval = ("#" + 
                this.toColorPart(ccc(r, 255)) +
                this.toColorPart(ccc(g, 255)) +
                this.toColorPart(ccc(b, 255))
            );
        return rval;
};    

Color.prototype.toColorPart = function(num){
        num = Math.round(num);
        var digits = num.toString(16);
        if (num < 16) {
            return '0' + digits;
        }
        return digits;
};
    
Color.prototype.clampColorComponent = function (v, scale) {
        v *= scale;
        if (v < 0) {
            return 0;
        } else if (v > scale) {
            return scale;
        } else {
            return v;
        }
};

Color.prototype.hsvToRGB = function (hue, saturation, value) {
        if (arguments.length == 1) {
            var hsv = hue;
            hue = hsv.h;
            saturation = hsv.s;
            value = hsv.v;
        }
        var red;
        var green;
        var blue;
        if (saturation === 0) {
            red = 0;
            green = 0;
            blue = 0;
        } else {
            var i = Math.floor(hue / 60);
            var f = (hue) - i;
            var p = value * (1 - saturation);
            var q = value * (1 - (saturation * f));
            var t = value * (1 - (saturation * (1 - f)));
            switch (i) {
                case 1: red = q; green = value; blue = p; break;
                case 2: red = p; green = value; blue = t; break;
                case 3: red = p; green = q; blue = value; break;
                case 4: red = t; green = p; blue = value; break;
                case 5: red = value; green = p; blue = q; break;
                case 6: // fall through
                case 0: red = value; green = t; blue = p; break;
            }
        }
        return {
            r: red,
            g: green,
            b: blue
        };
};

