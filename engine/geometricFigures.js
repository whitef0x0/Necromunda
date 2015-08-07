
//region Vector constructor.
eng.Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.length = function(){
        return Math.sqrt( this.x*this.x + this.y*this.y );
    };
    this.unitVector = function(){
        return new eng.Vector(this.x/this.length(), this.y/this.length());
    };
    this.subtract = function(vectorB){
        return new eng.Vector(this.x - vectorB.x, this.y - vectorB.y);
    };
};
eng.Vector.zero = new eng.Vector(0, 0);
//endregion


//region Point: A subclass of Vector that is rendered in the viewport.
eng.Point = function(viewPort, x, y, radius, colour ){
    this.viewPort = viewPort;
    eng.Vector.call(this, x, y);
    this.radius = radius || 0.5;
    this.colour = colour || eng.Colour.world.passive;
    this.makeCanvasPath = function(){
        var path = new Path2D();
        path.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        return path;
    };
    document.addEventListener("render" + this.viewPort.name, function draw(){
        this.viewPort.fillPath(this.makeCanvasPath(), this.colour);
    }.bind(this));
};
//endregion


//region PathPoint: an interactive subclass of Point.
eng.PathPoint = function(viewPort, x, y){
    eng.Point.call(this, viewPort, x, y,  0.5, eng.Colour.world.passive);
    var mouseOver = false;
    var mouseDrag = false;
    document.addEventListener("mousemove" + this.viewPort.name, function(mouseEvent){
        if(mouseDrag){
            this.x += mouseEvent.deltaX;
            this.y += mouseEvent.deltaY;
        }
        else{
            if(viewPort.isMouseInPath(this.makeCanvasPath())){
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


//region Line: a line between two pathPoints that is rendered in the viewport.
eng.Line = function (viewPort, origin, destination){
    this.origin = origin || eng.Vector.zero;
    this.destination = destination ||  eng.Vector.zero;
    this.viewPort = viewPort;
    this.colour = eng.Colour.world.passive;
    this.vector = function(){
        return this.destination.subtract(this.origin);
    };
    this.length = function(){
        return this.vector().length();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };
    this.makeCanvasPath = function(){
        var path = new Path2D();
        path.moveTo(this.origin.x, this.origin.y);
        path.lineTo(this.destination.x, this.destination.y);
        return path;
    };
    document.addEventListener("render" + this.viewPort.name, function draw(){
        this.viewPort.drawPath(this.makeCanvasPath(), this.colour);
    }.bind(this));
};
//endregion


//region PathLine: an interactive subclass of Line.
eng.PathLine = function(viewPort, origin, destination, path){
    eng.Line.call(this, viewPort, origin, destination);
    this.path = path;
    var mouseOver = false;
    var mouseDrag = false;
    this.makeMouseDetectionPath = function(){
        var path = new Path2D();
        var halfWidth = viewPort.lineWidthScale/2;
        var offset = new eng.Vector(this.unitVector().y*halfWidth, -this.unitVector().x*halfWidth);
        path.moveTo(this.origin.x+offset.x, this.origin.y+offset.y);
        path.lineTo(this.destination.x+offset.x, this.destination.y+offset.y);
        path.lineTo(this.destination.x-offset.x, this.destination.y-offset.y);
        path.lineTo(this.origin.x-offset.x, this.origin.y-offset.y);
        path.closePath();
        return path;
    };
    document.addEventListener("mousemove" + this.viewPort.name, function(mouseEvent){
        console.log("ready and willing!");
        if(mouseDrag){
            this.origin.x += mouseEvent.deltaX;
            this.origin.y += mouseEvent.deltaY;
            this.destination.x += mouseEvent.deltaX;
            this.destination.y += mouseEvent.deltaY;
        }
        else{
            if(viewPort.isMouseInPath(this.makeMouseDetectionPath())){
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


//region Path: composed of interactive PathPoints and PathLines.
eng.Path = function(viewPort){
    this.viewPort = viewPort;

    this.pathPoints = [];
    this.pathLines = [];

    //TODO: David make this more efficient.
    this.update = function(){
        var tmpLine;
        this.pathLines = [];
        for(var i = 0; i < this.pathPoints.length-1; i++){
            tmpLine = new eng.PathLine(this.viewPort, this.pathPoints[i], this.pathPoints[i + 1]);
            this.pathLines.push(tmpLine);
        }
    };
    //region Public access methods.
    this.appendPoint = function(point){
        this.pathPoints.push(point);
        this.update();
    };
   this.insertPoint = function(index, point){
        this.pathPoints.splice(index, 0, point);
        this.update();
    };
    this.removePoint = function(index){
        this.pathPoints.splice(index, 1);
        this.update();
    };
    this.getNumPoints = function(){
        return this.pathPoints.length;
    };
    this.getPoint = function(index){
        return this.pathPoints[index];
    };
    this.getLastPoint = function(){
        return this.pathPoints[waypoints.length];
    };
    //endregion

};
//endregion


eng.Combatant = function(viewPort, x, y, speed, path){
    eng.Point.call(this, viewPort, x,  y, 2, eng.Colour.red);
    this.speed = speed || 0;
    this.path = path || new eng.Path();
    this.move = function(){
        if(this.path !== null && this.path.getLastPoint())
        {
            var distanceToMove = speed;
            // TODO: This method will jump the character, ultimately we should animate.
            while(true)
            {
                var vector = this.path.getPoint(0).subtract(this);
                if (distanceToMove >= vector.length()){
                    distanceToMove -= vector.length();
                    this.position = this.path[0];
                    this.path.removePoint(0);
                }
                else{
                    this.position.x += this.speed * vector.unitVector().x;
                    this.position.y += this.speed * vector.unitVector().y;
                    break;
                }
            }
        }
    };
};





//region Rect constructor.
eng.Rect = function(viewPort, origin, dimensions){
    this.origin = origin ||  eng.Vector.zero;
    this.dimensions = dimensions || eng.Vector.zero;
    this.viewPort = viewPort;
    document.addEventListener("render" + this.viewPort.name, function draw(){
        var path = new Path2D();
        path.rect(this.origin.x, this.origin.y, this.dimensions.x, this.dimensions.y);
        this.viewPort.drawPath(path, eng.Colour.black);
    }.bind(this));
};
//endregion






