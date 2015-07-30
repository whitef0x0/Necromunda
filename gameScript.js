
function Vector(x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.magnitude = function(){
        return Math.sqrt( this.x*this.x + this.y*this.y );
    };
    this.unitVector = function(){
        return new Vector(this.x/this.length(), this.y/this.length());
    }
}
Vector.zero = new Vector(0, 0);

function Point(x, y){
    //Like a vector that can be rendered.
}

function Handle(x, y){
    //Like a point that can be hovered and dragged.
}

function Path(){
    //An array of handles with lines inbetween.
    //If the line itself is grabbed, create a new handle.
}


function Line(origin, destination){
    this.origin = origin || Vector.zero;
    this.destination = destination || vector.zero;

    this.vector = function(){
        return new Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
    };
    this.length = function(){
        return this.vector().magnitude();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };
}


function Character(parameters){
    this.position = parameters.position || new Vector(0,0);
    this.speed = parameters.speed || 0;
    this.path = parameters.path || null;

    this.move = function(){
        var line, distanceToMove = speed;
        do{
            line = new Line(this.position, this.path[0]);

            if(distanceToMove >= line.length()){
                distanceToMove -= line.length();
                this.position = this.path[0];
                this.path.splice(0, 1);
            }
            else{
                this.position.x += this.speed*line.unitVector().x;
                this.position.y += this.speed*line.unitVector().y;
                break;
            }
        }while(distanceToMove >= line.length())
    };
    this.render = function(){
        this.path.render();

    }
}