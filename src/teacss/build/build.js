teacss.build = (function () {
    var path = teacss.path;
        
    /**
     * Builds tea file into js|css|images object
     */
    var build = function(makefile, options) {
        
        var defaults = {
            scriptPath: "",

            stylePath: "",
            styleName: "default.css",
            
            imagesPath: "",
                    
            templatePath: "",
            templateScriptPath: "",
            templateStylePath: "",
            
            callback: false
        }
            
        for (var key in defaults) if (options[key]==undefined) options[key] = defaults[key];
        
        var files = {};        
        

        var old_canvasBackground = teacss.Canvas.effects.background;
        teacss.Canvas.effects.background = function (part) {
            if (part) {
                if (path.isAbsoluteOrData(part)) {
                    part = path.relative(path.clean(part),outDir);
                }
                files[options.imagesPath+"/"+part] = this.toDataURL();
            } else {
                part = this.toDataURL();
            }
            teacss.tea.Style.rule("background-image:url("+part+");");
        }
        
        teacss.building = true;
        teacss.process(makefile,function(){        
            
            teacss.building = false;
            
            teacss.Canvas.effects.background = old_canvasBackground;
            var q = teacss.queue(10);
            
            // Style
            q.defer(function(done){
                teacss.tea.Style.get(
                    function(css){
                        files[options.stylePath+"/"+options.styleName] = css;
                        done();
                    },
                    function(css,href) {
                        return css.replace(/url\(['"]?([^'"\)]*)['"]?\)/g, function( whole, part ) {
                            var rep = (!path.isAbsoluteOrData(part)) ? path.dir(path.clean(href)) + part : part;
                            return 'url('+rep+')';
                        });
                    }
                );        
            });
            
            // Script
            for (var file in teacss.tea.Script.files) {
                q.defer(function(file,done){
                    teacss.tea.Script.get([file],function(js){
                        files[options.scriptPath+"/"+file+".js"] = js;
                        done();
                    });
                },file);
            }
            
            // Template
            var list = teacss.tea.Template ? teacss.tea.Template.templates : [];
            for (var key in list) {
                var file = options.templatePath+"/"+key+".liquid";
                var text = list[key].text;
                
                text = text.replace(
                    teacss.tea.Template.styleMark,
                    "<link type='text/css' rel='stylesheet' href='{{ '"+options.templateStylePath+"/default.css' | url }}'>"
                );
                text = text.replace(
                    new RegExp(teacss.tea.Template.scriptMark.replace("name","(.*?)"),"g"),
                    "<script src='{{ '"+options.templateScriptPath+"/$1.js' | url }}'></script>"
                );
                files[file] = text;
            }        
            
            if (options.callback) q.await(function(){
                options.callback(files);
            });
        });
        return;
    }
        
    build.run = function (s) {
        var url = teacss.sheets[s].src;
        teacss.build(url,{callback:teacss.buildCallback});
    }
        
    var bodyLoaded = function () {
        var body = document.getElementsByTagName('body')[0];
        if (!body) return setTimeout(bodyLoaded,100);
        if (!teacss.buildCallback) return;
        
        var div = document.createElement('div');
        div.id = "teacss-build-panel";
        div.style.position = 'fixed';
        div.style.right = '3px';
        div.style.top = '3px';
        
        body.appendChild(div);
        
        var html = "";
        html += '<div style="border:1px solid #555;padding:5px;margin:0;background:#333;color:#fff;">';
        for (var s=0;s<teacss.sheets.length;s++) {
            html += 'Build <a style="cursor:pointer;color:#ffa;padding:0;margin:0;background:transparent;border:none;" onclick="teacss.build.run('+s+')"><pre style="display:inline;padding:0;margin:0;background:transparent;border:none;">' 
                + teacss.sheets[s].src + '</pre></a><br>'
        }
        html += '</div>';
        
        div.innerHTML = html;        
    }
    bodyLoaded();        
        
        
    return build;
})();