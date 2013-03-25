/*
 * PHOTOPOP
 */
describe("The photopop", function() {
	var photopop = null;
	
	beforeEach(function(){
		photopop = require("photopop")();
	});

	/* CONSTRUCTOR */
	it("constructor initialises the canvas modifier array.", function() {
		expect(photopop.modifiers instanceof Array).toBe(true);	 
	});

	it("constructor initialises conf with default values for default modifiers.", function() {
		expect(photopop.conf.exposure).toBe(0);
		expect(photopop.conf.contrast).toBe(0);
		expect(photopop.conf.saturation).toBe(0);
		expect(photopop.conf.rotate).toBe(0);
		expect(photopop.conf.scale).toBe(1);
		expect(photopop.conf.cropX).toBe(0);
		expect(photopop.conf.cropY).toBe(0);
		expect(photopop.conf.cropWidth).toBe(0);
		expect(photopop.conf.cropHeight).toBe(0);
	});	
	
	/* CONF */
	it("setConf method gracefully handles null objects.", function() {
		expect(photopop.setConf).not.toThrow();
	});	
	
	it("setConf method updates the conf fields.", function() {
		photopop.modifiers = [];
		photopop.addModifier( MockModifier() );
		
		photopop.setConf({ mock: 5 });
		expect(photopop.conf.mock).toBe(5);
	});
	
	it("setConf method sets only relevant configuration fields.", function() {
		photopop.setConf({
			_exposure: 1,
			test: 1
		});
		
		expect(photopop.conf._exposure).toBeUndefined();	
		expect(photopop.conf.test).toBeUndefined();	
	});
	
	/* MODIFIERS */	
	it("clearModifiers method removes all modifiers and clears the conf object.", function() {
		expect(photopop.modifiers.length).not.toBe(0);
		expect(photopop.conf.exposure).not.toBeUndefined();		
		
		photopop.clearModifiers();
		expect(photopop.modifiers.length).toBe(0);
		expect(photopop.conf.exposure).toBeUndefined();
	});
	
	it("addModifier method adds a modifer and sets default values for it.", function() {
		photopop.clearModifiers();
		expect(photopop.conf.mock).toBeUndefined();
		
		photopop.addModifier( MockModifier() );
		expect(photopop.conf.mock).toBe(1);
	});	

	it("defaultModifier method sets up the default modifiers.", function() {
		while (photopop.modifiers.length > 0){
			photopop.modifiers.pop();
		}
		expect(photopop.modifiers.length).toBe(0);
		photopop.defaultModifiers();
		expect(photopop.modifiers.length).toBe(4);
	});



});

/*
 * SCALE MODIFIER
 */
describe("The scale modifier", function() {

	var scale = null;
	var source = null;
	
	beforeEach(function(){
		scale = require("photopop/src/modifier/Scale")();				
		source = document.createElement('canvas');
		source.getContext('2d').canvas.width = 100;
		source.getContext('2d').canvas.height = 100;
		source.id = "source";
	});
		
	it("test method gracefully handles empty null conf objects", function() {
		expect(scale.test()).toBe(false);
	});	
	
	it("test method returns false when conf.scale === 1", function() {
		expect(scale.test({scale:1})).toBe(false);
		expect(scale.test({scale:0.5})).toBe(true);
		expect(scale.test({scale:1.5})).toBe(true);		
	});

	it("test method expects conf.scale > 0", function() {
		expect(scale.test({scale:0})).toBe(false);
		expect(scale.test({scale:-1})).toBe(false);
		expect(scale.test({scale:0.1})).toBe(true);
	});
	
	it("modify method returns the source canvas when test doesn't pass.", function() {
		expect(scale.modify(source, {scale:0}).id).toBe("source");
		expect(scale.modify(source, {scale:2}).id).not.toBe("source");
	});
	
	it("modify method returns a canvas with dimensions scaled according to the conf.", function() {
		expect(scale.modify(source, {scale:1.5}).getContext('2d').canvas.width).toBe(150);
		expect(scale.modify(source, {scale:2}).getContext('2d').canvas.width).toBe(200);		
	});
	
	it("setConfValue method limits values to between 0.1 and 2.", function() {
		var conf = {};
		scale.setConfValue(conf, "scale", 0);
		expect(conf.scale).toBe(0.1);
		
		scale.setConfValue(conf, "scale", -1);
		expect(conf.scale).toBe(0.1);
		
		scale.setConfValue(conf, "scale", 2.1);
		expect(conf.scale).toBe(2);
	});		
	
});

