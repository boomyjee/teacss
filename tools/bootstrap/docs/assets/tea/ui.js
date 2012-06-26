$(".navbar,.subnav").addClass("fixed_fix");
var form = ui.form("body",function(){
    ui.group('Bootstrap options'); {
        ui.fieldset("Hyperlinks"); {
            ui.label({value:"linkColor:",width:200});
            ui.colorPicker({name:"linkColor",width:100,height:20});
            ui.html({html:"<br>"});
            ui.label({value:"linkColorHover:",width:200});
            ui.colorPicker({name:"linkColorHover",width:100,height:20});
        }
        ui.fieldset("Grid system"); {
            ui.label({value:"gridColumns:",width:150});
            ui.slider({name:"gridColumns",margin:"0 20px",min:6,max:24});
            ui.label({value:"gridWidth:",width:150});
            ui.slider({name:"gridWidth",margin:"0 20px",min:800,max:1200});
            ui.label({value:"gridRatio:",width:150});
            ui.slider({name:"gridRatio",margin:"0 20px",min:0,max:1.0,step:0.05});
        }
        ui.fieldset("Typography"); {
            ui.label({value:"textColor:",width:200});
            ui.colorPicker({name:"textColor",width:100,height:20});
            ui.label({value:"baseFontSize:",width:150});
            ui.slider({name:"baseFontSize",margin:"0 20px",min:10,max:20});
            ui.label({value:"baseLineHeight:",width:150});
            ui.slider({name:"baseLineHeight",margin:"0 20px",min:10,max:20});
        }
        ui.fieldset("Save"); {
            ui.html({
                html: jQuery("<div id='download_button'>")
            });
            jQuery(function(){
                jQuery("#download_button").downloadify({
                    filename: function(){
                        return "bootstrap.zip";
                    },
                    data: function(){
                        var bundle = teacss.build("assets/tea/style.tea","../css/bootstrap.js");
                        var separated = teacss.build("assets/tea/style.tea","../css/bootstrap");

                        var zip = new JSZip();
                        zip.add("bootstrap.js",separated.js);
                        zip.add("bootstrap.css",separated.css);
                        zip.add("bootstrap.bundle.js",bundle.js);

                        zip.folder("images");
                        zip.add("images/glyphicons-halflings.png","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",{base64:true});
                        zip.add("images/glyphicons-halflings-white.png","iVBORw0KGgoAAAANSUhEUgAAAdUAAACFCAMAAAA6npKGAAAAhFBMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9hWbqAAAAAK3RSTlMAzw/vn78vX98frz9/TY9PgG8J9tirS6iiSBseyfN1w5P51e0nkMAqese9zI5zvgAAEABJREFUeF7tnYlypDiXha/WBWiy819m3fflvP/7TRhwK8y5SmBwuatqdCoq03GQbwp9SCnhG0J+HnVZB8AthsFvMkrBx2yw88Yhu2GUT9FwxbcBCFa+Y3H7sM9KAkiSlgCy4qhShYhg5Wawyewb7I0osA+asMhX5+XVUQa4WSaHoQgp4kFe2w8AEOicq8gvZMvmFtWvcVjW79rHGytijZdG+5z0rYEAAmNPU7UhcGFUVaxK1NV3H4OOcElkdDseravDZgBYXhzXZKaTfOWrTQ7BL4sgTFUY0uaK7repWrNrIQ8Yaw3gW+1zyhcDI8Dydo6qW69uJy8V3QIvavTDM8rHoAPSAndfCV+vDi9VT1Q9iVNeUbNvyG9SxTtVfCpVhrrjZwCY5YXaB6D2abZbglnBGaRzVAMWhWZnrVgVqIJxfduBeD+pXeENq7EeUjWhapIqSQ7vcon8SP7NvnpdDNVYssiVvH4otU/LD4gruIhBRbqnagFTSgDsvuiv27/NiEAUFkSh6lpUF6wLVEhVQtVHSMVstok7Pz8XuptftfB21/rq/e/VONgKlbCS64jege9kk8tnqI4BKAvbEF9TFUDOUh3WHhyRiapYY6x4gMYLfciYF3sW9pM8yN9IkVfHTYiuWyNwdDClQtWoUvsA1D7NdsuO+L6kGivV8f9ONY4fjz3gxqWjTbvCXry31nvxoHPXZ2Nx8R/C/iM8yGeqx3213J8tDVR9GoEP2od8HoFX3oGR6iNwsJZG4EtUPTWkB4zh6ZUXD3gPePF09ipUmYEMeN135I/rdHr82u9Vrj7Pltrtc+ynd5gB6YAqzZauU33kxVS+yZIB8uQIKzb5xkyDlDHJE+6cb2dsmu2Xfq9y9Xll026fY98g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",{base64:true});
                        return zip.generate();
                    },
                    swf: tea.dir+'../js/downloadify.swf',
                    downloadImage: tea.dir+'../img/download.png',
                    width: 100, height: 30, dataType: 'base64',
                    transparent: true, append: false
                })
            })
        }
    }

},{
    width: 355,
    height: 800,
    align: 'left',
    value: {
        linkColor: 'red',
        linkColorHover: {func:'darken',args:[{ref:'linkColor'},15]},

        gridColumns: 12,
        gridWidth: 940,
        gridRatio: 0.25,

        baseFontSize: 13,
        baseLineHeight: 18,
        textColor: '#333'
    }
})

var data = form.value;

linkColor = data.linkColor;
linkColorHover = data.linkColorHover;

var x = Math.floor((data.gridWidth) / (data.gridColumns-data.gridRatio));
gridColumns = data.gridColumns;
gridGutterWidth = Math.floor(x * data.gridRatio);
gridColumnWidth = x - gridGutterWidth;

baseFontSize = data.baseFontSize+'px';
baseLineHeight = data.baseLineHeight+'px';
textColor = data.textColor;

