//region Inheritance related functions.
Function.prototype.addMethod = function(name, method)
{
    if(!this.prototype.hasOwnProperty(name))
    {
        this.prototype[name] = method;
    }
};

Function.prototype.inherit = function(parent)
{
    this.prototype = new parent();
    this.prototype.constructor = parent;

    for(var prop in parent)
    {
        if( parent.hasOwnProperty(prop) && (typeof(parent[prop]) === typeof(Function)) )
        {
            this[prop] = parent[prop];
        }
    }
};
//endregion


//region Math and number related functions and methods.
Number.prototype.toHex = function () {
    return "0123456789ABCDEF".charAt((this - (this % 16)) >> 4) + "0123456789ABCDEF".charAt(this % 16);
};

Number.prototype.clamp = function (low, high) {
    return this < low ? low : this > high ? high : +this;
};
//endregion


var engine = {};



engine.drawing = {};

//region Colour constructor.
engine.drawing.Colour = function(r, g, b, a){
    r = r.clamp(0, 255);
    g = g.clamp(0, 255);
    b = b.clamp(0, 255);
    a = a.clamp(0, 255);

    var publicMembers = {
        get r()     { return r; },
        set r(value){ r = value.clamp(0, 255); },
        get g()     { return g; },
        set g(value){ g = value.clamp(0, 255); },
        get b()     { return b; },
        set b(value){ b = value.clamp(0, 255); },
        get a()     { return a; },
        set a(value){ a = value.clamp(0, 255); },

        toHex: function (){
            return "#" + r.toHex() + g.toHex() + b.toHex();
        }
    };
    return publicMembers;
};
//endregion


//region ColourHSV constructor.
engine.drawing.ColourFromHSV = function(h, s, v, a){
    h = h.clamp(0, 1);
    s = s.clamp(0, 1);
    v = v.clamp(0, 1);
    a = a.clamp(0, 1);

    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    var rgb = HSVtoRGB(h, s, v);
    a = Math.round(a * 255);

    return new Colour(rgb.r, rgb.g, rgb.b, a);
};
//endregion


//region Surface constructor (auto-resizing).
engine.drawing.Surface = function(name, options){
    var canvas = document.createElement("canvas");
    canvas.id = name;
    canvas.style.zIndex = options.zIndex || 0;
    document.body.appendChild(canvas);

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log("Resize occurred: " + canvas.width + ", " + canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    canvas.context = canvas.getContext("2d");

    // The interface visible to the rest of the program.
    var publicMembers = {
        get width(){ return canvas.width; },
        get height(){ return canvas.height; },
        drawPath: function(path2d, colour){
            canvas.context.globalAlpha = colour.a;
            canvas.context.strokeStyle = colour.toHex();
            canvas.context.stroke(path2d);
        },
        fillPath: function(path2d, colour){
            canvas.context.globalAlpha = colour.a;
            canvas.context.fillStyle = colour.toHex();
            canvas.context.fill(path2d);
        },
        renderText: function(x, y, string, colour){
            canvas.context.globalAlpha = colour.a;
            canvas.context.fillStyle = colour.toHex();
            canvas.context.fillText(string, x, y);
        },
        addEventListener: function(type, func){
            canvas.addEventListener(type, func);
        }
    };
    return publicMembers;
};
//endregion


//region WorldView constructor.
engine.drawing.WorldView = function(name, options){

};
//endregion


//region Static draw surfaces.
engine.guiLayer = new engine.drawing.Surface("guiLayer", {zIndex:1});
//endregion


//region Vector constructor.
engine.drawing.Vector = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
    this.magnitude = function(){
        return Math.sqrt( this.x*this.x + this.y*this.y );
    };
    this.unitVector = function(){
        return new Vector(this.x/this.length(), this.y/this.length());
    }
};
//endregion


//region Point constructor.
engine.drawing.Point = function(x, y, surface){
    Vector.call(this, x, y);

    var radius = 0.5;
    this.draw = function()
    {
        var path = new Path2D();
            canvas.context.beginPath();
        canvas.context.arc(this.x - radius/2, this.y - radius/2, 2, 0, 2*Math.PI);
        canvas.context.stroke();
    }
};

engine.drawing.Handle = function(x, y){
    Point.call(this, x, y);

    //Like a point that can be hovered and dragged.
};

engine.drawing.Path = function(){
    //An array of handles with lines inbetween.
    //If the line itself is grabbed, create a new handle.
};


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