/*
 * ROTATE MODIFIER
 */
describe("The rotate modifier", function() {

	var rotate = null;
	var source = null;
	
	beforeEach(function(){
		rotate = require("photopop/src/modifier/Rotate")();		
		source = document.createElement('canvas');
		source.getContext('2d').canvas.width = 100;
		source.getContext('2d').canvas.height = 100;
		source.id = "source";
	});
		
	it("test method gracefully handles empty null conf objects", function() {
		expect(rotate.test()).toBe(false);
	});	
	
	it("test method returns false when conf.rotate === 0", function() {
		expect(rotate.test({rotate:0})).toBe(false);
	});

	it("test method expects conf.rotate to be between -180 and 180", function() {
		expect(rotate.test({rotate:-90})).toBe(true);
		expect(rotate.test({rotate:90})).toBe(true);
		expect(rotate.test({rotate:-181})).toBe(false);
		expect(rotate.test({rotate:181})).toBe(false);
	});
	
	it("modify method returns the source canvas when test doesn't pass.", function() {
		expect(rotate.modify(source, {rotate:0}).id).toBe("source");
		expect(rotate.modify(source, {rotate:90}).id).not.toBe("source");
	});
	
	it("setConfValue method limits values to between -180 and 180.", function() {
		var conf = {};
		rotate.setConfValue(conf, "rotate", -181);
		expect(conf.rotate).toBe(-180);

		rotate.setConfValue(conf, "rotate", 181);
		expect(conf.rotate).toBe(180);
	});	
	
});

/*
 * CROP MODIFIER
 */
describe("The crop modifier", function() {

	var crop = null;
	var source = null;
	
	beforeEach(function(){
		crop = require("photopop/src/modifier/Crop")();		
		source = document.createElement('canvas');
		source.getContext('2d').canvas.width = 100;
		source.getContext('2d').canvas.height = 100;
		source.id = "source";
	});
		
	it("test method gracefully handles empty null conf objects", function() {
		expect(crop.test()).toBe(false);
	});	
	
	it("test method returns false when any of the conf.crop[Width|Height] values <= 0", function() {
		expect(crop.test({cropX:0, cropY:0, cropWidth:0, cropHeight:0})).toBe(false);
		expect(crop.test({cropX:10, cropY:10, cropWidth:0, cropHeight:0})).toBe(false);
		expect(crop.test({cropX:10, cropY:10, cropWidth:10, cropHeight:0})).toBe(false);
		expect(crop.test({cropX:10, cropY:10, cropWidth:0, cropHeight:10})).toBe(false);
		expect(crop.test({cropX:10, cropY:10, cropWidth:-10, cropHeight:-10})).toBe(false);
		expect(crop.test({cropX:0, cropY:0, cropWidth:10, cropHeight:10})).toBe(true);
	});

	
	it("modify method returns the source canvas when test doesn't pass.", function() {
		expect(crop.modify(source, {cropX:0, cropY:0, cropWidth:0, cropHeight:0}).id).toBe("source");
		expect(crop.modify(source, {cropX:0, cropY:0, cropWidth:10, cropHeight:10}).id).not.toBe("source");
	});
	
	it("modify method returns a canvas with dimensions scaled according to the conf.", function() {
		expect(crop.modify(source, {cropX:0, cropY:0, cropWidth:10, cropHeight:50}).getContext('2d').canvas.width).toBe(10);
		expect(crop.modify(source, {cropX:0, cropY:0, cropWidth:10, cropHeight:50}).getContext('2d').canvas.height).toBe(50);
	});
	
	it("setConfValue method limits crop values to positive values.", function() {
		var conf = {};
		crop.setConfValue(conf, "cropX", -1);
		expect(conf.cropX).toBe(0);
		
		crop.setConfValue(conf, "cropY", -1);
		expect(conf.cropY).toBe(0);
		
		crop.setConfValue(conf, "cropWidth", -1);
		expect(conf.cropWidth).toBe(0);
		
		crop.setConfValue(conf, "cropHeight", -1);
		expect(conf.cropHeight).toBe(0);
	});	
	
});

