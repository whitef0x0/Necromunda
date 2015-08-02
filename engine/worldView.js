
//region WorldView constructor (auto-resizing).
engine.WorldView = function(name, options){

    // References to the DOM elements:
    var canvas, context;

    // Parameters of the canvas transform.
    var xOffset = 0, yOffset = 0;
    var baseScale = 32; //Canvas unites per game units.
    var activeScale = 1;

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
    //eventHandler();
    (function eventHandler(){

        //region resizeHandler method, resizes the canvas in response to window resizing.
        (function resizeHandler()
        {
            function resize()
            {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                requestRender();
            }
            window.addEventListener("resize", resize);
            resize();
            //window.dispatchEvent("resize");
        })();
        //endregion


        //region scrollHandler method, translates the canvas in response to WASD.
        scrollHandler();
        function scrollHandler(){
            var wDown = false, aDown = false, sDown = false, dDown = false;
            var xScroll = 0, yScroll = 0, xSpeed = 0, ySpeed = 0;
            var scrolling = false;

            window.addEventListener("keydown", function keyDown(event){
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
            });
            window.addEventListener("keyup", function keyUp(event){
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
            });
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
            window.addEventListener("wheel", function wheel(wheelEvent){
                var tempScale = (wheelEvent.deltaY > 0)? (15/16)*activeScale : (17/16)*activeScale;
                tempScale = tempScale.clamp(1/8, 8);
                xOffset += xOffset*( (tempScale/activeScale) - 1);
                yOffset += yOffset*( (tempScale/activeScale) - 1);
                activeScale = tempScale;
                requestRender();
            });
        }
        //endregion

    })();
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
