//region loadScript function.
function loadScript(scriptName)
{
    var script = document.createElement("script");
    script.type= 'text/javascript';
    script.src= scriptName;
    document.body.appendChild(script);
}
//endregion

//region Document configuration (canvas resizing completed by the Surface class).
document.body.style.overflow = "hidden";
document.body.style.width = window.innerWidth;
document.body.style.height = window.innerHeight;
document.body.style.margin = 0;
document.body.style.display = "block";
//endregion


//region Load scripts.
loadScript("engine.js");
loadScript("gameScript.js");
//endregion