/*
 * PIXEL MODIFIER
 */
describe("The pixel modifier", function() {

	var pixel = null;
	var source = null;
	var mockPass = null;
	var mockFail = null;
	
	beforeEach(function(){
		pixel = require("photopop/src/modifier/Pixel")();
		source = document.createElement('canvas');
		source.getContext('2d').canvas.width = 100;
		source.getContext('2d').canvas.height = 100;
		source.id = "source";
		
		mockPass = MockFx();
		mockFail = MockFx();
		spyOn(mockPass, "test").andCallFake(function(cfg) { return true; });
		spyOn(mockFail, "test").andCallFake(function(cfg) { return false; });
		mockPass.id = "pass";
		mockFail.id = "fail";
	});
			
	it("setDefaultConf method delegates to each of the attached fx objects.", function() {
		var mock1 = MockFx();
		var mock2 = MockFx();

		spyOn(mock1, "setDefaultConf").andCallFake(function(cfg) { cfg.mock1=1; });
		spyOn(mock2, "setDefaultConf").andCallFake(function(cfg) { cfg.mock2=2; });
		expect(mock1.setDefaultConf.calls.length).toBe(0);
		expect(mock2.setDefaultConf.calls.length).toBe(0);

		pixel.fx = [];
		pixel.fx.push( mock1 );
		pixel.fx.push( mock2 );

		var conf = {};
		pixel.setDefaultConf(conf);
		expect(mock1.setDefaultConf.calls.length).toBe(1);
		expect(mock2.setDefaultConf.calls.length).toBe(1);		
		expect(conf.mock1).toBe(1);
		expect(conf.mock2).toBe(2);
	});
	
	it("setConfValue method delegates to each of the attached fx objects.", function() {
		var mock1 = MockFx();
		var mock2 = MockFx();

		spyOn(mock1, "setConfValue").andCallFake(function(cfg, name, value) { if (name === 'mock1'){ cfg.mock1=value; } });
		spyOn(mock2, "setConfValue").andCallFake(function(cfg, name, value) { if (name === 'mock2'){ cfg.mock2=value; } });
		expect(mock1.setConfValue.calls.length).toBe(0);
		expect(mock2.setConfValue.calls.length).toBe(0);

		pixel.fx = [];
		pixel.fx.push( mock1 );
		pixel.fx.push( mock2 );

		var conf = {};
		pixel.setConfValue(conf, "mock1", 1);
		expect(mock1.setConfValue.calls.length).toBe(1);
		expect(mock2.setConfValue.calls.length).toBe(1);		
		expect(conf.mock1).toBe(1);
		expect(conf.mock2).toBeUndefined();
		
		pixel.setConfValue(conf, "mock2", 2);
		expect(mock1.setConfValue.calls.length).toBe(2);
		expect(mock2.setConfValue.calls.length).toBe(2);		
		expect(conf.mock1).toBe(1);
		expect(conf.mock2).toBe(2);
	});
	
	it("test method gracefully handles empty null conf objects.", function() {
		expect(pixel.test()).toBe(false);
	});	

	it("test method delegates to each of the attached fx objects until one passes.", function() {
		expect(mockPass.test.calls.length).toBe(0);
		expect(mockFail.test.calls.length).toBe(0);

		pixel.fx = [];
		pixel.fx.push( mockPass );
		pixel.fx.push( mockFail );
		expect(pixel.test({})).toBe(true);
		expect(mockPass.test.calls.length).toBe(1);
		expect(mockFail.test.calls.length).toBe(0);

		pixel.fx = [];
		pixel.fx.push( mockFail );
		pixel.fx.push( mockPass );
		expect(pixel.test({})).toBe(true);
		expect(mockPass.test.calls.length).toBe(2);
		expect(mockFail.test.calls.length).toBe(1);		
	});
		
	it("test method returns false if none of the fx tests pass.", function() {
		pixel.fx = [];
		pixel.fx.push( mockFail );
		pixel.fx.push( mockFail );
		expect(pixel.test({})).toBe(false);
		expect(mockFail.test.calls.length).toBe(2);		
	});
	
	it("test method returns false if no fx are present.", function() {
		pixel.fx = [];
		expect(pixel.test({})).toBe(false);		
	});
	
	
	it("defaultFx method sets up the default fx list.", function() {
		pixel.fx = [];
		pixel.defaultFx();
		expect(pixel.fx.length).toBe(3);
//		expect(pixel.fx[0] instanceof ExposureFx).toBe(true);	 
//		expect(pixel.fx[1] instanceof ContrastFx).toBe(true);	 
//		expect(pixel.fx[2] instanceof SaturationFx).toBe(true);	 
	});
	
/*
	it("getFxFactory method creates the correct objects.", function() {
		expect(pixel.getFxFactory().getExposure() instanceof ExposureFx).toBe(true);
		expect(pixel.getFxFactory().getContrast() instanceof ContrastFx).toBe(true);
		expect(pixel.getFxFactory().getSaturation() instanceof SaturationFx).toBe(true);
	});
*/

	it("getActiveFx method returns an array of fx that pass conf test.", function() {
		pixel.fx = [];
		pixel.fx.push( mockPass );
		pixel.fx.push( mockFail );
		pixel.fx.push( mockFail );
		
		var activeFx = pixel.getActiveFx();
		expect(activeFx.length).toBe(1);
		expect(activeFx[0].id).toBe("pass");
	});

	it("modify method returns the source canvas when all fx are inactive.", function() {
		pixel.fx = [];
		pixel.fx.push( mockPass );
		expect(pixel.modify(source, {}).id).not.toBe("source");
		
		pixel.fx = [];
		pixel.fx.push( mockFail );
		expect(pixel.modify(source, {}).id).toBe("source");
	});

	it("modify method calls apply on every active fx for each pixel on the canvas.", function() {
		spyOn(mockPass, "apply").andCallFake(function(val, conf) { return val; });
		spyOn(mockFail, "apply").andCallFake(function(val, conf) { return val; });
		expect(mockPass.apply.calls.length).toBe(0);
		expect(mockFail.apply.calls.length).toBe(0);

		pixel.fx = [];
		pixel.fx.push( mockPass );
		pixel.fx.push( mockFail );
		pixel.modify(source, {});
		expect(mockPass.apply.calls.length).toBe(10000);
		expect(mockFail.apply.calls.length).toBe(0);
	});
	
});

