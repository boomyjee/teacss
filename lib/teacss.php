<?

function teacss($makefile,$css,$js,$dir,$dev,$teacss=false) {
    if ($dev) {
        if (isset($_REQUEST['remote'])) {
            ob_get_clean();
            echo file_get_contents($_REQUEST['remote']); 
            die();
        }
        if (isset($_POST['css'])) {
            ob_get_clean();
            if ($js) file_put_contents(realpath($dir)."/".basename($js),$_POST['js']);
            if ($css) file_put_contents(realpath($dir)."/".basename($css),$_POST['css']);
            echo 'ok';
            die();
        }   
        
        echo ob_get_clean();
        
        ?>
            <? if ($teacss): ?>
                <script src="<?=$teacss?>"></script>
            <? endif ?>
            <script tea="<?=$makefile?>"></script>
            <script>teacss.update()</script>
            <script>
                teacss.buildCallback = function (files) {
                    var request = new XMLHttpRequest();
                    request.open('POST', location.href, true);
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    request.onload = function() {
                        if (request.status >= 200 && request.status < 400) {
                            console.debug(request.responseText);
                            alert('done');
                        }
                    };                    
                    request.send(
                        "css="+encodeURIComponent(files['/default.css'])+"&"+
                        "js="+encodeURIComponent(files['/default.js'])
                    );
                }
            </script>
        <?
        return 'dev';
    } else {
        echo ob_get_clean();
        ?>
            <? if ($js): ?><script src="<?=$js?>"></script><? endif ?>
            <? if ($css): ?><link href="<?=$css?>" rel="stylesheet" type="text/css"><? endif ?>
        <?
        return 'release';
    }
}

ob_start();