
var game = {};

game.worldView = new eng.WorldView("guiLayer", {zIndex:1});

var rect = new eng.Rect({x:-50,y:-50}, {x:100,y:100}, game.worldView);


var path = new eng.Path(game.worldView);

path.appendPoint(new eng.ControlPoint(-50, -50, game.worldView));
path.appendPoint(new eng.ControlPoint(0, 0, game.worldView));
path.appendPoint(new eng.ControlPoint(50, 50, game.worldView));

//var combatant = new eng.Combatant(game.worldView);
var x = {value: 7};
var y = x;
x.value += 2;
console.log(y.value);