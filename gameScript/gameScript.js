
var game = {};
game.worldView = new eng.WorldView("guiLayer", {zIndex:1});

var handleA = new eng.Handle(-50, -50, game.worldView);

var point = new eng.Point(0, 0, game.worldView);
console.log(point.magnitude());

var handleB = new eng.Handle(50, 50, game.worldView);
console.log(handleB.magnitude());

var line = new eng.Line({x:-100, y:-100}, {x:100, y:100}, game.worldView);
console.log(line.length());

var rect = new eng.Rect({x:-50,y:-50}, {x:100,y:100}, game.worldView);

document.addEventListener("mousemove" + game.worldView.name, function(event){console.log("Coordinates X: " + event.worldX + " Y: " + event.worldY)});