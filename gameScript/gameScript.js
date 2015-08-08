define(['../engine/engine'],function (engine) {
	// var engine = require('engine/engine');

	var game = {};
	game.worldView = new engine.worldView('guiLayer', {zIndex:1});
	console.log(game.worldView)

	try{
		var rect = new engine.Geo.Rect(game.worldView, {x: -50, y: -50}, {x: 100, y: 100});
	}catch(err){
		console.log(err);
	}
	var path = new engine.Geo.Path(game.worldView);

	path.appendPoint(new engine.Geo.PathPoint(game.worldView, -50, -50));
	path.appendPoint(new engine.Geo.PathPoint(game.worldView, 0, 0));
	path.appendPoint(new engine.Geo.PathPoint(game.worldView, 50, 50));
});