//region Colour constructor.
eng.Colour = function(r, g, b, a){
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
eng.ColourFromHSV = function(h, s, v, a){
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

   return new eng.Colour(rgb.r, rgb.g, rgb.b, a);
};
//endregion

//region Static Colour instances.
eng.Colour.clear         = new eng.Colour(0, 0, 0, 0);
eng.Colour.red         = new eng.Colour(255, 0, 0, 255);
eng.Colour.white         = new eng.Colour(255, 255, 255, 255);
eng.Colour.black         = new eng.Colour(0, 0, 0, 255);




eng.Colour.gui = {};
eng.Colour.gui.base          = eng.ColourFromHSV(0, 0, 0.2, 1);

eng.Colour.world = {};
eng.Colour.world.background  = eng.ColourFromHSV(0, 0, 0.16, 1);
eng.Colour.world.passive     = eng.ColourFromHSV(0, 0, 0.64, 1);
eng.Colour.world.focused     = eng.ColourFromHSV(0, 0, 0.80, 1);
eng.Colour.world.drag        = eng.ColourFromHSV(0, 0, 0.96, 1);


/*
case Colours.Base:
{
    return HSVToRGB(0f, 0f, 0.20f);
}
case Colours.Control:
{
    return HSVToRGB(0f, 0f, 0.24f);;
}
case Colours.ControlHighlight:
{
    return HSVToRGB(0f, 0f, 0.28f);
}
case Colours.ControlToggleHighlight:
{
    return HSVToRGB(0f, 0f, 0.32f);
}
case Colours.ControlPressedA:
{
    return HSVToRGB(0.52f, 0.24f, 0.404f);
}
case Colours.ControlPressedB:
{
    return HSVToRGB(0.56f, 0.48f, 0.40f);
}
case Colours.ControlPressedC:
{
    return HSVToRGB(0.56f, 0.48f,0.48f);
}
case Colours.Text:
{
    return HSVToRGB(0f, 0f, 1.0f);
}
case Colours.DisabledText:
{
    return HSVToRGB(0f, 0f, 0.72f);
}
*/


//endregion