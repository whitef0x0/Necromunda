

engine.guiLayer = new engine.WorldView("guiLayer", {zIndex:1});

var point = new engine.Point(4, 3, engine.guiLayer);
console.log(point.magnitude());

var handle = new engine.Handle(11, 12, engine.guiLayer);
console.log(handle.magnitude());

console.log(handle.viewPort.name);