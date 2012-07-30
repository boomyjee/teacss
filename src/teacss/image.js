teacss.functions.image_url = function (sub) {
    return "url("+teacss.functions.image.base+sub+")";
}

teacss.image = teacss.functions.image = teacss.image || (function(){
    var cache = {images:{}};
    var deferred = 0;
    var startDeferred = function() {  deferred++; }
    var endDeferred = function (callback) {
        deferred--;
        if (deferred==0) {
            if (callback)
                callback.apply();
            else 
                teacss.image.update();
        }
    }

    var load = function (list,callback) {
        var list = (list.constructor==Array) ? list : [list];
        var left = list.length;
        var local_callback = function (url) {
            left--;
            if (left==0) callback(list);
        }
        var ret = [];
        for (var i=0;i<list.length;i++) {
            var url = list[i];

            if (!url) {
                local_callback(url);
                ret.push(false);
                continue;
            }

            var cached = cache.images[url];
            if (cached) {
                if (cached.callbacks) {
                    cached.callbacks.push(local_callback);
                } else {
                    local_callback(url);
                }
            } else {
                var image = new Image();
                var after = function (url,error) {
                    return function () {
                        var callbacks = cache.images[url].callbacks;
                        cache.images[url] = error ? {width:0,height:0} : cache.images[url].image;
                        for (var c=0;c<callbacks.length;c++) callbacks[c](url);
                    }
                };
                image.onload = after(url,false);
                image.onerror = after(url,true);

                cache.images[url] = {image:image,callbacks:[local_callback]};
                image.src = list[i];
            }
            ret.push(cache.images[url]);
        }
        return ret;
    }
        
    var noimage = document.createElement("canvas");
    noimage.width = 1;
    noimage.height = 1;
    noimage.getContext('2d');
        
    var constructor = function (sub) {
        var url = sub;
        var end_deferred = false;
        
        var image = load(url,function(){
            if (end_deferred) endDeferred();
        })[0];
        if (image.callbacks) {
            end_deferred = true;
            startDeferred();
            return noimage;
        } else {
            return image;
        }
    }
    constructor.base = "/";
    constructor.getDeferred = function () { return deferred; };
    constructor.startDeferred = startDeferred;
    constructor.endDeferred = endDeferred;
    constructor.load = load;
    constructor.update = function () { teacss.update(); }

    return constructor;
})();