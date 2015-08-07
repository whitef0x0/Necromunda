
//region WorldView constructor (auto-resizing).
eng.WorldView = function(name, options){

    // References to the DOM elements:
    var canvas, context;

    // Parameters of the canvas transform.
    var xOffset = 0, yOffset = 0;
    var baseScale = 64; //Canvas unites per game units.
    var activeScale = 1;
    function getAbsoluteScale(){ return baseScale*activeScale; }

    // Caches prior mouse data.
    var mouseData;

    // Line thickness correction (helps lines remain visible while zoomed out).
    var lineWidthScale = 1; // Set to => 1/Math.sqrt(activeScale) in zoomHandler.

    // Set true by requestRender(), and set false after each render event.
    var renderRequest = false;

    //region Initialize the canvas.
    (function initializeCanvas(){
        canvas = document.createElement("canvas");
        canvas.id = name;
        canvas.style.zIndex = options.zIndex || 0;
        canvas.colour = options.colour || eng.Colour.white;
        document.body.appendChild(canvas);
        context = canvas.getContext("2d");
    })();
    //endregion


    //region eventHandler function (handles scrolling, zooming and resizing).
    (function initializeEvents(){

        // The cursor moves relative to the world space not only during mouse movement, but also during panning and zooming.
        var mouseMove = new CustomEvent("mousemove" + name);
        function dispatchMouseMove(){
            document.dispatchEvent(mouseMove);
        }

        (function mouseEvents(){
            var mouseDown = new CustomEvent("mousedown" + name);
            var mouseUp = new CustomEvent("mouseup" + name);
            document.addEventListener("mouseover", function(mouseEvent){
                mouseData = mouseEvent;
                document.dispatchEvent(mouseMove);
            });
            document.addEventListener("mousemove", function(mouseEvent){
                mouseMove.deltaX = (mouseEvent.clientX - mouseData.clientX)/getAbsoluteScale();
                mouseMove.deltaY = (mouseEvent.clientY - mouseData.clientY)/getAbsoluteScale();
                mouseData = mouseEvent;
                dispatchMouseMove();
            });
            document.addEventListener("mousedown", function(mouseEvent){
                mouseData = mouseEvent;
                document.dispatchEvent(mouseDown);
            });
            document.addEventListener("mouseup", function(mouseEvent){
                mouseData = mouseEvent;
                document.dispatchEvent(mouseUp);
            });
        })();


        //region Navigation events.
        (function navigationEvents(){
            //region resizeHandler method, resizes the canvas in response to window resizing.
            (function resizeHandler(){
                var resizeEventCount = 0;
                function resize(){
                    context.save();
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    context.restore();
                }
                resize();
                // Counter causes the canvas to resize only once per series of resize events, after a cooldown of 100ms.
                window.addEventListener("resize", function(){
                    resizeEventCount++;
                    window.setTimeout(function(){
                        resizeEventCount--;
                        if(resizeEventCount === 0){
                            resize();
                        }
                    }, 100);
                });
            })();
            //endregion


            //region scrollHandler method, translates the canvas in response to WASD.
            (function panHandler(){
                var wDown = 0, aDown = 0, sDown = 0, dDown = 0;
                var xSpeed = 0, ySpeed = 0;
                var panning = false;

                window.addEventListener("keydown", function keyDown(event){
                    if(event.key === "w" && wDown === 0) wDown = 1;
                    else if(event.key === "a" && aDown === 0) aDown = 1;
                    else if(event.key === "s" && sDown === 0) sDown = 1;
                    else if(event.key === "d" && dDown === 0) dDown = 1;
                    else return;
                    if(!panning) pan();
                });
                window.addEventListener("keyup", function keyUp(event){
                    if(event.key === "w") wDown = 0;
                    else if(event.key === "a") aDown = 0;
                    else if(event.key === "s") sDown = 0;
                    else if(event.key === "d") dDown = 0;
                    else return;
                    if(!panning) pan();
                });
                function pan(){
                    const baseSpeed = 4;
                    var xScroll = (aDown - dDown);
                    var yScroll = (wDown - sDown);
                    if(xScroll*xSpeed <= 0) xSpeed = xScroll;
                    else xSpeed += 1/xSpeed;
                    if(yScroll*ySpeed <= 0) ySpeed = yScroll;
                    else ySpeed += 1/ySpeed;
                    if(xSpeed !== 0 || ySpeed !== 0){
                        var deltaX = baseSpeed*xSpeed;
                        var deltaY = baseSpeed*ySpeed;
                        xOffset += deltaX;
                        yOffset += deltaY;
                        // Panning causes the mouse to move relative to the world coordinates. We must correct for this.
                        (function correctMousePosition(){
                            mouseMove.deltaX = -deltaX/getAbsoluteScale();
                            mouseMove.deltaY = -deltaY/getAbsoluteScale();
                            dispatchMouseMove();
                        })();
                        window.requestAnimationFrame(pan);
                        panning = true;
                    }
                    else panning = false;
                }
            })();
            //endregion


            //region zoomHandler method, scales the canvas in response to the mouse-wheel.
            (function zoomHandler(){
                window.addEventListener("wheel", function wheel(wheelEvent){
                    var tempScale = activeScale*Math.pow(1.0625, -wheelEvent.deltaY);
                    tempScale = tempScale.clamp(0.25, 4);
                    var deltaScale = tempScale/activeScale;
                    xOffset += xOffset*(deltaScale - 1);
                    yOffset += yOffset*(deltaScale - 1);
                    activeScale = tempScale;
                    lineWidthScale = 1/Math.sqrt(activeScale);
                    // Zooming may cause the mouse to move relative to the world coordinates. We must correct for this.
                    (function correctMousePosition(){
                        mouseMove.deltaX = ((mouseData.clientX - (1/2)*canvas.width)*deltaScale);///getAbsoluteScale();
                        mouseMove.deltaY = ((mouseData.clientY - (1/2)*canvas.height)*deltaScale);///getAbsoluteScale();
                        dispatchMouseMove();
                    })();
                });
            })();
            //endregion
        })();
        //endregion
    })();
    //endregion


    //region gameLoop, requestRender and triggerRender functions.
    (function startGameLoop(){
        var renderEvent = new CustomEvent("render" + name);
        (function gameLoop(){
            (function triggerRender(){
                (function clearScreen(){
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                })();
                (function applyTransform(){
                    context.translate(xOffset + (1 / 2) * (canvas.width), yOffset + (1 / 2) * (canvas.height));
                    context.scale(getAbsoluteScale(), getAbsoluteScale());
                })();
                document.dispatchEvent(renderEvent);
            })();
            renderRequest = false;
            window.requestAnimationFrame(gameLoop);
        })();
    })();
    //endregion


    //region The public members returned from the constructor.
    var publicMembers = {
        get name(){ return canvas.id; },
        get width(){ return canvas.width; },
        get height(){ return canvas.height; },
        isMouseInPath: function(path2d){
            return context.isPointInPath(path2d, mouseData.clientX, mouseData.clientY);
        },
        drawPath: function(path2d, colour, lineWidth){
            context.globalAlpha = colour.a/255;
            context.strokeStyle = colour.toHex();
            lineWidth = lineWidth || 0.0625;
            context.lineWidth = lineWidth*lineWidthScale;
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
        requestRender: function(){
            this.requestRender();
        }
    };
    return publicMembers;
    //endregion
};
//endregion
