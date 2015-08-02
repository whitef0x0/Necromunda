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


//region Colour constructor.
engine.Colour = function(r, g, b, a){
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


//region Static Colour instances.
engine.Colour.clear = new engine.Colour(0, 0, 0, 0);
engine.Colour.white = new engine.Colour(255, 255, 255, 255);
engine.Colour.black = new engine.Colour(0, 0, 0, 255);
//endregion


//region ColourHSV constructor.
engine.Colour.RGBFromHSV = function(h, s, v, a){
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
engine.Surface = function(name, options){

    // References to the DOM elements:
    var canvas, context;

    // Information relating to the canvas transform:
    var xOffset = 0, yOffset = 0;
    var baseScale = 64; //Pixel per meter.
    var activeScale = 1; //Clamped between 16 and 1/16.

    // Set true by requestRender(), and set false after each render event.
    var renderRequest = false;
    var renderEvent;

    //region Initialize the canvas.
    (function initialize(){
        canvas = document.createElement("canvas");
        canvas.id = name;
        canvas.style.zIndex = options.zIndex || 0;
        canvas.colour = options.colour || engine.Colour.white;
        document.body.appendChild(canvas);
        context = canvas.getContext("2d");
        renderEvent = new CustomEvent("render" + name);
    })();
    //endregion



    //region gameLoop, requestRender and triggerRender functions.

    (function gameLoop(){
        if(renderRequest){
            (function applyTransform(){
                var absoluteScale = baseScale*activeScale;
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.translate(xOffset + (1/2)*(canvas.width), yOffset + (1/2)*(canvas.height));
                context.scale(absoluteScale, absoluteScale);
            })();
            (function triggerRender(){
                (function clearScreen(){
                    context.save();
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.restore();
                })();

                console.log(!!renderEvent);
                document.dispatchEvent(renderEvent);
            })();
            renderRequest = false;
        }
        //TODO: Make this more robust.
        window.requestAnimationFrame(gameLoop);
    })();
    function requestRender(){ renderRequest = true; }
    //endregion


    //region eventHandler function (handles scrolling, zooming and resizing).
    eventHandler();
    function eventHandler(){

        //region resizeHandler method, resizes the canvas in response to window resizing.
        resizeHandler();
        function resizeHandler()
        {
            window.addEventListener("resize", resize);
            function resize()
            {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                requestRender();
            }
            resize();
        }
        //endregion


        //region scrollHandler method, translates the canvas in response to WASD.
        scrollHandler();
        function scrollHandler(){
            var scrolling = false, wDown = false, aDown = false, sDown = false, dDown = false, xScroll = 0, yScroll = 0, xSpeed = 0, ySpeed = 0;
            window.addEventListener("keydown", keyDown);
            function keyDown(event){
                if(event.key === "w" && wDown === false){
                    wDown = true;
                    yScroll += 1;
                }
                else if(event.key === "a" && aDown === false){
                    aDown = true;
                    xScroll += 1;
                }
                else if(event.key === "s" && sDown === false){
                    sDown = true;
                    yScroll -= 1;
                }
                else if(event.key === "d" && dDown === false){
                    dDown = true;
                    xScroll -= 1;
                }
                else return;
                if(!scrolling){
                    scroll();
                    scrolling = true;
                }
            }
            window.addEventListener("keyup", keyUp);
            function keyUp(event){
                if(event.key === "w"){
                    wDown = false;
                    yScroll -= 1;
                }
                else if(event.key === "a"){
                    aDown = false;
                    xScroll -= 1;
                }
                else if(event.key === "s"){
                    sDown = false;
                    yScroll += 1;
                }
                else if(event.key === "d"){
                    dDown = false;
                    xScroll += 1;
                }
                else return;
                if(!scrolling){
                    scroll();
                    scrolling = true;
                }
            }
            function scroll(){
                if(xScroll*xSpeed <= 0) xSpeed = xScroll;
                else xSpeed += 1/xSpeed;
                if(yScroll*ySpeed <= 0) ySpeed = yScroll;
                else ySpeed += 1/ySpeed;
                if(xSpeed !== 0 || ySpeed !== 0){
                    xOffset += 2*xSpeed;
                    yOffset += 2*ySpeed;
                    requestRender();
                    window.requestAnimationFrame(scroll);
                }
                else scrolling = false;
            }
        }
        //endregion


        //region zoomHandler method, scales the canvas in response to the mouse-wheel
        zoomHandler();
        function zoomHandler(){
            window.addEventListener("wheel", wheel);
            function wheel(wheelEvent){
                var absoluteScale = baseScale*activeScale;
                var deltaScale = (wheelEvent.deltaY > 0)? 1/Math.log(Math.abs(wheelEvent.deltaY)) : Math.log(Math.abs(wheelEvent.deltaY));
                activeScale = (deltaScale*activeScale).clamp(1/16, 16);
                xOffset += xOffset*(deltaScale - 1);
                yOffset += yOffset*(deltaScale - 1);

                requestRender();
            }
        }
        //endregion

    }
    //endregion


    //region The public members returned from the constructor.
    var publicMembers = {
        get name(){ return canvas.id; },
        get width(){ return canvas.width; },
        get height(){ return canvas.height; },
        drawPath: function(path2d, colour){
            context.globalAlpha = colour.a/255;
            context.strokeStyle = colour.toHex();
            context.stroke(path2d);
        },
        fillPath: function(path2d, colour){
            context.globalAlpha = colour.a/255;
            context.fillStyle = colour.toHex();
            context.fill(path2d);
        },
        renderText: function(x, y, string, colour){
            context.globalAlpha = colour.a/255;
            context.fillStyle = colour.toHex();
            context.fillText(string, x, y);
        },
        addEventListener: function(type, callback){
            canvas.addEventListener(type, callback);
        }
    };
    return publicMembers;
    //endregion
};
//endregion


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
engine.Point = function(x, y, surface){
    engine.Vector.call(this, x, y);
    var radius = 4;
    this.surface = (function(){
        return surface;
    })();
    var that = this;
    function draw()
    {
        var path = new Path2D();
        path.arc(that.x - radius/2, that.y - radius/2, radius, 0, 2*Math.PI);
        that.surface.fillPath(path, engine.Colour.black);
    }
    document.addEventListener("render"+surface.name, draw);
};
engine.Point.inherit(engine.Vector);
//endregion



engine.Handle = function(x, y, surface){
    engine.Point.call(this, x, y, surface);
    //TODO: Add event listener for mouse events.
    //Like a point that can be hovered and dragged.
};

engine.Path = function(){
    //TODO
    //An array of handles connected by lines.
    //If the line itself is grabbed, create a new handle.
};


engine.Line = function(origin, destination, surface){
    this.origin = origin || Vector.zero;
    this.destination = destination || vector.zero;
    this.surface = (function(){
        return surface;
    })();

    this.vector = function(){
        return new engine.Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
    };
    this.length = function(){
        return this.vector().magnitude();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };
    var that = this;
    function draw(){
        var path = new Path2D();
        path.moveTo(that.origin.x, that.origin.y);

        path.lineTo(that.destination.x, that.destination.y);
        that.surface.drawPath(path, engine.Colour.black);

        console.log(that.surface.name);
        console.log(that.origin);
    }
    document.addEventListener("render"+surface.name, draw);
};


engine.Rect = function(origin, dimensions, surface){
    this.origin = origin || Vector.zero;
    this.destination = destination || vector.zero;
    this.surface = (function(){
        return surface;
    })();
    this.vector = function(){
        return new engine.Vector(this.destination.x - this.origin.x, this.destination.y - this.origin.y);
    };
    this.length = function(){
        return this.vector().magnitude();
    };
    this.unitVector = function(){
        return this.vector().unitVector();
    };
    var that = this;
    function draw(){
        var path = new Path2D();
        path.moveTo(that.origin.x, that.origin.y);

        path.lineTo(that.destination.x, that.destination.y);
        that.surface.drawPath(path, engine.Colour.black);

        console.log(that.surface.name);
        console.log(that.origin);
    }
    document.addEventListener("render"+surface.name, draw);
};

//region Smurf
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
//endregion

engine.guiLayer = new engine.Surface("guiLayer", {zIndex:1});
var point = new engine.Point(0, 0, engine.guiLayer);
var line = new engine.Line({x:7, y:3}, {x:14, y:12}, engine.guiLayer);


