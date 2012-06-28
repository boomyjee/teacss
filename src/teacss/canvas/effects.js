teacss.Canvas.effects = teacss.Canvas.effects || function() {
    var Canvas = teacss.Canvas;
    
    effects = {};
    // returns a random number between 0 and 1
    var randomShaderFunc = Canvas.randomShaderFunc = '\
        float random(vec3 scale, float seed) {\
            /* use the fragment position for a different seed per-pixel */\
            return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\
        }\
    ';

    function parseColor(color) {
        color = teacss.jQuery.color.parse(color);
        return [color.r/255,color.g/255,color.b/255,color.a];
    }

    effects.fromDimensions = function(w,h) {
        if (w<1) w = 1;
        if (h<1) h = 1;
        this.width = w;
        this.height = h;
    }
    effects.fromImage = function(url) {
        var me = this;
        this.image = teacss.functions.image(url);
        if (!this.image.width) {
            this.image = document.createElement('canvas');
            this.image.width = 1;
            this.image.height = 1;
        }
        this.width = this.image.width;
        this.height = this.image.height;
        this.setState('image');
    }

    effects.draw2D = function(callback) {
        this.getCanvas2d();
        callback(this.context);
        this.setState('canvas');
    }
    effects.draw3D = function (shader,textures,uniforms) {
        var gl = this.gl;
        this.spareTexture = this.spareTexture || new Texture(this.gl,this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE)
        var texdata = {},t=0;
        for (var key in textures) {
            texdata[key] = t;
            textures[key].use(t);
            t+=1;
        }
        this.spareTexture.drawTo(function(){
            shader.textures(texdata).uniforms(uniforms).drawRect();
        })
        this.spareTexture.swapWith(this.getTexture());
    }

    effects.multiply = function(other) {
        var gl = this.gl;
        gl.multiplyShader = gl.multiplyShader || new Shader(gl,null, '\
            uniform sampler2D tex0;\
            uniform sampler2D tex1;\
            varying vec2 texCoord;\
            void main() {\
                vec4 c0 = texture2D(tex0, texCoord);\
                vec4 c1 = texture2D(tex1, texCoord);\
                vec4 color;\
                color.r = c0.r * c1.r;\
                color.g = c0.g * c1.g;\
                color.b = c0.b * c1.b;\
                color.a = c0.a;\
                gl_FragColor = color;\
            }\
        ');
        this.draw3D(gl.multiplyShader,{tex0:this.getTexture(),tex1:other.getTexture()},{});
        this.setState('texture');
        return this;
    }

    effects.multiplyColor = function(color) {
        color = teacss.Color.parse(color);
        color = [color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255,color.alpha];

        var gl = this.gl;
        gl.multiplyColorShader = gl.multiplyColorShader || new Shader(gl,null,'\
            uniform sampler2D tex0;\
            uniform vec4 c1;\
            varying vec2 texCoord;\
            void main() {\
                vec4 c0 = texture2D(tex0, texCoord);\
                gl_FragColor = c0*c1;\
            }\
        ')
        this.draw3D(gl.multiplyColorShader,{tex0:this.getTexture()},{c1:color});
        this.setState('texture');
        return this;
    }

    effects.copyFill = function (other,offsetX,offsetY) {
        var otherScale = [this.width/other.width,this.height/other.height];
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        var thisTexture = this.getTexture();
        var otherTexture = other.getTexture();

        var gl = this.gl;
        gl.copyFillShader = gl.copyFillShader || new Shader(gl,null, '\
            uniform sampler2D texture,other;\
            uniform vec2 otherScale;\
            uniform vec2 otherOffset;\
            varying vec2 texCoord;\
            void main() {\
                vec4 otherColor = texture2D(other, fract(texCoord * otherScale + otherOffset));\
                gl_FragColor = otherColor;\
            }\
        ');
        this.draw3D(gl.copyFillShader,
            {texture:thisTexture,other:otherTexture},
            {otherScale:otherScale,otherOffset:[-offsetX/other.width,-offsetY/other.height]}
        );
    }

    effects.fill = function (other,mask,offsetX,offsetY) {
        var otherScale = [this.width/other.width,this.height/other.height];
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        var thisTexture = this.getTexture();
        var otherTexture = other.getTexture();

        var gl = this.gl;
        if (!mask) {
            gl.fillShader = gl.fillShader || new Shader(gl,null, [
                "uniform sampler2D texture,other;",
                "uniform vec2 otherScale;",
                "uniform vec2 otherOffset;",
                "varying vec2 texCoord;",
                "void main() {",
                "    vec4 otherColor = texture2D(other, fract(texCoord * otherScale + otherOffset));",
                "    vec4 thisColor = texture2D(texture, texCoord);",
                "    gl_FragColor = thisColor * (1.0-otherColor.a) + otherColor * otherColor.a;",
                "    gl_FragColor.a = 1.0;",
                "}"
            ].join("\n"));
            this.draw3D(gl.fillShader,
                    {texture:thisTexture,other:otherTexture},
                    {otherScale:otherScale,otherOffset:[-offsetX/other.width,-offsetY/other.height]}
            );
        } else {
            var maskScale = [this.width/mask.width, this.height/mask.height];
            var maskTexture = mask.getTexture();

            gl.fillMaskShader = gl.fillMaskShader || new Shader(gl,null, '\
                uniform sampler2D texture,other,mask;\
                uniform vec2 otherScale,maskScale;\
                varying vec2 texCoord;\
                void main() {\
                    vec4 maskColor = texture2D(mask, fract(texCoord * maskScale));\
                    vec4 otherColor = texture2D(other, fract(texCoord * otherScale));\
                    vec4 thisColor = texture2D(texture, texCoord);\
                    gl_FragColor = thisColor * (1.0-maskColor.a * otherColor.a) + otherColor * maskColor.a * otherColor.a;\
                }\
            ');

            this.draw3D(gl.fillMaskShader,
                    {texture:thisTexture,other:otherTexture,mask:maskTexture},
                    {otherScale:otherScale,maskScale:maskScale}
            );
        }
        this.setState('texture');
        return this;
    }

    effects.fillColor = function (color) {
        color = teacss.Color.parse(color);
        color = [color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255,color.alpha];
        
        var gl = this.gl;
        gl.fillColorShader = gl.fillColorShader || new Shader(gl,null,[
            "uniform vec4 c1;",
            "void main() {",
            "    gl_FragColor = c1;",
            "}"
        ].join("\n"))
        this.draw3D(gl.fillColorShader,{tex0:this.getTexture()},{c1:color});
        this.setState('texture');
        return this;
    }

    effects.gradient = function (stops) {
        var gl = this.gl;
        gl.gradientShader = gl.gradientShader || new Shader(gl,null, '\
            uniform vec4 color1,color2;\
            varying vec2 texCoord;\
            void main() {\
                gl_FragColor = color1 * (1.0-texCoord.x) + color2 * texCoord.x;\
            }\
        ');

        var stop_list = [];
        for (var i=0;i<stops.length;i++) {
            var stop = stops[i];
            var x = stop[0];
            var color = stop[1];
            stop_list.push({x:x,color:parseColor(color)});
        }

        if (stops.length==0) return;

        stop_list.splice(0,0,{x:0,color:stop_list[0].color});
        stop_list.push({x:1,color:stop_list[stop_list.length-1].color});

        for (var i=0;i<stop_list.length-1;i++) {
            var stop1 = stop_list[i];
            var stop2 = stop_list[i+1];

            var texture = this.getTexture();
            var left  = stop1.x * this.width;
            var right = stop2.x * this.width;

            if (left!=right)
                texture.drawTo(function(){
                    gl.gradientShader
                            .uniforms({color1:stop1.color,color2:stop2.color})
                            .drawRect(left,undefined,right,undefined);
                })
        }
        this.setState('texture');
        return this;
    }

    effects.triangleBlur = function (radius) {
        var gl = this.gl;
        gl.triangleBlurShader = gl.triangleBlurShader || new Shader(gl,null, '\
            uniform sampler2D texture;\
            uniform vec2 delta;\
            varying vec2 texCoord;\
            ' + randomShaderFunc + '\
            void main() {\
                vec4 color = vec4(0.0);\
                float total = 0.0;\
                \
                /* randomize the lookup values to hide the fixed number of samples */\
                float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\
                \
                for (float t = -30.0; t <= 30.0; t++) {\
                    float percent = (t + offset - 0.5) / 30.0;\
                    float weight = 1.0 - abs(percent);\
                    color += texture2D(texture, texCoord + delta * percent) * weight;\
                    total += weight;\
                }\
                gl_FragColor = color / total;\
            }\
        ');

        this.draw3D(gl.triangleBlurShader,{texture:this.getTexture()},{delta: [radius / this.width,  0]});
        this.draw3D(gl.triangleBlurShader,{texture:this.getTexture()},{delta: [0, radius / this.height]});
        this.setState('texture');
        return this;
    }

    effects.flip = function(flipX,flipY) {
        var gl = this.gl;
        gl.flipShader =  gl.flipShader || new Shader(gl,'\
            attribute vec2 vertex;\
            attribute vec2 _texCoord;\
            varying vec2 texCoord;\
            uniform float flipX;\
            uniform float flipY;\
            void main() {\
                texCoord = _texCoord;\
                gl_Position = vec4((vertex.x * 2.0 - 1.0)*flipX, (vertex.y * 2.0 - 1.0)*flipY, 0.0, 1.0);\
            }'
        ,null);
        this.draw3D(gl.flipShader,{texture:this.getTexture()},{flipX:flipX ?-1:1,flipY:flipY ?-1:1});
        this.setState("texture");
        return this;
    }

    effects.hueSaturation = function(hue, saturation) {
        var gl = this.gl;
        gl.hueSaturationShader = gl.hueSaturationShader || new Shader(gl,null, '\
            uniform sampler2D texture;\
            uniform float hue;\
            uniform float saturation;\
            varying vec2 texCoord;\
            void main() {\
                vec4 color = texture2D(texture, texCoord);\
                \
                /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */\
                float angle = hue * 3.14159265;\
                float s = sin(angle), c = cos(angle);\
                vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;\
                float len = length(color.rgb);\
                color.rgb = vec3(\
                    dot(color.rgb, weights.xyz),\
                    dot(color.rgb, weights.zxy),\
                    dot(color.rgb, weights.yzx)\
                );\
                \
                /* saturation adjustment */\
                float average = (color.r + color.g + color.b) / 3.0;\
                if (saturation > 0.0) {\
                    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));\
                } else {\
                    color.rgb += (average - color.rgb) * (-saturation);\
                }\
                \
                gl_FragColor = color;\
            }\
        ');

        function clamp(lo, value, hi) {
            return Math.max(lo, Math.min(value, hi));
        }
        this.draw3D(gl.hueSaturationShader,{texture:this.getTexture()},{
            hue: clamp(-1, hue, 1),
            saturation: clamp(-1, saturation, 1)
        });
        this.setState('texture');
        return this;
    }

    effects.brightnessContrast = function(brightness, contrast, invert) {
        var gl = this.gl;
        gl.brightnessContrastShader = gl.brightnessContrastShader || new Shader(gl,null, '\
            uniform sampler2D texture;\
            uniform float brightness;\
            uniform float contrast;\
            uniform vec2 invert;\
            varying vec2 texCoord;\
            void main() {\
                vec4 color = texture2D(texture, texCoord);\
                color.rgb = color.rgb * invert.x + vec3(invert.y);\
                color.rgb += brightness;\
                if (contrast > 0.0) {\
                    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;\
                } else {\
                    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;\
                }\
                gl_FragColor = color;\
            }\
        ');

        function clamp(lo, value, hi) {
            return Math.max(lo, Math.min(value, hi));
        }
        this.draw3D(gl.brightnessContrastShader,{texture:this.getTexture()},{
            brightness: clamp(-1, brightness, 1),
            contrast: clamp(-1, contrast, 1),
            invert: invert ? [-1,1] : [1,0]
        });
        this.setState('texture');
        return this;
    }

    /**
     * Replace up to 5 color in the texture
     * @param colors hash array in form { color1 : replacement1 , color2 : replacement2 } and so on
     */
    effects.replaceColors = function (colors) {
        var gl = this.gl;
        gl.replaceColorsShader = gl.replaceColorsShader || new Shader(gl,null, '\
            uniform sampler2D texture;\
            uniform vec3 color1;\
            uniform vec3 color2;\
            uniform vec3 color3;\
            uniform vec3 color4;\
            uniform vec3 color5;\
            uniform vec3 replace1;\
            uniform vec3 replace2;\
            uniform vec3 replace3;\
            uniform vec3 replace4;\
            uniform vec3 replace5;\
            varying vec2 texCoord;\
            void main() {\
                vec4 color = texture2D(texture, texCoord);\
                if (color1==color.rgb) color.rgb = replace1;\
                if (color2==color.rgb) color.rgb = replace2;\
                if (color3==color.rgb) color.rgb = replace3;\
                if (color4==color.rgb) color.rgb = replace4;\
                if (color5==color.rgb) color.rgb = replace5;\
                gl_FragColor = color;\
            }\
        ');

        var color;
        var params = {};
        for (var i=1;i<=5;i++) {
            params['color'+i] = [1,1,1];
            params['replace'+i] = [1,1,1];
        }
        i = 1;
        for (var key in colors) {
            color = teacss.Color.parse(key);
            params['color'+i] = [color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255];
            color = teacss.Color.parse(colors[key]);
            params['replace'+i] = [color.rgb[0]/255,color.rgb[1]/255,color.rgb[2]/255];
            if (++i>5) break;
        }
        this.draw3D(gl.replaceColorsShader,{tex0:this.getTexture()},params);
        this.setState('texture');
        return this;
    }

    effects.preview = function () {
        var gl = this.gl;
        this.getTexture().use(0);
        
        gl.viewport(0, 0, this.width, this.height);
        gl.previewShader = gl.previewShader || new Shader(gl,[
            "attribute vec2 vertex;",
            "attribute vec2 _texCoord;",
            "varying vec2 texCoord;",
            "uniform vec2 scale;",
            "void main() {",
            "    texCoord = _texCoord*scale;",
            "    gl_Position = vec4(vertex.x * 2.0 - 1.0, 1.0 - vertex.y * 2.0, 0.0, 1.0);",
            "}"
        ].join("\n"),[
            "uniform sampler2D texture;",
            "varying vec2 texCoord;",
            "void main() {",
            "    vec2 tex = mod(texCoord,1.0);",
            "    gl_FragColor = texture2D(texture, texCoord);",
            "}"
        ].join("\n"));
        
        gl.previewShader
            .textures({texture:0})
            .uniforms({scale:[1,1]})
            .drawRect();
    }

    var previewCanvasCache = {};
    effects.background = function () {
        var canvas = this;
        var tea = teacss.tea;
        var selector = tea.Style.current.getSelector();
        var id = selector.replace(/[^A-Za-z_0-9-]/g,"_")+"_canvas";
        
        Canvas.defaultElement.width = canvas.width;
        Canvas.defaultElement.height = canvas.height;
        canvas.preview();
        
        var element, context;
        var cached = previewCanvasCache[id];
        if (cached) {
            element = cached.element;
            context = cached.context;
        } 
        else {
            element = document.createElement("canvas");
            context = element.getContext('2d');
            previewCanvasCache[id] = { element: element, context : context }
        }

        element.width = canvas.width;
        element.height = canvas.height;
        
        context.drawImage(Canvas.defaultElement,0,0);
        
        var doc = teacss.tea.document ? teacss.tea.document : document;
        if (doc.mozSetImageElement) {
            tea.rule('background-image','-moz-element(#'+id+')');
            doc.mozSetImageElement(id,element);
        } else {
            tea.rule('background-image','-webkit-canvas('+id+')');
            context = doc.getCSSCanvasContext("2d",id,canvas.width,canvas.height);
            context.drawImage(element,0,0);
        }
        return canvas;
    }
    
    return effects;
}()