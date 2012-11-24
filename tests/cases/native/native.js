QUnit.start();
QUnit.test('Native', function () {
    var samples = [
        "multiline",
        "namespace",
        "js_script",
        "js_append"
    ];
    
    var dir = "cases/native/";
    var q = queue(1);
    
    QUnit.stop();
    for (var test in samples) {
        q.defer(function(test,done){
            var source = dir+"tea/"+samples[test] + ".tea";
            
            var ext = 'css';
            var scope = 'Style';
            
            if (samples[test].substring(0,2)=="js") {
                ext = "js";
                scope = "Script";
            }
            
            teacss.getFile(dir+ext+"/"+samples[test] + "." + ext,function(sample){
                QUnit.start();
                teacss.process(source,function(){
                    teacss.tea[scope].get(function(code){
                        QUnit.start();
                        if (code!=sample) {
                            QUnit.push(code==sample,code,sample,samples[test]);
                        } else {
                            ok(code==sample,samples[test]);
                        }
                        QUnit.stop();
                        done();
                    });
                });
                QUnit.stop();
            });            
        },test);

    }
    q.await(function(){
        QUnit.start();
    });
});