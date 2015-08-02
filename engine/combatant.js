
function Combatant(parameters){
    this.character = parameters.character;
    this.position = parameters.position || engine.vector().zero;
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
