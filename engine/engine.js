
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
    //TODO: This method seems to break things, discuss with David.
    this.prototype = new parent();
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

