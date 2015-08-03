
//region Vector constructor.
engine.Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.magnitude = function(){
        return Math.sqrt( this.x*this.x + this.y*this.y );
    };
    this.unitVector = function(){
        return new Vector(this.x/this.length(), this.y/this.length());
    }
};
engine.Vector.zero = new engine.Vector(0,0);
//endregion


//region Point constructor.
engine.Point = function(x, y, viewPort){
    engine.Vector.call(this, x, y);
    var radius = 0.5;
    this.viewPort = (function(){
        return viewPort;
    })();
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.arc(this.x, this.y, radius, 0, 2*Math.PI);
        this.viewPort.fillPath(path, engine.Colour.black);
    }.bind(this));
};
//endregion


//region Line constructor.
engine.Line = function(origin, destination, viewPort){
    this.origin = origin || Vector.zero;
    this.destination = destination || vector.zero;

    this.vector = function(){
        return new engine.Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
    };
    this.length = function(){
        return this.vector().magnitude();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };
    this.viewPort = (function(){
        return viewPort;
    })();
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.moveTo(this.origin.x, this.origin.y);
        path.lineTo(this.destination.x, this.destination.y);
        this.viewPort.drawPath(path, engine.Colour.black);
    }.bind(this));
};
//endregion


//region Rect constructor.
engine.Rect = function(origin, dimensions, surface){
    this.origin = origin || Vector.zero;
    this.dimensions = dimensions || vector.zero;
    this.viewPort = (function(){
        return surface;
    })();
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.rect(this.origin.x, this.origin.y, this.dimensions.x, this.dimensions.y);
        this.viewPort.drawPath(path, engine.Colour.black);
    }.bind(this));
};


engine.Handle = function(x, y, viewPort){
    engine.Point.call(this, x, y, viewPort);
    //TODO: Add event listener for mouse events.
    //Like a point that can be hovered and dragged.
};
//endregion


//region Path constructor.
engine.Path = function(){
    //TODO
    //An array of handles connected by lines.
    //If the line itself is grabbed, create a new handle.
};
//endregion

