"use strict;";
module.exports = Crop;

/**
Photopop modifier to crop a canvas. Looks for conf values cropX, cropY, cropWidth and cropHeight. None of the them 
should be negative values and the width/height values should be positive for it to actually crop.
 
@constructor
@author scottcorbett
 */
function Crop(){
	if (!(this instanceof Crop)) return new Crop();
	
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');	
}

/**
Sets the default fields for cropping (cropX, cropY, cropWidth and cropHeight) to 0.
@param {object} conf object to set values on
*/
Crop.prototype.setDefaultConf = function(conf){
	conf.cropX = 0;
	conf.cropY = 0;
	conf.cropWidth = 0;
	conf.cropHeight = 0;
};

/**
Sets the conf object for a field if the field is one of (cropX, cropY, cropWidth or cropHeight). 
Negative values are set to 0.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
Crop.prototype.setConfValue = function(conf, name, value){
	if (name === "cropX" || name === "cropY" || name === "cropWidth" || name === "cropHeight"){
		conf[name] = Math.max(0, value);
	}
};

/**
Test conf to determine whether to apply this modifier.		
@param {object} conf conf to check.
@return {boolean} whether modify should run.
*/
Crop.prototype.test = function(conf){
	if (!conf){ return false; }
	return (conf.cropWidth > 0 && conf.cropHeight > 0); 
};

/**
Crop a source canvas according to the conf passed in. If test(conf) fails no modification is made 
and the original canvas is passed back.
@param {Canvas} source Source canvas to manipulate.
@param {object} conf Conf to use when running.
@return {Canvas} either the source or modified canvas depending of the conf.
*/
Crop.prototype.modify = function(source, conf){
	if (!this.test(conf)){
		return source;
	}
	
	var sourceCtx = source.getContext('2d');	
	var width = conf.cropWidth;
	var height = conf.cropHeight;
		
	this.context.canvas.width = width;
	this.context.canvas.height = height;
	var data = sourceCtx.getImageData(conf.cropX, conf.cropY, width, height);		
	this.context.putImageData(data, 0, 0);	
	
	return this.canvas;
};