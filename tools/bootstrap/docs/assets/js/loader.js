function getTemplate(url) {
    var tpl = "";
    $.ajax({async: false, url: url, success: function (data) { tpl = data; }})
    return tpl;
}

var hogan = Hogan;
var name = window.location.search.replace("?","") ||'index';
var layout = getTemplate('templates/layout.mustache');
layout = hogan.compile(layout,{ sectionTags: [{o:'_i', c:'i'}] });

var page = getTemplate("templates/pages/"+name+".mustache");
var context = {};
context[name.replace(/\.mustache$/, '')] = 'active'
context._i = true

page = hogan.compile(page,{ sectionTags: [{o:'_i', c:'i'}] });
page = layout.render(context, {
    body: page
})

$("body").html(page);