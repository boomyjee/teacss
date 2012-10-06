QUnit.start();
QUnit.test('Native', function () {
    var samples = [
        "multiline"
    ];
    
    var dir = "cases/native/";
    var q = queue(1);
    
    QUnit.stop();
    for (var test in samples) {
        q.defer(function(test,done){
            var source = dir+"tea/"+samples[test] + ".tea";
            teacss.getFile(dir+"css/"+samples[test] + ".css",function(csssample){
                QUnit.start();
                teacss.process(source,function(){
                    teacss.tea.Style.get(function(css){
                        QUnit.start();
                        if (css!=csssample) {
                            var a = 0;
                            var b = 100;
                            console.debug(css.substr(a,b-a)==csssample.substr(a,b-a));
                            console.debug(css.substr(a,b-a));
                            console.debug(csssample.substr(a,b-a));
                            QUnit.push(css==csssample,css,csssample,samples[test]);
                        } else {
                            ok(css==csssample,samples[test]);
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