"use strict;";
module.exports = Scale;

/**
Photopop modifier to scale a canvas. Looks for the conf value scale which should be between 0.1 and 2 for the
modifier to take affect.
 
@constructor
@author scottcorbett
 */
function Scale(){
	if (!(this instanceof Scale)) return new Scale();
	
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	
	this.scaled = document.createElement('canvas');
	this.scaledCtx = this.scaled.getContext('2d');
}

/**
Sets the default scale field to 1.
@param {object} object to set values on
*/
Scale.prototype.setDefaultConf = function(conf){
	conf.scale = 1;
};

/**
Sets scale on conf if the field is scale. 
Expects a number between 0.1 and 2. Anything outside of that will be brought back into range.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
Scale.prototype.setConfValue = function(conf, name, value){
	if (name === "scale"){
		conf.scale = Math.min(2, Math.max(0.1, value));
	}
};

/**
Test conf to determine whether to apply this modifier.		
@param {object} conf conf to check.
@return {boolean} whether modify should run.
*/
Scale.prototype.test = function(conf){
	if (!conf){ return false; }
	return conf.scale > 0 && conf.scale != 1; 
};

/**
Scale a source canvas according to the conf passed in. If test(conf) fails no modification is made 
and the original canvas is passed back.
@param {Canvas} source Source canvas to manipulate.
@param {object} conf Conf to use when running.
@return {Canvas} either the source or modified canvas depending of the conf.
*/
Scale.prototype.modify = function(source, conf){
	if (!this.test(conf)){
		return source;
	}
	
	var sourceCtx = source.getContext('2d');
	var scaledWidth = sourceCtx.canvas.width * conf.scale;
	var scaledHeight = sourceCtx.canvas.height * conf.scale;
	
	this.scaledCtx.canvas.width = Math.max(scaledWidth, sourceCtx.canvas.width);
	this.scaledCtx.canvas.height = Math.max(scaledHeight, sourceCtx.canvas.height);
	this.scaledCtx.drawImage(source, 0, 0);
	this.scaledCtx.scale(conf.scale, conf.scale);
	this.scaledCtx.drawImage(this.scaled, 0, 0);
	
	this.context.canvas.width = scaledWidth;
	this.context.canvas.height = scaledHeight;
	this.context.putImageData(this.scaledCtx.getImageData(0, 0, scaledWidth, scaledHeight), 0, 0);	
	
	return this.canvas;
};