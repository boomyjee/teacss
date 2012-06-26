<?
    if (isset($_POST['files'])) {
        file_put_contents(__DIR__."/../lib/teacss.js",$_POST['files']['/teacss.js']);
        return;
    }
?>
<html>
    <head>
        <title>teacss</title>
        
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
                $.post(
                    location.href,
                    {
                        files:files
                    },
                    function () {
                        alert('Success!');
                    }
                ); 
            }
        </script>
    </body>
</html>