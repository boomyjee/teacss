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
            var rootStylePath = false;
            if (options.stylePath && path.isAbsoluteOrData(options.stylePath)) {
                rootStylePath = teacss.path.absolute(options.stylePath);
            }            
            q.defer(function(done){
                teacss.tea.Style.get(
                    function(css){
                        files[options.stylePath+"/"+options.styleName] = css;
                        done();
                    },
                    function(css,href) {
                        return css.replace(/url\(['"]?([^'"\)]*)['"]?\)/g, function( whole, part ) {
                            var rep = (!path.isAbsoluteOrData(part) && href!==undefined) ? path.dir(path.clean(href)) + part : part;
                            if (rootStylePath) rep = path.relative(rep,rootStylePath);
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
        var sheet = teacss.sheets[s];
        var url = sheet.src;
        
        var scriptPath = sheet.element.getAttribute("data-js-path");
        var stylePath = sheet.element.getAttribute("data-css-path");
        
        teacss.build(url,{
            callback:teacss.buildCallback,
            scriptPath: scriptPath || undefined,
            stylePath: stylePath || undefined
        });
    }
        
    var bodyLoaded = function () {
        var body = document.getElementsByTagName('body')[0];
        if (!body) return setTimeout(bodyLoaded,100);
        if (!teacss.buildCallback) return;
        if (window.buildLoaded) return;
        window.buildLoaded = true;
        
        var div = document.createElement('div');
        div.id = "teacss-build-panel";
        div.style.position = 'fixed';
        div.style.right = '3px';
        div.style.top = '3px';
        div.style.zIndex = 100000;
        
        var css = "";
        css += "#teacss-build-panel { display: none; font-size: 12px !important; }";
        css += "body:hover #teacss-build-panel { display: block; }";
        css += "#teacss-build-panel > div { border:1px solid #555;padding:5px;margin:0;background:#333;color:#fff; }";
        css += "#teacss-build-panel a { cursor:pointer;color:#ffa;padding:0;margin:0;background:transparent;border:none; text-decoration:none; }";
        css += "#teacss-build-panel a:hover { text-decoration: underline; }";
        css += "#teacss-build-panel pre  { display:inline;padding:0;margin:0;background:transparent;border:none; }";
        
        var node = document.createElement('style');
        node.type = "text/css";
        var rules = document.createTextNode(css);
        if (node.styleSheet) {
            node.styleSheet.cssText = rules.nodeValue;
        } else {
            node.innerHTML = "";
            node.appendChild(rules);
        }        

        body.appendChild(node);
        body.appendChild(div);
        
        var html = "";
        html += '<div>';
        for (var s=0;s<teacss.sheets.length;s++) {
            html += 'Build <a onclick="teacss.build.run('+s+')"><pre style="">' 
                + teacss.sheets[s].src + '</pre></a> '
                + '<a onclick="this.parentNode.parentNode.removeChild(this.parentNode)">[close]</a><br>'
        }
        html += '</div>';
        
        div.innerHTML = html;        
    }
    bodyLoaded();        
        
        
    return build;
})();