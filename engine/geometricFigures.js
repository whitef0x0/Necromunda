
//region Vector constructor.
eng.Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.magnitude = function(){
        return Math.sqrt( this.x*this.x + this.y*this.y );
    };
    this.unitVector = function(){
        return new Vector(this.x/this.length(), this.y/this.length());
    }
};
eng.Vector.zero = new eng.Vector(0, 0);
//endregion


//region Point constructor.
eng.Point = function(x, y, viewPort){
    eng.Vector.call(this, x, y);
    this.radius = 0.5;
    this.colour = eng.Colour.world.passive;
    this.viewPort = (function(){
        return viewPort;
    })();
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        this.viewPort.fillPath(path, this.colour);
    }.bind(this));
};
//endregion


//region A point that interacts with the mouse, and can be dragged
eng.ControlPoint = function(x, y, viewPort){
    eng.Point.call(this, x, y, viewPort);


    document.addEventListener("mousemove" + this.viewPort.name, function(){
        var path = new Path2D();
        //path.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        path.rect(this.x - 0.5, this.y - 0.5, 1, 1);

        if(viewPort.isMouseInPath(path)) this.colour = eng.Colour.world.focused;
        else this.colour = eng.Colour.world.passive;

    }.bind(this));

};
//endregion


//region Line constructor.
eng.Line = function(origin, destination, viewPort){
    this.origin = origin || Vector.zero;
    this.destination = destination || vector.zero;

    this.vector = function(){
        return new eng.Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
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
        this.viewPort.drawPath(path, eng.Colour.black);
    }.bind(this));
};
//endregion


//region Rect constructor.
eng.Rect = function(origin, dimensions, surface){
    this.origin = origin || Vector.zero;
    this.dimensions = dimensions || vector.zero;
    this.viewPort = (function(){
        return surface;
    })();
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.rect(this.origin.x, this.origin.y, this.dimensions.x, this.dimensions.y);
        this.viewPort.drawPath(path, eng.Colour.black);
    }.bind(this));
};
//endregion




//region Path constructor.
eng.Path = function(){
    //TODO
    //An array of handles connected by lines.
    //If the line itself is grabbed, create a new handle.
};
//endregion

