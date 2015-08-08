define(function (require) {
    
    var eng = {};
    eng.Colour = require('./colour');
   	eng.Geo = require('./geometricFigures');
   	eng.worldView = require('./worldView').view;

	//region Math and number related functions and methods.
	
	//endregion

	return eng;
});
