QUnit.start();
QUnit.test('API Tests', function () {
    var samples = [
        "compile_error",
        "run_error"
    ];
    
    var validators = {
        compile_error: function () {
            return lastError && !lastError.line && lastError.e instanceof SyntaxError;
        },
        run_error: function () {
            console.debug(lastError.e.stack);
            return lastError && lastError.line==2;
        }
    }    
    
    var dir = "cases/api/";
    var q = queue(1);
    
    var lastError = false;
    
    teacss.onError = function (info) {
        lastError = info;
    }
    
    QUnit.stop();
    for (var test in samples) {
        q.defer(function(test,done){
            var source = dir+"tea/"+samples[test] + ".tea";
            QUnit.start();
            teacss.process(source,function(){
                QUnit.start();
                
                if (validators[samples[test]]) {
                    var res = validators[samples[test]]();
                    ok(res,samples[test]);
                }
                
                QUnit.stop();
                done();
            });
            QUnit.stop();
        },test);

    }
    q.await(function(){
        QUnit.start();
        teacss.onError = false;
    });    
});