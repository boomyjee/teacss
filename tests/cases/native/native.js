test('Native', function () {
    var samples = [
        "import"
    ];

    return;
    for (var test in samples){
        var dir = "cases/native/";
        var source = dir+"tea/"+samples[test] + ".tea";

        var css = teacss.build(source,"out.css",false,{minifyJS:false,minifyCSS:false}).css;
        var csssample = teacss.getFile(dir+"css/"+samples[test] + ".css");

        if (css!=csssample) {
            QUnit.push(css==csssample,css,csssample,samples[test]);
        } else {
            ok(css==csssample,samples[test]);
        }
    }
});