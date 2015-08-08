define(function () {

    //region Colour constructor.
    var Colour = function(r, g, b, a){
        r = r.clamp(0, 255);
        g = g.clamp(0, 255);
        b = b.clamp(0, 255);
        a = a.clamp(0, 255);

        //Public members
        //DAVID: TODO: maybe change this get/set syntax 
        var publicMembers = {
            return {
                get r()     { return r; },
                set r(value){ r = value.clamp(0, 255); },
                get g()     { return g; },
                set g(value){ g = value.clamp(0, 255); },
                get b()     { return b; },
                set b(value){ b = value.clamp(0, 255); },
                get a()     { return a; },
                set a(value){ a = value.clamp(0, 255); },
    
                toHex: function (){
                    return "#" + r.toString(16) + g.toString(16) + b.toString(16); // r.toHex() + g.toHex() + b.toHex();
                }
            };
        };
        return publicMembers;
    };
    //endregion

    //region RGBFromHSV function
    Colour.ColourFromHSV = function(h, s, v, a){
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

    //region Static Colour instances.
    Colour.clear = new Colour(0, 0, 0, 0);
    Colour.red = new Colour(255, 0, 0, 255);
    Colour.white = new Colour(255, 255, 255, 255);
    Colour.black = new Colour(0, 0, 0, 255);

    Colour.gui = {};
    Colour.gui.base = Colour.ColourFromHSV(0, 0, 0.2, 1);

    Colour.world = {};
    Colour.world.background  = Colour.ColourFromHSV(0, 0, 0.16, 1);
    Colour.world.passive = Colour.ColourFromHSV(0, 0, 0.64, 1);
    Colour.world.focused  = Colour.ColourFromHSV(0, 0, 0.80, 1);
    Colour.world.drag= Colour.ColourFromHSV(0, 0, 0.96, 1);
    //endregion

    return Colour;
});
