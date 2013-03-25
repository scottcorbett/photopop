function MockModifier(){
	return {
		setDefaultConf : function(conf){ conf.mock = 1; },
		setConfValue : function(conf, name, value){ conf.mock = value; },
		test : function(conf){ return true; },
		modify : function(source, conf){ return source; }
	};
}

function MockFx(){
	return {
		setDefaultConf : function(conf){ conf.mock=1; },
		setConfValue : function(conf, name, value){ if (name === 'mock'){ conf.mock=value; }},
		test : function(conf){ return true; }, 
		apply : function(ref, conf){ return ref; }
	};
}