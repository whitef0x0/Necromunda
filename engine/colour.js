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


//region RGBFromHSV function
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

//region Static Colour instances.
engine.Colour.clear = new engine.Colour(0, 0, 0, 0);
engine.Colour.white = new engine.Colour(255, 255, 255, 255);
engine.Colour.black = new engine.Colour(0, 0, 0, 255);
//endregion