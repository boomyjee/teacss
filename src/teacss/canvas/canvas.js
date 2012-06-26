// TODO: review canVG for future use
teacss.Canvas = teacss.functions.Canvas = teacss.Canvas || function() {
    function wrap(name,func) {
        return function() {
            if (this.run || !Canvas.wrap) {
                func.apply(this,arguments);
            } else {
                this.queque.push({
                    name: name,
                    args: arguments,
                    done : false,
                    func : func
                })
            }
            return this;
        }
    }
    var counter = 0;

    var Canvas = function () {
        this.init.apply(this,arguments);
    }

    Canvas.prototype.init = function (w,h,context) {
        this.state = {canvas:false,texture:false,image:false}
        this.counter = counter;
        this.run = false;
        this.queque = [];

        var me = this;
        for (var e in Canvas.effects)
            this[e] = wrap(name,Canvas.effects[e])


        if (typeof(w)=='string') element = h;
        if (!context) {
            if (!Canvas.defaultContext) {
                Canvas.defaultElement = document.createElement('canvas');
                Canvas.defaultContext = Canvas.defaultElement.getContext('experimental-webgl');
            }
            context = Canvas.defaultContext;
        }
        this.gl = context;

        if (typeof(w)=='string') {
            this.fromImage(w)
        } else
            this.fromDimensions(w,h)
    }

    Canvas.prototype.toJSON = function() {
        var data = [];
        for (var i=0;i<this.queque.length;i++) {
            var item = this.queque[i];
            var args = [];
            for (var a=0;a<item.args.length;a++) {
                var arg = item.args[a];
                args.push((arg && arg.toJSON) ? arg.toJSON() : arg);
            }
            data.push({name:item.name,args:args});
        }
        return $.toJSON(data);
    }

    Canvas.wrap = false;
    Canvas.cache = {};
    Canvas.prototype.realize = function() {
        if (this.run || !Canvas.wrap) return;

        var json = this.toJSON();
        var cached = Canvas.cache[json];

        if (cached) {
            for (var i=0;i<this.queque.length;i++) this.queque[i].done = true;
            this.texture = cached.texture;
            this.spareTexture = cached.spareTexture;
            this.canvas2d = cached.canvas2d;
            this.context = cached.context;
            this.width = cached.width;
            this.height = cached.height;
            this.image = cached.image;
            this.state = cached.state;
            this.dataURL = cached.dataURL;
        } else {
            this.run = true;
            for (var i=0;i<this.queque.length;i++) {
                var item = this.queque[i];
                if (!item.done) {
                    for (var a=0;a<item.args.length;a++) {
                        var arg = item.args[a];
                        if (arg instanceof Canvas) arg.realize();
                    }
                    item.func.apply(this,item.args);
                    item.done = true;
                }
            }
            this.run = false;
            if (!teacss.functions.image.getDeferred())
                Canvas.cache[json] = this;
        }
    }

    Canvas.prototype.setState = function(state) {
        for (var i in this.state) this.state[i]=false;
        this.state[state] = true;
    }
    Canvas.prototype.getCanvas2d_wrap = wrap('getCanvas2d',function(){
        if (this.state.canvas) return;
        if (!this.canvas2d) {
            this.canvas2d = document.createElement('canvas');
            this.canvas2d.width = this.width;
            this.canvas2d.height = this.height;
        }
        this.context = this.canvas2d.getContext('2d');
        if (this.state.image) {
            this.context.drawImage(this.image,0,0);
        } else if (this.state.texture) {
            var w = this.width;
            var h = this.height;
            var array = new Uint8Array(w * h * 4);
            var gl = this.gl;
            this.texture.drawTo(function() {
                gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, array);
            });
            var data = this.context.createImageData(w,h);
            for (var i = 0; i < array.length; i++) { data.data[i] = array[i]; }
            this.context.putImageData(data, 0, 0);
        }
        this.state.canvas = true;
    })
    Canvas.prototype.getCanvas2d = function() {
        this.getCanvas2d_wrap();
        this.realize();
        return this.canvas2d;
    }
    Canvas.prototype.getTexture_wrap = wrap('getTexture',function(){
        if (this.state.texture) return;
        if (this.state.image) {
            this.texture = Texture.fromImage(this.gl,this.image);
        } else
            this.texture = Texture.fromImage(this.gl,this.getCanvas2d());
        this.state.texture = true;
    })
    Canvas.prototype.getTexture = function () {
        this.getTexture_wrap();
        this.realize();
        return this.texture;
    }
    Canvas.prototype.toDataURL_wrap = wrap('toDataURL',function(){
        this.dataURL = this.getCanvas2d().toDataURL();
    })
    Canvas.prototype.toDataURL = function() {
        this.toDataURL_wrap();
        this.realize();
        return this.dataURL;
    }
    Canvas.prototype.destroy = function () {
        this.dataURL = null;
        if (this.texture) {
            this.texture.destroy();
            this.texture = null;
        }
        if (this.spareTexture) {
            this.spareTexture.destroy();
            this.spareTexture = null;
        }
        if (this.image) {
            this.image = null;
        }
        if (this.canvas2d) {
            this.canvas2d.width = 0;
            this.canvas2d.height = 0;
            this.canvas2d = null;
        }
    }
    return Canvas;
}();