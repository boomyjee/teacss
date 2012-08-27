<?
    if (isset($_POST['files'])) {
        file_put_contents(__DIR__."/../lib/teacss.js",$_POST['files']['/teacss.js']);
        file_put_contents(__DIR__."/../tools/donut/donut.min.js",$_POST['files']['/donut.min.js']);
        return;
    }
?>
<html>
    <head>
        <title>teacss</title>
        <meta charset="utf-8">
        
        <link tea="../src/build.tea">
        <script src="http://code.jquery.com/jquery-1.7.2.js"></script>
        
        <script src="../src/teacss/core.js"></script>
        <script src="../src/teacss/build/build.js"></script>
        <script>teacss.update()</script>
    </head>
    <body>
        <h1>Build page for teacss</h1>
        <script>
            teacss.buildCallback = function (files) {
                
                var donut = "../tools/donut/donut.tea";
                teacss.process(donut,function(){
                    var imports = [];
                    function getImports(path) {
                        var parsed = teacss.parsed[path];
                        if (parsed) {
                            imports.push(path);
                            for (var i=0;i<parsed.imports.length;i++) {
                                getImports(parsed.imports[i]);
                            }
                        }
                    }
                    getImports(donut);
                    
                    var js = "// donut minified ";
                    for (var i=0;i<imports.length;i++) {
                        var im = imports[i];
                        js += "\n"+"teacss.parsed["+JSON.stringify(im)+"] = ";
                        js += "{func:"+teacss.parsed[im].js+"\n};";
                    }
                    
                    js += "teacss.parsed["+JSON.stringify(imports[0])+"].func()";
                    
                    files['/donut.min.js'] = js;
                    
                    $.post(
                        location.href,
                        {
                            files:files
                        },
                        function () {
                            alert('Success!');
                        }
                    ); 
                });
            }
        </script>
    </body>
</html>