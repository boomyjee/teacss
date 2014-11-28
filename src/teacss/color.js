teacss.Color = teacss.Color || function() {
    var Color = function(r,g,b,a) {
        this.rgb = [r || 0,g || 0,b || 0];
        this.alpha = a != null ? a : 1;
    };

    function clamp(val,min,max) {
        min = min==undefined ? 0 : min;
        max = max==undefined ? 1 : max;
        return Math.min(max, Math.max(min, val));
    }
    var lookupColors = {
        aqua:[0,255,255],
        azure:[240,255,255],
        beige:[245,245,220],
        black:[0,0,0],
        blue:[0,0,255],
        brown:[165,42,42],
        cyan:[0,255,255],
        darkblue:[0,0,139],
        darkcyan:[0,139,139],
        darkgrey:[169,169,169],
        darkgreen:[0,100,0],
        darkkhaki:[189,183,107],
        darkmagenta:[139,0,139],
        darkolivegreen:[85,107,47],
        darkorange:[255,140,0],
        darkorchid:[153,50,204],
        darkred:[139,0,0],
        darksalmon:[233,150,122],
        darkviolet:[148,0,211],
        fuchsia:[255,0,255],
        gold:[255,215,0],
        green:[0,128,0],
        grey:[128,128,128],
        indigo:[75,0,130],
        khaki:[240,230,140],
        lightblue:[173,216,230],
        lightcyan:[224,255,255],
        lightgreen:[144,238,144],
        lightgrey:[211,211,211],
        lightpink:[255,182,193],
        lightyellow:[255,255,224],
        lime:[0,255,0],
        magenta:[255,0,255],
        maroon:[128,0,0],
        navy:[0,0,128],
        olive:[128,128,0],
        orange:[255,165,0],
        pink:[255,192,203],
        purple:[128,0,128],
        violet:[128,0,128],
        red:[255,0,0],
        silver:[192,192,192],
        white:[255,255,255],
        yellow:[255,255,0]
    };
    Color.parse = function (str) {
        var res, m = function(r,g,b,a){ return new Color(r,g,b,a); }

        // Look for rgb(num,num,num)
        if (res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(str))
            return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10));

        // Look for rgba(num,num,num,num)
        if (res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))
            return m(parseInt(res[1], 10), parseInt(res[2], 10), parseInt(res[3], 10), parseFloat(res[4]));

        // Look for rgb(num%,num%,num%)
        if (res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(str))
            return m(parseFloat(res[1])*2.55, parseFloat(res[2])*2.55, parseFloat(res[3])*2.55);

        // Look for rgba(num%,num%,num%,num)
        if (res = /rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(str))
            return m(parseFloat(res[1])*2.55, parseFloat(res[2])*2.55, parseFloat(res[3])*2.55, parseFloat(res[4]));

        // Look for #a0b1c2
        if (res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(str))
            return m(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));

        // Look for #fff
        if (res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(str))
            return m(parseInt(res[1]+res[1], 16), parseInt(res[2]+res[2], 16), parseInt(res[3]+res[3], 16));

        // Otherwise, we're most likely dealing with a named color
        var name = str ? teacss.trim(str.toString()).toLowerCase() : false;
        if (name == "transparent")
            return m(255, 255, 255, 0);
        else {
            // default to black
            res = lookupColors[name] || [0, 0, 0];
            return m(res[0], res[1], res[2]);
        }
    },

    Color.prototype = {
        toString: function () {
            if (this.alpha < 1.0) {
                return "rgba(" + this.rgb.map(function (c) {
                    return Math.round(c);
                }).concat(this.alpha).join(', ') + ")";
            } else {
                return '#' + this.rgb.map(function (i) {
                    i = Math.round(i);
                    i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                    return i.length === 1 ? '0' + i : i;
                }).join('');
            }
        },

        toHSL: function () {
            var r = this.rgb[0] / 255,
                g = this.rgb[1] / 255,
                b = this.rgb[2] / 255,
                a = this.alpha;

            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2, d = max - min;

            if (max === min) {
                h = s = 0;
            } else {
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2;               break;
                    case b: h = (r - g) / d + 4;               break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s*100, l: l*100, a: a };
        },

        toHSV: function () {
            var red = this.rgb[0];
            var grn = this.rgb[1];
            var blu = this.rgb[2];
            var x, val, f, i, hue, sat, val;
            red/=255;
            grn/=255;
            blu/=255;
            x = Math.min(Math.min(red, grn), blu);
            val = Math.max(Math.max(red, grn), blu);
            if (x==val){
                return({h:0, s:0, v:val*100});
            }
            f = (red == x) ? grn-blu : ((grn == x) ? blu-red : red-grn);
            i = (red == x) ? 3 : ((grn == x) ? 5 : 1);
            hue = Math.floor((i-f/(val-x))*60)%360;
            sat = Math.floor(((val-x)/val)*100);
            val = Math.floor(val*100);
            return({h:hue, s:sat, v:val});
        },
        toARGB: function () {
            var argb = [Math.round(this.alpha * 255)].concat(this.rgb);
            return '#' + argb.map(function (i) {
                i = Math.round(i);
                i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                return i.length === 1 ? '0' + i : i;
            }).join('');
        },
        add : function (c2) {
            var c1 = this;
            return new teacss.Color(
                clamp(c1.rgb[0]+c2.rgb[0],0,255),
                clamp(c1.rgb[1]+c2.rgb[1],0,255),
                clamp(c1.rgb[2]+c2.rgb[2],0,255),
                c1.alpha
            );
        },
        sub : function (c2) {
            var c1 = this;
            return new teacss.Color(
                clamp(c1.rgb[0]-c2.rgb[0],0,255),
                clamp(c1.rgb[1]-c2.rgb[1],0,255),
                clamp(c1.rgb[2]-c2.rgb[2],0,255),
                c1.alpha
            );
        },
        mul : function (k) {
            var c1 = this;
            return new teacss.Color(
                clamp(c1.rgb[0]*k,0,255),
                clamp(c1.rgb[1]*k,0,255),
                clamp(c1.rgb[2]*k,0,255),
                clamp(c1.alpha)
            );
        }
    }

    Color.functions = {
        add_colors: function (c1) {
            if (!(c1 instanceof teacss.Color)) c1 = teacss.Color.parse(c1);
            var colors = [];
            for (var i=1;i<arguments.length;i++) {
                var c = arguments[i];
                if (!(c instanceof teacss.Color)) c = teacss.Color.parse(c);
                c1 = c1.add(c);
            }
            return c1;
        },
        sub_colors : function (c1,c2) {
            if (!(c1 instanceof teacss.Color)) c1 = teacss.Color.parse(c1);
            var colors = [];
            for (var i=1;i<arguments.length;i++) {
                var c = arguments[i];
                if (!(c instanceof teacss.Color)) c = teacss.Color.parse(c);
                c1 = c1.sub(c);
            }
            return c1;
        },
        mul_colors : function (c1,k) {
            if (!(c1 instanceof teacss.Color)) c1 = teacss.Color.parse(c1);
            return c1.mul(k);
        },
        color: function(color) {
            if (color instanceof teacss.Color) return color;
            return teacss.Color.parse(color);
        },
        rgb: function (r, g, b) {
            return this.rgba(r, g, b, 1.0);
        },
        rgba: function (r, g, b, a) {
            return new teacss.Color(r,g,b,a);
        },
        argb: function (color) {
            if (!(color instanceof teacss.Color)) color = teacss.Color.parse(color);
            return color.toARGB();
        },
        hsl: function (h, s, l) {
            return this.hsla(h,s,l,1);
        },
        hsla: function (h,s,l,a) {
            h = (h % 360) / 360;
            s = s / 100;
            l = l / 100;

            var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
            var m1 = l * 2 - m2;

            return this.rgba(hue(h + 1/3) * 255,
                             hue(h)       * 255,
                             hue(h - 1/3) * 255,
                             a);

            function hue(h) {
                h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
                if      (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
                else if (h * 2 < 1) return m2;
                else if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
                else                return m1;
            }
        },
        hue: function (color) {
            return Math.round(color.toHSL().h);
        },
        saturation: function (color) {
            return Math.round(color.toHSL().s);
        },
        lightness: function (color) {
            return Math.round(color.toHSL().l);
        },
        alpha: function (color) {
            return color.toHSL().a;
        },
        saturate: function (color, amount) {
            var hsl = color.toHSL();
            hsl.s = clamp(hsl.s+amount,0,100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        desaturate: function (color, amount) {
            var hsl = color.toHSL();
            hsl.s = clamp(hsl.s-amount,0,100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        lighten: function (color, amount) {
            var hsl = color.toHSL();
            hsl.l = clamp(hsl.l+amount,0,100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        darken: function (color, amount) {
            var hsl = color.toHSL();
            hsl.l = clamp(hsl.l-amount,0,100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        fadein: function (color, amount) {
            var hsl = color.toHSL();
            hsl.a = clamp(hsl.a+amount/100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        fadeout: function (color, amount) {
            var hsl = color.toHSL();
            hsl.a = clamp(hsl.a-amount/100);
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        spin: function (color, amount) {
            var hsl = color.toHSL();
            var hue = (hsl.h + amount) % 360;
            hsl.h = hue < 0 ? 360 + hue : hue;
            return this.hsla(hsl.h,hsl.s,hsl.l,hsl.a);
        },
        mix: function (color1, color2, weight) {
            if (!(color1 instanceof teacss.Color)) color1 = teacss.Color.parse(color1);
            if (!(color2 instanceof teacss.Color)) color2 = teacss.Color.parse(color2);

            var p = weight / 100.0;
            var w = p * 2 - 1;
            var a = color1.toHSL().a - color2.toHSL().a;

            var w1 = (((w * a == -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
            var w2 = 1 - w1;

            var rgb = [color1.rgb[0] * w1 + color2.rgb[0] * w2,
                       color1.rgb[1] * w1 + color2.rgb[1] * w2,
                       color1.rgb[2] * w1 + color2.rgb[2] * w2];

            var alpha = color1.alpha * p + color2.alpha * (1 - p);
            return new teacss.Color(rgb[0],rgb[1],rgb[2], alpha);
        },
        greyscale: function (color) {
            return this.desaturate(color, 100);
        }
    }
    String.prototype.toHSL = function () { return Color.parse(this).toHSL(); }
    String.prototype.toHSV = function () { return Color.parse(this).toHSV(); }

    for (var name in Color.functions) {
        teacss.functions[name] = function(func){
            return function () {
                return func.apply(teacss.Color.functions,arguments);
            }
        }(Color.functions[name]);
    }

    return Color;
}();

