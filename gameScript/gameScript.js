
var game = {};

game.worldView = new eng.WorldView("guiLayer", {zIndex:1});

var rect = new eng.Rect(game.worldView, {x: -50, y: -50}, {x: 100, y: 100});


var path = new eng.Path(game.worldView);

path.appendPoint(new eng.PathPoint(game.worldView, -50, -50));
path.appendPoint(new eng.PathPoint(game.worldView, 0, 0));
path.appendPoint(new eng.PathPoint(game.worldView, 50, 50));
