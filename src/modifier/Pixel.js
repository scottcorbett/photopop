"use strict;";
module.exports = Pixel;

/**
Photopop modifier to do per pixel modifications. Different fx objects can be added to achieve different results. Each of 
the attached fx will be called when setting conf and modifying the canvas. 
 
@constructor
@author scottcorbett
 */
function Pixel(){
	if (!(this instanceof Pixel)) return new Pixel();
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	this.fx = [];
	this.defaultFx();
}

/**
Delegates to each the attached fx objects to set default conf.
@param {object} object to set values on
*/
Pixel.prototype.setDefaultConf = function(conf){	
	for (var i=0;i<this.fx.length; i++){
		this.fx[i].setDefaultConf(conf);
	}
};

/**
Delegates to each the attached fx objects to set conf values.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
Pixel.prototype.setConfValue = function(conf, name, value){
	for (var i=0;i<this.fx.length; i++){
		this.fx[i].setConfValue(conf, name, value);
	}
};

/**
Delegates to each the attached fx objects to determine whether 
to apply this modifier.		
@param {object} conf conf to check.
@return {boolean} whether modify should run.
*/
Pixel.prototype.test = function(conf){
	if (!conf){ return false; }
	
	for (var i=0;i<this.fx.length; i++){
		if (this.fx[i].test(conf)){
			return true;
		}
	}
	
	return false;
};

/**
Sets up the default fx objects (exposure, contrast & saturation)
*/
Pixel.prototype.defaultFx = function(){
	this.fx.push(this.getFxFactory().getExposure());
	this.fx.push(this.getFxFactory().getContrast());
	this.fx.push(this.getFxFactory().getSaturation());
};

/**
Get an array of fx objects that are active according to the conf.		
@param {object} conf conf to check.
@return {array} an array of fx objects.
*/
Pixel.prototype.getActiveFx = function(conf){
    var activeFx = [];
	for (var i=0;i<this.fx.length; i++){
		if (this.fx[i].test(conf)){
			activeFx.push(this.fx[i]);
		}
	}
	return activeFx;
};

/**
Modify a source canvas according to the conf passed in and attached fx objects. If none of the 
attached fx objects are active the source canvas will be returned. 
@param {Canvas} source Source canvas to manipulate.
@param {object} conf Conf to use when running.
@return {Canvas} either the source or modified canvas depending of the conf.
*/
Pixel.prototype.modify = function(source, conf){
	if (!this.test(conf)){
		return source;
	}	

	var sourceCtx = source.getContext('2d');
	var width=sourceCtx.canvas.width;
	var height=sourceCtx.canvas.height;
    var img = sourceCtx.getImageData(0, 0, width, height);
    
    this.context.canvas.width = width;
    this.context.canvas.height = height;
	this.context.clearRect(0, 0, sourceCtx.canvas.width, sourceCtx.canvas.width);
    
    var activeFx = this.getActiveFx(conf);
   
	for (var x = 0; x<width; x++){
		for (var y = 0; y<height; y++){
			var val = getPixel(img.data, width, x, y);
			
			for (var i=0;i<activeFx.length; i++){
				val = activeFx[i].apply(val, conf);
			}
			
			setPixel(img.data, width, x, y, val); 
		}
	}
    
	this.context.putImageData(img, 0, 0);
	return this.canvas;
};

/**
Simple factory to create the default fx object. 
@return {object} an object literal with methods to instantiate fx objects.
@example 
	pixel.getFxFactory().getExposure();
	pixel.getFxFactory().getContrast();
	pixel.getFxFactory().getSaturation();
*/
Pixel.prototype.getFxFactory = function(){
	return {
		getExposure: function(){ return ExposureFx(); },
		getSaturation: function(){ return SaturationFx(); },
		getContrast: function(){ return ContrastFx(); }
	};
};

/**
Exposure fx object. Looks for the conf value exposure which should be between -100 and 100 for it 
to take affect. An exposure value of 0 will stop the fx.   
 
@constructor
@author scottcorbett
 */
function ExposureFx () { 
	if (!(this instanceof ExposureFx)) return new ExposureFx();	
}

/**
Sets the default exposure field to 0.
@param {object} object to set values on
*/
ExposureFx.prototype.setDefaultConf = function(conf){ 
	conf.exposure = 0;
};

/**
Sets exposure on conf if the field is exposure. 
Expects a number between -100 and 100. Anything outside of that will be brought back into range.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
ExposureFx.prototype.setConfValue = function(conf, name, value){
	if (name === "exposure"){
		conf.exposure = Math.min(100, Math.max(-100, value));
	}
};

/**
Test conf to determine whether to apply this fx. Returns false if exposure
is undefined or 0.	
@param {object} conf conf to check.
@return {boolean} whether fx should run.
*/
ExposureFx.prototype.test = function(conf){
	if (!conf){ return false; }
	return (conf.exposure || 0) !== 0; 
};

