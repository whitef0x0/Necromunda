//region Math and number related functions and methods.
// Number.prototype.toHex = function () {
//     return "0123456789ABCDEF".charAt((this - (this % 16)) >> 4) + "0123456789ABCDEF".charAt(this % 16);
// };
Number.prototype.clamp = function (low, high) {
   return this < low ? low : this > high ? high : +this;
}
//end region

define(function (require) {
    
    var eng = {};
    eng.Colour = require('./colour');
   	eng.Geo = require('./geometricFigures');
   	eng.worldView = require('./worldView').view;

	return eng;
});
