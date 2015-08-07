
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
eng.Point = function(viewPort, x, y, radius, colour ){
    this.viewPort = viewPort;
    eng.Vector.call(this, x, y);
    this.radius = radius || 0.5;
    this.colour = colour || eng.Colour.world.passive;
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        this.viewPort.fillPath(path, this.colour);
    }.bind(this));
};
//endregion


//region A point that interacts with the mouse, and can be dragged
eng.ControlPoint = function(x, y, viewPort){
    eng.Point.call(this, viewPort, x, y,  0.5, eng.Colour.world.passive);
    var mouseOver = false;
    var mouseDrag = false;
    document.addEventListener("mousemove" + this.viewPort.name, function(mouseEvent){
        var path = new Path2D();
        path.rect(this.x - 0.5, this.y - 0.5, 1, 1);

        //Move point when mousedrag is detected
        if(mouseDrag){
            this.x += mouseEvent.deltaX;
            this.y += mouseEvent.deltaY;
        }
        else{
            if(viewPort.isMouseInPath(path)){
                this.colour = eng.Colour.world.focused;
                mouseOver = true;
            }
            else{
                this.colour = eng.Colour.world.passive;
                mouseOver = false;
            }
        }
    }.bind(this));
    document.addEventListener("mousedown" + this.viewPort.name, function(){
        if(mouseOver){
            this.colour = eng.Colour.world.drag;
            mouseDrag = true;
        }
    }.bind(this));
    document.addEventListener("mouseup" + this.viewPort.name, function(){
        if(mouseOver){
            this.colour = eng.Colour.world.focused;
            mouseDrag = false;
        }
    }.bind(this));
};
//endregion


//region Path constructor.
eng.Path = function(viewPort){
    this.viewPort = viewPort;

    this.points = [];
    this.lines = [];

    //TODO: David make this more efficient.
    this.update = function(){
        var tmpLine;
        this.lines = [];
        for(var i = 0; i < this.points.length-1; i++){
            tmpLine = new eng.Line(this.points[i], this.points[i+1], this.viewPort);
            this.lines.push(tmpLine);
        }
    };

    //region Public access methods.
    this.appendPoint = function(point){
        this.points.push(point);
        this.update();
    };
   this.insertPoint = function(index, point){
        this.points.splice(index, 0, point);
        this.update();
    };
    this.removePoint = function(index){
        this.points.splice(index, 1);
        this.update();
    };
    this.getNumPoints = function(){
        return points.length;
    };
    this.getPoint = function(index){
        return this.points[index];
    };
    this.getLastPoint = function(){
        return this.points[waypoints.length];
    };
    //endregion

};
//endregion


eng.Combatant = function(viewPort, x, y, speed, path){
    eng.Point.call(this, viewPort, x,  y, 2, eng.Colour.red);
    this.speed = speed || 0;
    this.path = path || null;
    this.move = function(){
        if(this.path !== null && this.path.getLastPoint())
        {
            var distanceToMove = speed;

            //Jump combatant from one point to another
            while(true)
            {
                var line = new Line(this.position, this.path.getPoint(0));
                if (distanceToMove >= line.length()){
                    distanceToMove -= line.length();
                    this.position = this.path[0];
                    this.path.removePoint(0);
                }
                else{
                    this.position.x += this.speed * line.unitVector().x;
                    this.position.y += this.speed * line.unitVector().y;
                    break;
                }
            }
        }
    };

};



//region Line constructor.
eng.Line = function(origin, destination, viewPort){
    this.origin = origin || eng.Vector.zero;
    this.destination = destination ||  eng.Vector.zero;
    var _viewPort = viewPort;

    this.vector = function(){
        return new eng.Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
    };
    this.length = function(){
        return this.vector().magnitude();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };

    document.addEventListener("render" + _viewPort.name, function draw(){
        var path = new Path2D();
        path.moveTo(this.origin.x, this.origin.y);
        path.lineTo(this.destination.x, this.destination.y);
        _viewPort.drawPath(path, eng.Colour.black);
    }.bind(this));
};
//endregion


//region Rect constructor.
eng.Rect = function(origin, dimensions, surface){
    this.origin = origin ||  eng.Vector.zero;
    this.dimensions = dimensions || eng.Vector.zero;
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






