var teacss = teacss || (function(){
    var teacss = {
        // runtime
        tea: false,
        // files cache (just text)
        files:{},
        // function to export before loading sheet (teacss.function.some_func can be refereced as some_func)
        functions:{},
        // parsed cache
        parsed:{},
        // sheets registered on start
        sheets:{},
        // aliases for mixins
        aliases:{}
    };
    
    // LazyLoad library
    LazyLoad_f=function(k){function p(b,a){var g=k.createElement(b),c;for(c in a)a.hasOwnProperty(c)&&g.setAttribute(c,a[c]);return g}function l(b){var a=m[b],c,f;if(a)c=a.callback,f=a.urls,f.shift(),h=0,f.length||(c&&c.call(a.context,a.obj),m[b]=null,n[b].length&&j(b))}function w(){var b=navigator.userAgent;c={async:k.createElement("script").async===!0};(c.webkit=/AppleWebKit\//.test(b))||(c.ie=/MSIE/.test(b))||(c.opera=/Opera/.test(b))||(c.gecko=/Gecko\//.test(b))||(c.unknown=!0)}function j(b,a,g,f,h){var j=
    function(){l(b)},o=b==="css",q=[],d,i,e,r;c||w();if(a)if(a=typeof a==="string"?[a]:a.concat(),o||c.async||c.gecko||c.opera)n[b].push({urls:a,callback:g,obj:f,context:h});else{d=0;for(i=a.length;d<i;++d)n[b].push({urls:[a[d]],callback:d===i-1?g:null,obj:f,context:h})}if(!m[b]&&(r=m[b]=n[b].shift())){s||(s=k.head||k.getElementsByTagName("head")[0]);a=r.urls;d=0;for(i=a.length;d<i;++d)g=a[d],o?e=c.gecko?p("style"):p("link",{href:g,rel:"stylesheet"}):(e=p("script",{src:g}),e.async=!1),e.className="lazyload",
    e.setAttribute("charset","utf-8"),c.ie&&!o?e.onreadystatechange=function(){if(/loaded|complete/.test(e.readyState))e.onreadystatechange=null,j()}:o&&(c.gecko||c.webkit)?c.webkit?(r.urls[d]=e.href,t()):(e.innerHTML='@import "'+g+'";',u(e)):e.onload=e.onerror=j,q.push(e);d=0;for(i=q.length;d<i;++d)s.appendChild(q[d])}}function u(b){var a;try{a=!!b.sheet.cssRules}catch(c){h+=1;h<200?setTimeout(function(){u(b)},50):a&&l("css");return}l("css")}function t(){var b=m.css,a;if(b){for(a=v.length;--a>=0;)if(v[a].href===
    b.urls[0]){l("css");break}h+=1;b&&(h<200?setTimeout(t,50):l("css"))}}var c,s,m={},h=0,n={css:[],js:[]},v=k.styleSheets;return{css:function(b,a,c,f){j("css",b,a,c,f)},js:function(b,a,c,f){j("js",b,a,c,f)}}};
    
    LazyLoad = LazyLoad_f(this.document);
    
    // github.com/mbostock/queue
    (function(){function a(a){function l(){if(g&&d<a){var b=g,c=b[0],f=Array.prototype.slice.call(b,1),m=b.index;g===h?g=h=null:g=g.next,++d,f.push(function(a,b){--d;if(i)return;a?e&&k(i=a,e=j=g=h=null):(j[m]=b,--e?l():k(null,j))}),c.apply(null,f)}}var c={},d=0,e=0,f=-1,g,h,i=null,j=[],k=b;return arguments.length<1&&(a=Infinity),c.defer=function(){if(!i){var a=arguments;a.index=++f,h?(h.next=a,h=h.next):g=h=a,++e,l()}return c},c.await=function(a){return k=a,e||k(i,j),c},c}function b(){}typeof module=="undefined"?self.queue=a:module.exports=a,a.version="0.0.2"})();    
    teacss.queue = queue;
    
    function trim(text) {
        var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
		return (text || "").replace( rtrim, "" );
	}
    
    teacss.trim = trim;
    
    teacss.functions.tea = teacss.tea = (function (){
        var tea = {
            path: false, 
            dir: false,
            appended: [],
            scope: false
        };
        tea.rule = function() {
            tea.scope.rule.apply(tea.scope,arguments);
        };
        tea.import = function (path) {
            function setPath(path) {
                if (path) {
                    var dir = path.replace(/\\/g,"/").split('/');dir.pop();dir = dir.join("/")+'/';
                    tea.dir = dir;
                    tea.path = path;
                } else {
                    tea.dir = false;
                    tea.path = false;
                }
            }
            var parsed = teacss.parsed[path];
            if (parsed) {
                var old_path = this.path;
                setPath(path);
                
                if (!parsed.func) {
                    // Generate pass - generate js code from syntax tree
                    if (!parsed.js) {
                        var output = "";
    
                        for (var i=0;i<parsed.ast.children.length;i++) 
                            output += parsed.ast.children[i].getJS(teacss.tea.Style);
                
                        output = "(function(){with (teacss.functions){\n" + output;
                        output += "\n}})"+"//@ sourceURL="+path;
                        
                        parsed.js = output;
                    }
                    
                    // Compile pass, evaluate js to function
                    try {
                        parsed.func = eval(parsed.js);
                    } catch (e) {
                        console.debug(path);
                        console.debug(e);
                        console.debug(parsed.js);
                        throw e;
                    }
                }
                parsed.func.call(window);
                setPath(old_path);
            }
        };        
        return tea;
    })();    
    
    teacss.Scope = {
        extend: function (extra) {
            var res = {};
            for (var key in this) res[key] = this[key];
            for (var key in extra) res[key] = extra[key];
            return res;
        },
        
        format: "string",
        
        init: function () {
            var old_scope = teacss.tea.scope;
            teacss.tea.scope = this;
            var res = this.run.apply(this,arguments);
            teacss.tea.scope = old_scope;
            return res;
        },
        run: function () {
            this.rule.apply(this,arguments);
        },
        getJS: function (ast) {
            var output = "";
            // test for mixin
            var match;
            if (match = /^\.([-0-9A-Za-z_\.]+)(<[-0-9A-Za-z_]+>)*(\(.*\))\s*$/.exec(ast.selector)) {
                if (ast.is_block) {
                    output += match[1] + " = function "+match[3]+" {";
                    for (var i=0;i<ast.children.length;i++)
                        output += ast.children[i].getJS(this);
                    output += "}";
                } else {
                    output += ast.selector.substring(1)+";";
                }
                return output;
            }
            
            function string_format(s) { return '"'+s.replace(/(["\\])/g,'\\$1').replace(/\n(\s*)/g,'\\n"+\n$1"')+'"'; }

            var selector_string = "";
            if (this.format=="string") {
                for (var t=0;t<ast.selector_tokens.length;t++) {
                    var token = ast.selector_tokens[t];
                    if (t!=0) selector_string += "+";
                    switch (token.name) {
                        case "js_inline": selector_string += '('+token.data.slice(1)+')'; break;
                        case "js_inline_block": selector_string += '('+token.data.slice(2,-1)+')'; break;
                        case "rule": 
                            var data = token.data;
                            if (t==0 && token.data[0]=="!") data = token.data.substring(1);
                            if (t==ast.selector_tokens.length-1) data = data.replace(/\s+$/,'');
                            selector_string += string_format(data); 
                            break;
                    }
                }
            } else {
                if (!ast.is_block && ast.selector_key) {
                    selector_string = string_format(ast.selector_key)+","+ast.selector_value;
                } else {
                    selector_string = string_format(ast.selector.replace(/\s+$/,''));
                }
            }
            
            var keyword = (ast.scope && teacss.tea[ast.scope]) ? ast.scope + ".init" : "rule";
            if (ast.is_block) {
                output += "tea."+keyword+"(";
                
                if (ast.value_scope && teacss.tea[ast.value_scope]) {
                    var val = teacss.tea[ast.value_scope].getJS(ast.value_node);
                    if (val[val.length-1]==";") val = val.substring(0,val.length-1);
                    output += string_format(ast.selector_key)+","+val;
                    output += ");";
                } else {
                    output += selector_string+",function(){";
                    for (var i=0;i<ast.children.length;i++)
                        output += ast.children[i].getJS(this);
                    output += "});";    
                }
            } else {
                output += "tea."+keyword+"("+selector_string+");"
            }
            return output;
        }
    }
    
    teacss.tea.Script = teacss.Scope.extend({
        // parser
        getJS: function (ast) {
            var output = "";
            output += "tea.Script.init('"+trim(ast.selector.replace(/^Script\s*/,''))+"',function(){";
            for (var i=0;i<ast.children.length;i++) {
                var child = ast.children[i];
                if (child.name=="rule") {
                    if (child.is_block) {
                        output += "tea.Script.append(function()"+child.flatten().replace(/^@append\s*/,'')+");";
                    } else {
                        output += "tea.Script.append("+child.selector.replace(/^@append\s*/,'')+");";
                    }
                } else {
                    output += child.getJS();
                }
            }
            output += "});";
            return output;            
        },
        // events
        start: function () {
            this.files = {};
        },
        finish: function () {},
        // runtime
        init: function (name,f) {
            var old_list = this.list;
            if (!this.list || name!='') {
                name = (name=='') ? 'default':name;
                this.list = this.files[name] = this.files[name] || [];
            }
            f.call(this);
            this.list = old_list;
        },
        append: function (what) {
            if (!(what && what.call && what.apply)) {
                what = teacss.getFullPath(what,teacss.tea.path);
            }
            this.list.push(what);
        },
        get: function (names,callback) {
            var q = new queue(10);
            
            if (!names) {
                names = [];
                for (var key in this.files) names.push(key);
            }
            if (names.constructor!=Array) names = [names];
            
            var list = [];
            for (var n=0;n<names.length;n++) {
                var key = names[n];
                if (!this.files[key]) continue;
                for (var i=0;i<this.files[key].length;i++)
                    list.push( this.files[key][i] );
            }
            
            for (var i=0;i<list.length;i++) {
                var what = list[i];
                if (what && what.call && what.apply) {
                    list[i] = what.toString().replace(/^\s*function\s*\(.*?\)\s*/,'');
                } else {
                    var path = what;
                    q.defer(function(i,list,path,done){
                        teacss.getFile(path,function(data){
                            list[i] = data;
                            done();
                        });
                    },i,list,path);
                }
            }
            q.await(function(){
                callback(list.join(';\n'));
            });
        },
        insert: function (document,names) {

            var id = "script_"+(teacss.tea.processed).replace(/[^A-Za-z0-9]/g,'_');
            var node = document.getElementById(id);
            if (node) return;
            
            var loader = LazyLoad_f(document);
            var q = new queue(1);
            
            var head;
            var doc = document;
            head || (head = doc.head || doc.getElementsByTagName('head')[0]);
            
            if (!names) {
                names = [];
                for (var key in this.files) names.push(key);
            }
            if (names.constructor!=Array) names = [names];
            var list = [];
            for (var n=0;n<names.length;n++) {
                var key = names[n];
                if (!this.files[key]) continue;
                for (var i=0;i<this.files[key].length;i++) {
                    var what = this.files[key][i];
                    
                    if (what && what.call && what.apply) {
                        list.push(what);
                    } else {
                        if (list.length==0 || list[list.length-1].apply) list.push([]);
                        list[list.length-1].push(what);
                    }
                }
            }
            
            node = document.createElement("script");
            node.id = id;
            head.appendChild(node);
            
            for (var i=0;i<list.length;i++) {
                var what = list[i];
                if (what && what.call && what.apply) {
                    q.defer(function (what,done){
                        var code = what.toString().replace(/^\s*function\s*\(.*?\)\s*/,'');
                        script = document.createElement("script");
                        script.innerHTML = code;
                        head.appendChild(script);
                    },what);
                } else {
                    q.defer(function(what,done){
                        loader.js(what,done);
                    },what);
                }
            }
        }
    });
    
    teacss.tea.Style = teacss.Scope.extend({
        // events
        start: function () {
            this.rules = [];
            this.indent = "";
            this.appends = [];
        },
        finish: function () {},
        // runtime
        Rule : function(parent,selector) {
            this.code = [];
            this.parent = parent;
            this.selector = selector;
            this.indent = teacss.tea.Style.indent;
            this.print = function(s) { this.code.push(s); }
            this.getSelector = function() {
                this.fullSelector = this.selector;
                if (this.parent && this.parent.selector) {
                    var parent_full = this.parent.getSelector();
                    var parent_items = parent_full.split(",");
                    var parts = [];
                    for (var j=0;j<parent_items.length;j++) {
                        var parent_sel = trim(parent_items[j]);
                        var items = this.selector.split(",");
                        for (var i=0;i<items.length;i++) {
                            var sel = trim(items[i]);
                            if (sel.indexOf("&")!=-1)
                                sel = sel.replace(/&/g,parent_sel);
                            else
                                sel = parent_sel + " " + sel;
                            parts.push(sel);
                        }
                    }
                    this.fullSelector = parts.join(", ");
                }
                return this.fullSelector;
            }
            this.getOutput = function () {
                if (!this.code.length) return "";
                var output = "";
                var selector = this.getSelector();
                if (selector) output += this.indent+selector + " {\n";
                for (var i=0;i<this.code.length;i++)
                    output += this.indent+"    "+this.code[i]+";\n";
                if (selector) output += this.indent+"}\n";
                return output;
            }
            teacss.tea.Style.rules.push(this);
        },
        rule: function (key,val) {
            if (val && val.constructor && val.call && val.apply) {
                if (key && key[0]=='@') return this.namespace(key,val);
                this.current = new this.Rule(this.current,key);
                val.call(this.current);
                this.current = this.current.parent;            
            } else {
                var s = (val!==undefined) ? key+':'+val : key;
                
                if (key.substring(0,7)=="@append") return this.append(s);
                if (val && teacss.aliases[key]) {
                    window[teacss.aliases[key]](trim(val.substring(1)));
                    return;
                }
                
                if (this.current)
                    this.current.print(s);
                else
                    this.rules.push({indent:this.indent,getOutput:function(){return this.indent+s+";\n";}});
            }
        },
        namespace: function (selector,func) {
            this.indent = "    ";
            this.rules.push({getOutput:function(){return selector+' {\n'}});
            func.call(this.current);
            this.rules.push({getOutput:function(){return '}\n'}});
            this.indent = "";
        },
        append: function (path) {
            path = path.replace(/^@append\s*/,'');
            if (path[0]=='"' || path[0]=="'") path = path.substring(1,path.length-1);
            
            var ext = path.split(".").pop();
            if (ext=="js") {
                teacss.tea.Script.init('',function(){
                    teacss.tea.Script.append(path);
                });
            } else {
                this.appends.push(teacss.getFullPath(path,teacss.tea.path));
            }
        },
        get: function (callback,filter) {
            var output = "";
            for (var i=0;i<this.rules.length;i++) output += this.rules[i].getOutput();
            
            var appended = [];
            var q = queue(10);
            for (var i=0;i<this.appends.length;i++) {
                q.defer(function(i,path,done){
                    teacss.getFile(path,function(text){
                        if (filter) text = filter(text,path);
                        appended[i] = text;
                        done();
                    });
                },i,this.appends[i]);
            }
            q.await(function(){
                callback(appended.join("\n")+output);
            });
        },
        insert: function (document) {
            var css = "";
            for (var i=0;i<this.rules.length;i++) css += this.rules[i].getOutput();
            
            var id = "style_"+teacss.tea.processed.replace(/[^A-Za-z0-9]/g,'_');
            var node = document.getElementById(id);
            if (!node) {
                var head = document.getElementsByTagName("head")[0];
                for (var i=0;i<this.appends.length;i++) {
                    var append = document.createElement("link");
                    append.type = "text/css";
                    append.rel = "stylesheet";
                    append.href = this.appends[i];
                    head.appendChild(append);
                }
                
                node = document.createElement("style");
                node.type = "text/css";
                node.id = id;
                head.appendChild(node);
            }
            var rules = document.createTextNode(css);
            if (node.styleSheet) {
                node.styleSheet.cssText = rules.nodeValue;
            } else {
                node.innerHTML = "";
                node.appendChild(rules);
            }
        }
    })
        
    teacss.getFullPath = function(path,base) {
        base = (base===undefined) ? location.href:base;
        if (!(path[0]=='/' ||
            path.indexOf("http://")==0 ||
            path.indexOf("https://")==0))
        {
            var last = base.lastIndexOf("/");
            base = (last==-1) ? "" : base.substring(0,last)+"/";
            path = base+path;
        }
        if (path.indexOf(".js")==-1 && path.indexOf(".tea")==-1 && path.indexOf(".css")==-1) path += ".tea";
        return path;
    }    
        
    teacss.getFile = function(path,callback) {
        if (teacss.files[path]) {
            callback(teacss.files[path]);
            return;
        }
        var xhr = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : (XMLHttpRequest && new XMLHttpRequest()) || null;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var text = teacss.files[path] = xhr.status==200 ? xhr.responseText:false;
                try {
                    callback(text);
                } catch (e) {
                    setTimeout(function(){ throw e; },1);
                }
            }
        }
        xhr.open('GET', path, true);
        xhr.send();
    }
    
    teacss.parseFile = function(path,callback) {
        if (teacss.parsed[path]) {
            if (callback) callback(teacss.parsed[path]);
            return;
        }
        teacss.getFile(path,function(text){
            if (text) {
                var parsed = teacss.parse(text,path);
                if (parsed.errors.length) {
                    console.debug(path);
                    console.debug(parsed.js);
                    throw parsed.errors[0].message;
                }
            } else {
                var parsed = false;
            }
            teacss.parsed[path] = parsed;
            if (callback) callback(parsed);
        });
    }
        
    teacss.process = function (path,callback,document) {
        if (path[0]=="/") path = location.protocol + "//" +location.host+path;

        function processFile(path,callback) {
            teacss.parseFile(path,function(parsed){
                if (!parsed) callback();
                if (parsed.imports.length==0) callback();
                var loaded = 0;
                var loaded_cb = function () {
                    loaded++;
                    if (loaded==parsed.imports.length) callback();
                }
                for (var i=0;i<parsed.imports.length;i++) {
                    processFile(parsed.imports[i],loaded_cb);
                }                    
            });
        }
        
        processFile(path,function(){
            for (var key in teacss.tea) {
                if (teacss.tea[key] && teacss.tea[key].start) teacss.tea[key].start();
            }
            teacss.tea.processed = path;
            teacss.tea.scope = teacss.tea.Style;
            teacss.tea.document = document;
            teacss.tea.import(path);
            
            for (var key in teacss.tea) {
                if (teacss.tea[key] && teacss.tea[key].finish) teacss.tea[key].finish();
            }
            callback();
        });
    }
        
    teacss.sheets = function () {
        var sheets = [];
        if (typeof document=='undefined') return [];
        var links_css = document.getElementsByTagName('link');
        var links_js = document.getElementsByTagName('script');
        var links = [];
        for (var i = 0; i < links_css.length; i++) links.push(links_css[i]);
        for (var i = 0; i < links_js.length; i++)  links.push(links_js[i]);
        for (var i = 0; i < links.length; i++) {
            var tea = links[i].getAttribute('tea');
            if (tea) {
                sheets.push({src:tea});
            }
        }
        return sheets;
    }();    
    
    teacss.update = function() {
        if (teacss.updating) {
            teacss.refresh = true;
            return;
        }
        
        teacss.updating = true;
        teacss.refresh = false;
        
        var q = queue(1);
        for (var i=0;i<teacss.sheets.length;i++) {
            var sheet = teacss.sheets[i];
            q.defer(function(sheet,done){
                teacss.process(
                    sheet.src,
                    function(){
                        teacss.tea.Style.insert(document);
                        teacss.tea.Script.insert(document);
                        done(); 
                    },
                    document
                );
            },sheet);
        }
        q.await(function(){
            if (teacss.onUpdate) teacss.onUpdate();
            teacss.updating = false;
            if (teacss.refresh) teacss.update();
        });
    }
        
    teacss.StringStream = (function(){
        function StringStream(string, tabSize) {
            this.pos = this.start = 0;
            this.string = string;
        }
        StringStream.prototype = {
            eol: function() {return this.pos >= this.string.length;},
            peek: function() {return this.string.charAt(this.pos);},
            next: function() {
                if (this.pos < this.string.length)
                return this.string.charAt(this.pos++);
            },
            eat: function(match) {
                var ch = this.string.charAt(this.pos);
                if (typeof match == "string") var ok = ch == match;
                else var ok = ch && (match.test ? match.test(ch) : match(ch));
                if (ok) {++this.pos; return ch;}
            },
            skipToEnd: function() {this.pos = this.string.length;},
            skipTo: function(ch) {
                var found = this.string.indexOf(ch, this.pos);
                if (found > -1) {this.pos = found; return true;}
            },
            skipToMultiple: function(list) {
                var found = -1;
                for (var i=0;i<list.length;i++) {
                    var res = this.string.indexOf(list[i], this.pos);
                    if (res > -1 && (res < found || found==-1)) found = res;
                }
                if (found > -1) {this.pos = found; return true;}
            },
            backUp: function(n) {this.pos -= n;},
            match: function(pattern, consume, caseInsensitive) {
                if (typeof pattern == "string") {
                    function cased(str) {return caseInsensitive ? str.toLowerCase() : str;}
                    if (cased(this.string).indexOf(cased(pattern), this.pos) == this.pos) {
                        if (consume !== false) this.pos += pattern.length;
                        return true;
                    }
                }
                else {
                    var match = this.string.slice(this.pos).match(pattern);
                    if (match && consume !== false) this.pos += match[0].length;
                    return match;
                }
            },
            current: function(){return this.string.slice(this.start, this.pos);}
        };
        return StringStream;
    })();
    
    teacss.LexerStack = (function(){
        function LexerStack() {
            this.states = [];
            this.data = this.state = false;
        }
        LexerStack.prototype = {
            push: function (state,data) {
                data = data || {};
                this.states.push({state:this.state=state,data:this.data=data});
            },
            pop: function () {
                if (this.states.length<=1) return false;
                this.states.pop();
                this.data  = this.states[this.states.length-1].data; 
                this.state = this.states[this.states.length-1].state;
                return true;
            }
        }
        return LexerStack;
    })();
    
    teacss.token = function (stream,stack) {
        switch (stack.state) {
            case "scope":
                if (stream.match("}")) { 
                    if (!stack.pop()) return "pop_error"; 
                    return 'scope_end'; 
                }
                if (stream.match(/^[ \t\n\r]+/)) return "blank";
                if (stream.match(";")) return "nop";
                if (stream.match("@ ")) { stack.push("js_line"); return 'js_line'; }
                if (stream.match("@{")) { stack.push("js_block"); return 'js_block_start'; }
                if (stream.match("@import")) { stack.push("import"); return 'import_start'; }
                if (stream.match("/*",false)) { stack.push('comment'); return 'comment'; }
                if (stream.match("//",false)) { stack.push('comment_line'); return 'comment_line'; }
                if (stream.match("@")) return "rule";
                stack.push('rule');
                return null;
    
            case "js_line":
                if (stream.peek()=="\n") { stream.next(); stack.pop(); return "blank"; }
                if (!stream.skipTo("\n")) stream.skipToEnd();
                return "js_line";
            case "js_block":
                if (stream.match("'")) { stack.push('string_single',{token:"js_code"}); return "js_code"; }
                if (stream.match('"')) { stack.push('string_double',{token:"js_code"}); return "js_code"; }
                if (stream.match("//")) { stack.push("comment_line",{token:"js_code"}); return "js_code"; }
                if (stream.match("/*")) { stack.push("comment",{token:"js_code"}); return "js_code"; }
                if (stream.match("@{")) { stack.push("scope"); return "scope_start_js"; }
    
                if (stack.data.braces===undefined) stack.data.braces = 1;
                if (stream.peek()=="{") stack.data.braces++;
                if (stream.peek()=="}") stack.data.braces--;
                stream.next();
                
                if (stack.data.braces==0) { 
                    if (!stack.pop()) return "pop_error"; 
                    return "js_block_end"; 
                }
                return "js_code";

            case "import":
                var state = stack.state;
                if (!stream.skipToMultiple([';','{','}','\n'])) stream.skipToEnd();
                stack.pop();
                return state;
    
            case "comment":
                var token = stack.data.token || "comment";
                if (stream.skipTo("*/")) {
                    stream.pos += 2; stack.pop();
                } else
                    stream.skipToEnd();
                return token;
            case "comment_line":
                var token = stack.data.token || "comment_line";
                if (stream.skipTo("\n")) stream.next(); else stream.skipToEnd();
                stack.pop();
                return token;
                
            case "rule":
                if (stream.match("@{")) { stack.push("js_inline_block"); return "js_inline_block"; }
                if (stream.match("@")) { stack.push("js_inline"); return "js_inline"; }
                
                if (stack.data.string_single) {
                    if (stream.peek()=="'" && stream.string[stream.pos-1]!='\\') stack.data.string_single = false;
                }
                else if (stack.data.string_double) {
                    if (stream.peek()=='"' && stream.string[stream.pos-1]!='\\') stack.data.string_double = false;
                }
                else if (stack.data.inside_url) {
                    if (stream.peek()==")") stack.data.inside_url = false;
                }
                else {
                    if (stream.peek()=="'") { stack.data.string_single = true; }
                    else if (stream.peek()=='"') { stack.data.string_double = true; }
                    else if (stream.match("url(",false)) { stack.data.inside_url = true; }
                    else if (stream.peek()==';' || stream.peek()=='}') { stack.pop(); return null; }
                    else if (stream.peek()=='{') { stream.next(); stack.pop(); stack.push('scope'); return "scope_start"; }
                }
                stream.next();
                return "rule";
                
            case "js_inline":
                if (stack.data.braces===undefined) stack.data.braces = 0;
                if (stream.peek()=="(") stack.data.braces++;
                if (stream.peek()==")") {
                    stack.data.braces--;
                    if (stack.data.braces<0) { stack.pop(); return null; }
                }
                
                if (!stack.data.braces && !/[0-9a-zA-Z_$\.\[\]\(\)]/.test(stream.peek())) 
                    stack.pop();
                else
                    stream.next();
                return "js_inline";
                
            case "js_inline_block":
                if (stream.match("'")) { stack.push('string_single',{token:"js_inline_block"}); return "js_inline_block"; }
                if (stream.match('"')) { stack.push('string_double',{token:"js_inline_block"}); return "js_inline_block"; }
    
                if (stack.data.braces===undefined) stack.data.braces = 1;
                if (stream.peek()=="{") stack.data.braces++;
                if (stream.peek()=="}") stack.data.braces--;
                stream.next();
                
                if (stack.data.braces==0) stack.pop(); 
                return "js_inline_block";
        
            case "string_single":
                var token = stack.data.token || "string_double";
                if (stream.peek()=="'" && stream.string[stream.pos-1]!="\\") stack.pop();
                stream.next();
                return token;
            
            case "string_double":
                var token = stack.data.token || "string_double";
                if (stream.peek()=='"' && stream.string[stream.pos-1]!="\\") stack.pop();
                stream.next();
                return token;
        }
    }
        
    teacss.Metadata = (function(){
        function Metadata(name,parent,selector,start,end) {
            this.selector = selector;
            this.start = start;
            this.end = end;
            this.parent = parent;
            this.children = [];
            if (parent) parent.children.push(this);
        }
        return Metadata;
    })();
    
    teacss.SyntaxNode = (function(){
        function SyntaxNode(name,data) {
            this.children = [];
            this.name = name;
            this.data = data;
        }
        SyntaxNode.prototype = {
            push: function (name,data) {
                var ast = new SyntaxNode(name,data);
                this.children.push(ast);
                ast.parent = this;
                return ast;
            },
            flatten: function () {
                var output = this.data;
                if (this.is_block) output += "{";
                for (var i=0;i<this.children.length;i++) {
                    output += this.children[i].flatten();
                }
                if (this.is_block) output += "}";
                return output;
            },
            getJS: function (scope) {
                var ast = this;
                var output = "";
                switch (ast.name) {
                    case "js_line":
                        output += ast.data.substring(2);
                        break;
                        
                    case "blank":
                    case "comment":
                    case "comment_line": 
                    case "js_code":
                        output += ast.data; 
                        break;
                        
                    case "import":
                        output += "/* @import" + ast.data + " */";
                        output += ' tea.import("'+ast.fullPath+'");';
                        break;
                        
                    case "js_block":
                    case "rule_js":
                        output += "{";
                        for (var i=0;i<ast.children.length;i++) output += ast.children[i].getJS(scope);
                        output += "}";
                        break;
                        
                    case "rule":
                        if (ast.scope && teacss.tea[ast.scope]) scope = teacss.tea[ast.scope];
                        output += scope.getJS(ast);
                        break;
                }
                return output;
            }
        }
        return SyntaxNode;
    })();
        
    teacss.parse = function (code,path) {
        var stream = new teacss.StringStream(code);
        var stack = new teacss.LexerStack();
        
        var ext = path.split(".").pop();
        
        if (ext=="js") {
            var output = "";
            output = "(function(){with (teacss.functions){\n" + code;
            output += "\n}})"+"//@ sourceURL="+path;
            
            return {
                js: output,
                errors: [],
                imports: [],
                ast: false
            }            
        }        
        
        // Lexer pass, we just convert code to plain token array
        // token - string with type, e.g. {type:"rule",data:"foo"}
        var tokens = [];
        stack.push("scope");
        
        while (!stream.eol()) {
            var name = teacss.token(stream,stack);
            var current = stream.current();
            if (current) {
                if (tokens.length && name==tokens[tokens.length-1].name) {
                    tokens[tokens.length-1].data += current;
                } else {
                    tokens.push({name:name,data:current});
                }
                stream.start = stream.pos;
            }
        }
        
        // Syntax pass, convert token array to AST (Abstract Syntax Tree)
        var root_ast = new teacss.SyntaxNode("rule");
        var ast = root_ast;
        var pos = 0;

        for (var t=0;t<tokens.length;t++) {
            var token = tokens[t];
            switch (token.name) {
                // AS IS tokens, one token - one ast node with the same name
                case "js_line":
                case "blank":
                case "comment":
                case "comment_line": ast.push(token.name,token.data); break;

                // import tokens, calculate full path for later inclusion
                case "import":
                    var s = trim(token.data), sub;
                    if (s[0]=='"' && s.indexOf('"',1)!=-1)
                        sub = s.slice(1,s.indexOf('"')-1);
                    else if (s[0]=="'" && s.indexOf("'",1)!=-1)
                        sub = s.slice(1,s.indexOf("'")-1);
                    else
                        sub = s.split(" ")[0];
                    sub = teacss.getFullPath(sub,path);
                    ast.push(token.name,token.data).fullPath = sub;
                    break;         
                    
                // new rule node with empty selector
                case "scope_start":
                    ast = ast.push("rule");
                    ast.selector = "";
                    ast.selector_tokens = [];
                    ast.start = pos;
                    ast.is_block = true;
                    ast.scope = "";
                    break;
                    
                // we start a new rule node, probably with children if it's a block rule
                case "rule":
                case "js_inine":
                case "js_inline_block":
                    ast = ast.push("rule");
                    // gather all the tokens that define rule selector
                    ast.selector = token.data;
                    ast.selector_tokens = [token];
                    ast.start = pos;
                    if (tokens[t+1])
                        while (tokens[t+1].name=="rule" || 
                               tokens[t+1].name=="js_inline" || 
                               tokens[t+1].name=="js_inline_block") 
                        { 
                            ast.selector_tokens.push(tokens[t+1]); t++;
                            ast.selector += tokens[t+1].data;
                            pos += tokens[t+1].data.length;
                        }
                    ast.data = ast.selector;
                    var is_block = ast.is_block = (tokens[t+1] && tokens[t+1].name=="scope_start");
                    if (ast.is_block) t++;
                    
                    // selector switches to a new scope
                    var scope = ast.selector.split(" ",1)[0];
                    ast.scope = scope;
                    
                    // it's a key-value selector
                    if (token.name=="rule" && token.data.indexOf(":")!=-1) {
                        ast.selector_key = token.data.split(":",1)[0];
                        ast.selector_value = ast.selector.substring(ast.selector_key.length+1);
                        
                        // check if value part switches to a new scope
                        var scope = ast.selector_value.replace(/^\s*/,"").split(" ",1)[0];
                        if (is_block) {
                            ast.value_scope = scope;
                            var value_tokens = [{name:"rule",data:token.data.substring(ast.selector_key.length+1)}];
                            for (var i=1;i<ast.selector_tokens.length;i++) value_tokens.push(ast.selector_tokens[i]);
                            ast.value_node = {
                                name:"rule",
                                scope:ast.value_scope,
                                selector: ast.selector_value.replace(/^\s+/,''),
                                selector_tokens: value_tokens,
                                children:ast.children,
                                is_block: true,
                                start: ast.start + ast.selector_value.length + 1
                            };
                        }
                    }
                    
                    if (!is_block) { ast.end = ast.start+ast.selector.length; ast = ast.parent; }
                    break;
                
                // we treat in js scopes as special type of rule
                case "scope_start_js": ast = ast.push("rule_js"); break;
                    
                // scope_end closes rule nodes and rule_js nodes
                case "scope_end": 
                    ast.end = pos + token.data.length;
                    if (ast.value_node) ast.value_node.end = ast.end;
                    ast = ast.parent; break;
                
                // js block syntax
                case "js_block_start": ast = ast.push("js_block"); break;
                case "js_code": ast.push(token.name,token.data); break;
                case "js_block_end": ast = ast.parent; break;                    
            }
            pos += token.data.length;
        }


        // Extract @import tags
        var imports = [];
        function get_imports(ast) {
            if (ast.name=="import") imports.push(ast.fullPath);
            for (var i=0;i<ast.children.length;i++) get_imports(ast.children[i]);
        }
        get_imports(root_ast);
        
        return {
            js: false,
            errors: [],
            imports: imports,
            ast: ast
        }
    }
    return teacss;
})();