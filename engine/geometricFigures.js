define(function (require) {
    //region Colour constructor.
    var Geo = {};

    var Colour = require('./colour');

    //region Vector constructor.
    Geo.Vector = function(x, y){

        //Throw error if x or y are not integers 
        if (x !== parseFloat(x, 10) || y !== parseFloat(y, 10)){
            throw new Error('inputs to vector must be integers');
        }

        this.x = x;
        this.y = y;
        this.length = function(){
            return Math.sqrt( this.x*this.x + this.y*this.y );
        };
        this.unitVector = function(){
            return new Geo.Vector(this.x/this.length(), this.y/this.length());
        };
        this.subtract = function(vectorB){
            return new Geo.Vector(this.x - vectorB.x, this.y - vectorB.y);
        };
    };
    Geo.Zero_Vector = new Geo.Vector(0, 0);
    //endregion


    //region Point: A subclass of Vector that is rendered in the viewport.
    Geo.Point = function(viewPort, x, y, radius, colour ){
        //Throw error if x or y or radius are not integers 
        if (x !== parseFloat(x, 10) || y !== parseFloat(y, 10)){
            throw new Error('x, y and radius of Point must be integers');
        }
        if (radius !== parseFloat(radius, 10)){
            throw new Error('radius of Point must be an float');
        }
        if (radius < 0){
            throw new Error('radius of Point must be greater than 0');
        }

        // var proto = viewPort.__proto__ || viewPort.constructor.prototype;
        // console.log(viewPort);
        // //Throw error if viewPort is not an engine.worldView object
        // console.log( viewPort.__proto__.hasOwnProperty('requestRender') );
        // if(!proto.hasOwnProperty('drawPath') || !proto.hasOwnProperty('fillPath')){
        //     throw new Error('viewPort of Point must be a engine.WorldView type object');
        // }

        this.viewPort = viewPort;
        Geo.Vector.call(this, x, y);
        this.radius = radius || 0.5;
        this.colour = colour || Colour.world.passive;

        this.makeCanvasPath = function(){
            var path = new Path2D();
            path.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
            return path;
        };
        this.draw = function(){
            this.viewPort.fillPath(this.makeCanvasPath(), this.colour);
        }
        document.addEventListener("render" + this.viewPort.name, this.draw.bind(this));
    };
    //endregion


    //region PathPoint: an interactive subclass of Point.
    Geo.PathPoint = function(viewPort, x, y){

        Geo.Point.call(this, viewPort, x, y, 0.5, Colour.world.passive);
        var _mouseOver = false;
        var _mouseDrag = false;

        this.onMouseMove = function(mouseEvent){
            if(_mouseDrag){
                this.x += mouseEvent.deltaX;
                this.y += mouseEvent.deltaY;
            }
            else{
                if( this.viewPort.isMouseInPath( this.makeCanvasPath() ) ){
                    this.colour = Colour.world.focused;
                    _mouseOver = true;
                }
                else{
                    this.colour = Colour.world.passive;
                    _mouseOver = false;
                }
            }
        };

        this.onMouseDown = function(){
            if(_mouseOver){
                this.colour = Colour.world.drag;
                _mouseDrag = true;
            }
        };

        this.onMouseUp = function(){
            if(_mouseOver){
                this.colour = Colour.world.focused;
                _mouseDrag = false;
            }
        };

        document.addEventListener("mousemove" + this.viewPort.name, this.onMouseMove.bind(this));
        document.addEventListener("mousedown" + this.viewPort.name, this.onMouseDown.bind(this));
        document.addEventListener("mouseup" + this.viewPort.name, this.onMouseUp.bind(this));
    };
    //endregion


    //region Line: a line between two pathPoints that is rendered in the viewport.
    Geo.Line = function (viewPort, origin, dest){
        //Throw error if x or y or radius are not integers 
        if (origin.x !== parseFloat(origin.x, 10) || origin.y !== parseFloat(origin.y, 10)) { 
            throw new Error('origin.x, origin.y of Line must be integers');
        }
        if (dest.x !== parseFloat(dest.x, 10) || dest.y !== parseFloat(dest.y, 10) ){
            throw new Error('dest.x, dest.y of Line must be integers');
        }

        // var proto = viewPort.__proto__ || viewPort.constructor.prototype;
        // //Throw error if viewPort is not an engine.worldView object
        // if(!proto.hasOwnProperty('drawPath') || !proto.hasOwnProperty('fillPath')){
        //     throw new Error('viewPort of Line must be an engine.WorldView typed object');
        // }

        this.origin = origin;
        this.dest = dest;
        this.viewPort = viewPort;
        this.colour = Colour.world.passive;
        this.vector = function(){
            return this.dest.subtract(this.origin);
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
            path.lineTo(this.dest.x, this.dest.y);
            return path;
        };
        this.draw = function(){
            this.viewPort.drawPath(this.makeCanvasPath(), this.colour);
        };

        document.addEventListener("render" + this.viewPort.name, this.draw.bind(this));
    };
    //endregion


    //region PathLine: an interactive subclass of Line.
    Geo.PathLine = function(viewPort, origin, dest, path){
        Geo.Line.call(this, viewPort, origin, dest);

        // var proto = path.__proto__ || path.constructor.prototype;
        //Throw error if path is not an Geo.Path object
        // if(!path.hasOwnProperty('appendPoint') || !path.proto.hasOwnProperty('insertPoint')){
        //     throw new Error('this.path of PathLine must be an Geo.Path typed object');
        // }

        this.path = path;
        var mouseOver = false;
        var mouseDrag = false;
        this.makeMouseDetectionPath = function(){
            var canvasPath = new Path2D();
            var halfWidth = viewPort.lineWidthScale/2;
            var offset = new Geo.Vector(this.unitVector().y*halfWidth, -this.unitVector().x*halfWidth);
            canvasPath.moveTo(this.origin.x+offset.x, this.origin.y+offset.y);
            canvasPath.lineTo(this.dest.x+offset.x, this.dest.y+offset.y);
            canvasPath.lineTo(this.dest.x-offset.x, this.dest.y-offset.y);
            canvasPath.lineTo(this.origin.x-offset.x, this.origin.y-offset.y);
            canvasPath.closePath();
            return canvasPath;
        };
        this.onMouseMove = function(mouseEvent){
            console.log("ready and willing!");
            if(mouseDrag){
                this.origin.x += mouseEvent.deltaX;
                this.origin.y += mouseEvent.deltaY;
                this.dest.x += mouseEvent.deltaX;
                this.dest.y += mouseEvent.deltaY;
            }
            else{
                if(viewPort.isMouseInPath(this.makeMouseDetectionPath())){
                    this.colour = Colour.world.focused;
                    mouseOver = true;
                }
                else{
                    this.colour = Colour.world.passive;
                    mouseOver = false;
                }
            }
        };

        this.onMouseDown = function(){
            if(mouseOver){
                this.colour = Colour.world.drag;
                mouseDrag = true;
            }
        };

        this.onMouseUp = function(){
            if(mouseOver){
                this.colour = Colour.world.focused;
                mouseDrag = false;
            }
        }

        document.addEventListener("mousemove" + this.viewPort.name, this.onMouseMove.bind(this));
        document.addEventListener("mousedown" + this.viewPort.name, this.onMouseDown.bind(this));
        document.addEventListener("mouseup" + this.viewPort.name, this.onMouseUp.bind(this));
    };
    //endregion


    //region Path: composed of interactive PathPoints and PathLines.
    Geo.Path = function(viewPort){
        var proto = viewPort.__proto__ || viewPort.constructor.prototype;
        //Throw error if viewPort is not an Geo.worldView object
        // if(!proto.hasOwnProperty('drawPath') || !proto.hasOwnProperty('fillPath')){
        //     throw new Error('viewPort of Line must be an Geo.WorldView typed object');
        // }

        this.viewPort = viewPort;
        this.pathPoints = [];
        this.pathLines = [];

        //TODO: David make this more efficient.
        this.update = function(){
            var tmpLine;
            this.pathLines = [];
            for(var i = 0; i < this.pathPoints.length-1; i++){
                tmpLine = new Geo.PathLine(this.viewPort, this.pathPoints[i], this.pathPoints[i + 1]);
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
    };
    //endregion


    Geo.Combatant = function(viewPort, x, y, speed, path){
        Geo.Point.call(this, viewPort, x,  y, 2, Colour.red);

        if (speed !== parseFloat(speed, 10)){
            throw new Error('\'speed\' of Combatant must be an integer');
        }

        this.speed = speed;
        this.path = path || new Geo.Path();

        this.move = function(){
            if(this.path .length && this.path.getLastPoint())
            {
                var distanceToMove = speed,
                    continueMoving = true;

                // TODO: This method will jump the character, ultimately we should animate.
                while(continueMoving)
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
                        continueMoving = false;
                    }
                }
            }
        };
    };

    //region Rect constructor.
    Geo.Rect = function(viewPort, origin, dimensions){

        var proto = viewPort.__proto__ || viewPort.constructor.prototype;
        //Throw error if viewPort is not an Geo.worldView object
        // if(!proto.hasOwnProperty('drawPath') || !proto.hasOwnProperty('fillPath')){
        //     throw new Error('viewPort of Line must be an Geo.WorldView typed object');
        // }
        // if (origin.x !== parseFloat(origin.x, 10) || origin.y !== parseFloat(origin.y, 10)) { 
        //     throw new Error('origin.x, origin.y of Line must be integers');
        // }
        // if (dest.x !== parseFloat(dest.x, 10) || dest.y !== parseFloat(dest.y, 10) ){
        //     throw new Error('dest.x, dest.y of Line must be integers');
        // }

        this.origin = origin;
        this.dimensions = dimensions;
        this.viewPort = viewPort;
        this.draw = function(){
            var path = new Path2D();
            path.rect(this.origin.x, this.origin.y, this.dimensions.x, this.dimensions.y);
            this.viewPort.drawPath(path, Colour.black);
        };

        document.addEventListener("render" + this.viewPort.name, this.draw.bind(this));
    };
    //endregion

    return Geo;
});