/**
Changes the exposure level of the value passed in according to the conf supplied.
@param {object} val An {r,g,b,a} object of the value to be changed.
@param {object} conf Conf to use.
@return {object} modified version of the value.
*/
ExposureFx.prototype.apply = function(val, conf){ 
	var exp = (conf.exposure*2) * -1;
	var minMax = (exp < 0 ? Math.max : Math.min);
	var limit = (exp < 0 ? 0 : 255);

	return getColor(
		minMax(val.r - exp, limit),
		minMax(val.g - exp, limit),
		minMax(val.b - exp, limit),
		val.a
	);	
};

/**
Contrast fx object. Looks for the conf value contrast which should be between -100 and 100 for it 
to take affect. A contrast value of 0 will stop the fx.   
 
@constructor
@author scottcorbett
 */
function ContrastFx () { 
	if (!(this instanceof ContrastFx)) return new ContrastFx();	
}

/**
Sets the default contrast field to 0.
@param {object} object to set values on
*/
ContrastFx.prototype.setDefaultConf = function(conf){ 
	conf.contrast = 0;
};

/**
Sets contrast on conf if the field is contrast. 
Expects a number between -100 and 100. Anything outside of that will be brought back into range.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
ContrastFx.prototype.setConfValue = function(conf, name, value){
	if (name === "contrast"){
		conf.contrast = Math.min(100, Math.max(-100, value));
	}
};

/**
Test conf to determine whether to apply this fx. Returns false if contrast
is undefined or 0.	
@param {object} conf conf to check.
@return {boolean} whether fx should run.
*/
ContrastFx.prototype.test = function(conf){ 
	if (!conf){ return false; }
	return (conf.contrast || 0) !== 0; 
};

/**
Changes the contrast of the value passed in according to the conf supplied.
@param {object} val An {r,g,b,a} object of the value to be changed.
@param {object} conf Conf to use.
@return {object} modified version of the value.
*/
ContrastFx.prototype.apply = function(val, conf){ 
	var contrast = conf.contrast / 2;
	var v = 255 - Math.max(val.r, val.g, val.b);

	var r = val.r - ((v / 100) * contrast);  
	var g = val.g - ((v / 100) * contrast);  
	var b = val.b - ((v / 100) * contrast);  
	
	return getColor(r, g, b, val.a);	
};

/**
Saturation fx object. Looks for the conf value saturation which should be between -100 and 100 for it 
to take affect. A saturation value of 0 will stop the fx.   
 
@constructor
@author scottcorbett
 */
function SaturationFx () { 
	if (!(this instanceof SaturationFx)) return new SaturationFx();	
}

/**
Sets the default saturation field to 0.
@param {object} object to set values on
*/
SaturationFx.prototype.setDefaultConf = function(conf){ 
	conf.saturation = 0;
};

/**
Sets saturation on conf if the field is saturation. 
Expects a number between -100 and 100. Anything outside of that will be brought back into range.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
SaturationFx.prototype.setConfValue = function(conf, name, value){
	if (name === "saturation"){
		conf.saturation = Math.min(100, Math.max(-100, value));
	}
};

/**
Test conf to determine whether to apply this fx. Returns false if saturation
is undefined or 0.	
@param {object} conf conf to check.
@return {boolean} whether fx should run.
*/
SaturationFx.prototype.test = function(conf){ 
	if (!conf){ return false; }
	return (conf.saturation || 0) !== 0; 
};

/**
Changes the saturation of the value passed in according to the conf supplied.
@param {object} val An {r,g,b,a} object of the value to be changed.
@param {object} conf Conf to use.
@return {object} modified version of the value.
*/
SaturationFx.prototype.apply = function(val, conf){ 
	var sat = conf.saturation * -1;
	var v = Math.max(val.r, val.g, val.b);
	
	return getColor(
		val.r - (((val.r - v) / 100) * sat),
		val.g - (((val.g - v) / 100) * sat),
		val.b - (((val.b - v) / 100) * sat),
		val.a
	);	
};

/*
 * CANVAS UTILS
 */

function getColor(_r, _g, _b, _a){
	return {
		r : Math.round(_r),
		g : Math.round(_g),
		b : Math.round(_b),
		a : Math.round(_a)
	};
}

function getPixelIndex(w, x, y){
	return (y*w*4)+(x*4);
}

function setPixel(arr, w, x, y, val){
	var i = getPixelIndex(w, x, y);	
	arr[i] = val.r;
	arr[i+1] = val.g;
	arr[i+2] = val.b;
	arr[i+3] = val.a;		
}

function getPixel(arr, w, x, y){
	var i = getPixelIndex(w, x, y);
	return getColor(arr[i], arr[i + 1], arr[i + 2], arr[i + 3]);
}