/*
 * EXPOSURE FX
 */
describe("The ExposureFx", function() {
	var fx = null;

	beforeEach(function(){
		var pixel = require("photopop/src/modifier/Pixel")();
		fx = pixel.getFxFactory().getExposure();
	});	

	it("setDefaultConf method sets exposure to 0.", function() {
		var conf = {};
		fx.setDefaultConf(conf);
		expect(conf.exposure).toBe(0);
	});

	it("setConfValue method limits values to between -100 and 100.", function() {
		var conf = {};
		fx.setConfValue(conf, "exposure", -101);
		expect(conf.exposure).toBe(-100);
		fx.setConfValue(conf, "exposure", 101);
		expect(conf.exposure).toBe(100);
	});

	it("setConfValue method only acts on the exposure field.", function() {
		var conf = {};
		fx.setConfValue(conf, "test", 1);
		expect(conf.test).toBeUndefined();
		expect(conf.exposure).toBeUndefined();
	});

	it("test method gracefully handles null conf objects.", function() {
		expect(fx.test).not.toThrow();
		expect(fx.test()).toBe(false);
	});

	it("test method gracefully handles an undefined exposure value.", function() {
		expect(fx.test({})).toBe(false);
	});

	it("test method returns false when exposure === 0.", function() {
		expect(fx.test({exposure : 0})).toBe(false);
	});

	it("test method returns true when exposure !== 0.", function() {
		expect(fx.test({exposure : -50})).toBe(true);
		expect(fx.test({exposure : 50})).toBe(true);
	});	

	it("apply method returns and {r, g, b, a} object literal.", function() {
		var val = fx.apply({ r : 0, g : 0, b : 0, a : 0 }, {exposure : 1});
		expect(val.r).toBeDefined();
		expect(val.g).toBeDefined();
		expect(val.b).toBeDefined();
		expect(val.a).toBeDefined();
	});
});

