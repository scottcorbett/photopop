/** 
@module photopop
*/
"use strict;";
module.exports = PhotoPop;

/**
A module to manipulate images. Modifiers can be added to affect the image. The default ones allow scaling, pixel 
based manipulation, rotating and cropping images.
 
@constructor
@alias module:photopop
@param {object} [conf] Object literal configuration object with all optional fields. 
@author scottcorbett
@example
new require("photopop")({       
	exposure : 25,
	contrast : 25,
	saturation : -100,
	scale: 0.5 
});
 */
function PhotoPop(conf){
	if (!(this instanceof PhotoPop)) return new PhotoPop(conf);
  
	this.conf = {};
	
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.buffer = document.createElement('canvas');
	this.bufferCtx = this.buffer.getContext('2d');
	
	this.modifiers = [];
	this.defaultModifiers();
}

/**
Sets the base image used for manipulation.			
@param {Image} source Source image to manipulate.
@return {photopop} self
*/
PhotoPop.prototype.withImg = function(source){
	this.bufferCtx.canvas.width = source.naturalWidth;
	this.bufferCtx.canvas.height = source.naturalHeight;
	this.bufferCtx.drawImage(source, 0, 0);	
	return this;
};

/**
Get a data url for the modified image.			
@return {String} Data url for the modified image
*/
PhotoPop.prototype.toDataUrl = function(){
	return this.canvas.toDataURL();
};

/**
Sets configuration used for drawing, expects an object in the same format as the constructor conf.
@param {object} conf Object literal configuration object with all optional fields. Delegates to each
of the modifiers to do the actual setting.
@return {photopop} self
*/
PhotoPop.prototype.setConf = function(conf){
	var name = "";
	for (name in conf){
		for (var i=0; i<this.modifiers.length; i++){
			var modifier = this.modifiers[i];
			modifier.setConfValue(this.conf, name, conf[name]);
		}		
	}
	return this;
};

/**
Draws the image, perfoming any modifications specified in the configuration.			
@param {object} [conf] Object literal configuration object with all optional fields.
@return {photopop} self
*/
PhotoPop.prototype.draw = function(conf){
	this.setConf(conf);

	var source = this.buffer;
	for (var i=0; i<this.modifiers.length; i++){
		var modifier = this.modifiers[i];
		if (modifier.test(this.conf)){
			source = modifier.modify(source, this.conf);
		}
	}
	
	sourceCtx = source.getContext('2d');
	this.context.canvas.width = sourceCtx.canvas.width;
	this.context.canvas.height = sourceCtx.canvas.height;
	this.context.drawImage(source, 0, 0); 

	return this;
};

/**
Draws the histogram for the modified image.
@param {object} [conf] Object literal configuration object for the histogram. See histogram docs for details.
@return {String} the data url for the histogram representing the modified image.
*/
PhotoPop.prototype.getHistogram = function(conf){
	var histogram = require("histogram")({width:300, height:150});	
	
	var width=this.context.canvas.width;
	var height=this.context.canvas.height;
    var img = this.context.getImageData(0, 0, width, height);
      
    histogram.clearRGB();
	for (var i=0; i<img.data.length; i+=4){
		histogram.setRGB({ 
			r : img.data[i],
			g : img.data[i+1],
			b : img.data[i+2],
			a : img.data[i+3]
		});
	}	
	
	histogram.setConf(conf);
	return histogram.draw();
};

/**
Removes all the modifiers and clears the conf object. 
*/
PhotoPop.prototype.clearModifiers = function(){
	this.modifiers = [];
	this.conf = {};
};

/**
Adds a modifier to the list and updates the conf object with default values for it.
@param {object} modifier Modifier object to be added to the list.
*/
PhotoPop.prototype.addModifier = function(modifier){
	this.modifiers.push(modifier);
	modifier.setDefaultConf(this.conf);
};

/**
Sets up the default modifiers (scale, pixel, rotate & crop).
*/
PhotoPop.prototype.defaultModifiers = function(){
	this.addModifier(this.getModifierFactory().getScale());
	this.addModifier(this.getModifierFactory().getPixel());
	this.addModifier(this.getModifierFactory().getRotate());			
	this.addModifier(this.getModifierFactory().getCrop());
};

/**
Simple factory to create the default modifiers. 
@return {object} an object literal with methods to instantiate modifiers.
@example 
	photopop.getModifierFactory().getScale();
	photopop.getModifierFactory().getRotate();
	photopop.getModifierFactory().getCrop();
	photopop.getModifierFactory().getPixel();
*/
PhotoPop.prototype.getModifierFactory = function(){
	return {
		getScale : function(){ return require("./modifier/Scale")(); },
		getRotate : function(){ return require("./modifier/Rotate")(); },
		getCrop : function(){ return require("./modifier/Crop")(); },
		getPixel : function(){ return require("./modifier/Pixel")(); }
	};
};
