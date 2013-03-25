"use strict;";
module.exports = Rotate;

/**
Photopop modifier to rotate a canvas. Looks for the conf value rotate which should be degrees between -180 and 180 for the
modifier to take affect. The canvas change will increase to fit the rotated image. 
 
@constructor
@author scottcorbett
 */
function Rotate(){
	if (!(this instanceof Rotate)) return new Rotate();

	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
}

/**
Sets the default rotate field to 0.
@param {object} object to set values on
*/
Rotate.prototype.setDefaultConf = function(conf){
	conf.rotate = 0;
};

/**
Sets rotate on conf if the field is rotate. 
Expects a number between -180 and 180. Anything outside of that will be brought back into range.
@param {object} conf conf object to set.
@param {String} name name of field being set.
@param {any} value value to set.
*/
Rotate.prototype.setConfValue = function(conf, name, value){
	if (name === "rotate"){
		conf.rotate = Math.min(180, Math.max(-180, value));
		return true;
	}
	return false;
};

/**
Test conf to determine whether to apply this modifier.		
@param {object} conf conf to check.
@return {boolean} whether modify should run.
*/
Rotate.prototype.test = function(conf){
	if (!conf){ return false; }
	return conf.rotate !== 0 && conf.rotate > -181 && conf.rotate < 181; 
};

/**
Rotate a source canvas according to the conf passed in. The canvas will change size to fit the 
rotated image. If test(conf) fails no modification is made and the original canvas is passed back.
@param {Canvas} source Source canvas to manipulate.
@param {object} conf Conf to use when running.
@return {Canvas} either the source or modified canvas depending of the conf.
*/
Rotate.prototype.modify = function(source, conf){
	if (!this.test(conf)){
		return source;
	}	
	
	var sourceCtx = source.getContext('2d');	

	var angleInRadians = conf.rotate * (Math.PI/180);
	
	var w=sourceCtx.canvas.width;
	var h=sourceCtx.canvas.height;
	var x=w/2;
	var y=h/2;
	
	// rect for each rotated point
	var r = {
		tl: rotateCoord(0, h, x, y, (angleInRadians*-1)),
		tr: rotateCoord(w, h, x, y, (angleInRadians*-1)),
		bl: rotateCoord(0, 0, x, y, (angleInRadians*-1)),
		br: rotateCoord(w, 0, x, y, (angleInRadians*-1))
	};
	
	// states on the rotated points
	var dimensions = {
		minX : Math.min(r.tl.x, r.tr.x, r.bl.x, r.br.x),
		maxX : Math.max(r.tl.x, r.tr.x, r.bl.x, r.br.x),
		minY : Math.min(r.tl.y, r.tr.y, r.bl.y, r.br.y),
		maxY : Math.max(r.tl.y, r.tr.y, r.bl.y, r.br.y)
	};
	
	// resize the canvas
	w = dimensions.maxX - dimensions.minX;
	h = dimensions.maxY - dimensions.minY;				
	this.context.canvas.width=w;
	this.context.canvas.height=h;
	
	x=w/2;
	y=h/2;			
	var xOffset = -x + (Math.min(dimensions.minX, 0)*-1);
	var yOffset = -y + (Math.min(dimensions.minY, 0)*-1);
	
	// do rotate
	this.context.clearRect(0, 0, w, h);
	this.context.translate(x,y);
	this.context.rotate(angleInRadians);
	this.context.drawImage(source,xOffset,yOffset);
	this.context.rotate(-angleInRadians);
	this.context.translate(-x,-y);	
	
	return this.canvas;
};

function rotateCoord(x, y, ox, oy, angle){
	return {
		x: Math.round(ox+(x-ox)*Math.cos(angle)+(y-oy)*Math.sin(angle)),
		y: Math.round(oy-(x-ox)*Math.sin(angle)+(y-oy)*Math.cos(angle))
	};
}