/*
 * CONTRAST FX
 */
describe("The ContrastFx", function() {
	var fx = null;

	beforeEach(function(){
		var pixel = require("photopop/src/modifier/Pixel")();
		fx = pixel.getFxFactory().getContrast();
	});

	it("setDefaultConf method sets contrast to 0.", function() {
		var conf = {};
		fx.setDefaultConf(conf);
		expect(conf.contrast).toBe(0);
	});

	it("setConfValue method limits values to between -100 and 100.", function() {
		var conf = {};
		fx.setConfValue(conf, "contrast", -101);
		expect(conf.contrast).toBe(-100);
		fx.setConfValue(conf, "contrast", 101);
		expect(conf.contrast).toBe(100);
	});

	it("setConfValue method only acts on the contrast field.", function() {
		var conf = {};
		fx.setConfValue(conf, "test", 1);
		expect(conf.test).toBeUndefined();
		expect(conf.contrast).toBeUndefined();
	});

	it("test method gracefully handles null conf objects.", function() {
		expect(fx.test).not.toThrow();
		expect(fx.test()).toBe(false);
	});

	it("test method gracefully handles an undefined contrast value.", function() {
		expect(fx.test({})).toBe(false);
	});

	it("test method returns false when contrast === 0.", function() {
		expect(fx.test({contrast : 0})).toBe(false);
	});

	it("test method returns true when contrast !== 0.", function() {
		expect(fx.test({contrast : -50})).toBe(true);
		expect(fx.test({contrast : 50})).toBe(true);
	});

	it("apply method returns and {r, g, b, a} object literal.", function() {
		var val = fx.apply({ r : 0, g : 0, b : 0, a : 0 }, {contrast : 1});
		expect(val.r).toBeDefined();
		expect(val.g).toBeDefined();
		expect(val.b).toBeDefined();
		expect(val.a).toBeDefined();
	});
});

/*
 * SATURATION FX
 */
describe("The SaturationFx", function() {
	var fx = null;
	
	beforeEach(function(){
		var pixel = require("photopop/src/modifier/Pixel")();
		fx = pixel.getFxFactory().getSaturation();
	});	
	
	it("setDefaultConf method sets saturation to 0.", function() {
		var conf = {};
		fx.setDefaultConf(conf);
		expect(conf.saturation).toBe(0);
	});

	it("setConfValue method limits values to between -100 and 100.", function() {
		var conf = {};
		fx.setConfValue(conf, "saturation", -101);
		expect(conf.saturation).toBe(-100);
		fx.setConfValue(conf, "saturation", 101);
		expect(conf.saturation).toBe(100);
	});

	it("setConfValue method only acts on the saturation field.", function() {
		var conf = {};
		fx.setConfValue(conf, "test", 1);
		expect(conf.test).toBeUndefined();
		expect(conf.saturation).toBeUndefined();
	});

	it("test method gracefully handles null conf objects.", function() {
		expect(fx.test).not.toThrow();
		expect(fx.test()).toBe(false);
	});

	it("test method gracefully handles an undefined saturation value.", function() {
		expect(fx.test({})).toBe(false);
	});

	it("test method returns false when saturation === 0.", function() {
		expect(fx.test({saturation : 0})).toBe(false);
	});

	it("test method returns true when saturation !== 0.", function() {
		expect(fx.test({saturation : -50})).toBe(true);
		expect(fx.test({saturation : 50})).toBe(true);
	});

	it("apply method returns and {r, g, b, a} object literal.", function() {
		var val = fx.apply({ r : 0, g : 0, b : 0, a : 0 }, {exposure : 1});
		expect(val.r).toBeDefined();
		expect(val.g).toBeDefined();
		expect(val.b).toBeDefined();
		expect(val.a).toBeDefined();
	});	
	
});
