<p align="center">
    <a href="http://teacss.org/">
        <img alt="TeaCSS" title="TeaCSS" src="/images/teacss.jpg">
    </a>
</p>

<p align="center">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg">
    <img alt="state" src="https://img.shields.io/badge/state-success-lightgrey">
    <img alt="awesome" src="https://camo.githubusercontent.com/fef0a78bf2b1b477ba227914e3eff273d9b9713d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f617765736f6d652533462d796573212d627269676874677265656e2e737667">
    <img alt="javascript" src="https://img.shields.io/badge/javascript-+-green">
</p>

<p align="center">
    CSS templates for JavaScript.
</p>

# Description

TeaCSS extends CSS with dynamic behaviour of JavaScript.

It offers features similar to LESS.js or SASS such as variables, mixins and functions.

However, it has a lot of advantages.

-   Easier to debug (because TeaCSS compiles to line-to-line Javascript),
-   Faster to compile (very simple single pass parser that is less than 300 lines of code), supports any current and future CSS-rules,
-   Bundles with own framework - donut
-   Has a number of extensions to simplify development process - ui, canvas
-   Can be used as build system also (some kind of Makefile but for browser)
-   If used as build system can produce JS and CSS files for your web application

### Write some tea-style:
```javascript
.box_shadow(x, y, blur, alpha) {   
    @ color = 'rgba(0, 0, 0, ' + alpha + ')'
    box-shadow: @color  @x  @y  @blur;
    -webkit-box-shadow: @color  @x  @y  @blur;   
    -moz-box-shadow: @color  @x  @y  @blur;  
}  
.box {   
    @ base = '#f938ab';
    @ border_color = lighten(base, 30);
    color: @{saturate(base, 5)};   
    div {   
        .box_shadow(0, 0, '5px', 0.4);   
        border: 1px @border_color solid;   
    }  
}  
```
### Include teacss.js with your styles:
```javascript
<link tea="style.tea">
<script src="teacss.js"></script>  
```
# Overview

Tea is not a new language. It is a CSS preprocessor, that just adds Javascript embedding (with some syntaxic sugar) and rule nesting (with some syntaxic sugar) and rule nesting. So all the power of Tea is the power of Javascript.

# Javascript embedding

You have four choices of embedding JS.

1.  Simple inline. Used to evaluate single Javascript variable.
```javascript  
body {    
    color: @color;   
}  
```
2.  Complex inline. For complex expressions.
```javascript     
body {
    color: @{lighten(color, 5 + x * 3)};  
}  
```   
3.  Single line block
```javascript    
body {   
    @ var  color = lighten(other_color, 25); 
    @ var  border_big = add_border(border_small, '5px'); 
}  
```    
4.  Multiline block. Allows you to run lots of JS inside template.
```javascript    
body {   
    @{  
        var color = lighten(other_color,25); 
        if (lightness(color) > 25) border_big = add_border(border_small,'5px');
    }  
}  
```    
Every css rule is getting transformed to JS function call. So contexts and variable visibility as similar to JS. Here is an example TeaCode and its JS variant:
```javascript
body {   
    @ var color = 'red';
    background: @color;   
    h2 {   
        font-weight: bold;   
    }  
}  

tea.rule("body", function() { 
    var  color = 'red'; 
    tea.rule("background: " + color + ";") 
    tea.rule("h2", function() { 
        tea.rule("font-weight: bold;") 
    })
}) 
```
## Variables

You can use variables like in LESS or SASS but in Tea they are just JS variables, with no hidden caveats and additionary types for colors or dimensions.

So you can type:
```javascript
/* TeaCSS */  
@ var  color = '#4D926F'; 
#header { 
    color: @color; 
}  
h2 { 
    color: @color; 
}   

/* Compiled CSS */  
#header { 
    color: #4D926F;
}
h2 { 
    color: #4D926F;
} 
```
## Mixins in Tea are just JS functions.

Plain CSS rules are functions that are executed right in place.
```css
body {
    color: red;
}  
```   
```javascript
tea.rule('body', function() { 
    tea.rule('color:red') 
}) 
```
adds 'color:red' to rule stack.

And mixin is function for later use.
```javascript
.my_mixin(color) {
    color: @color;
}  

my_mixin = function(color) { 
    tea.print('color: ' + color);
} 
```
adds nothing to rule stack, but declares JS functions that can be used in plain rule. p You can call mixins as functions or using alternative syntax. So: table
```javascript
body {
    .my_mixin('red');
}  

body {
    @ my_mixin('red') 
}  
```
are equivalent and produce Highlight csscolor: red

As javascript does not support default parameters Tea CSS does neither. You can implement them in JS as usual.
```javascript
.my_mixin(color) {   
    @ color = color || 'blue'  
    color: @color;  
}  
```
Of course, you can define functions as object members.
```javascript
@ my_namespace = {} 
.my_namespace.my_mixin(color) {}  
```
## Nested rules

Rather than constructing long selector names to specify inheritance, in TeaCSS you can simply nest selectors inside other selectors. This makes inheritance clear and style sheets shorter. table
```javascript
/* TeaCSS */  
#header  {   
    h1 {   
        font-size: 26px;
        font-weight: bold;
    }   
    p {
        font-size: 12px;   
        a {
            text-decoration: none;   
            &:hover {
                border-width: 1px 
            }   
        }   
    }  
}  
```
```css
/* Compiled CSS */  
#header h1 { 
    font-size: 26px; 
    font-weight: bold;
}
#header p {
    font-size: 12px;
} 
#header p a {
    text-decoration: none;
}
#header p a:hover {
    border-width: 1px;
} 
```
## Usage

### Client-side

Link your .tea stylesheets with the rel set to 'stylesheet/tea':
```javascript
<link tea="style.tea">  
```
Then download teacss.js from the top of the page, and include it in the element of your page, like so:
```javascript
<script src="teacss.js"></script>  
```
Make sure you include your stylesheets before the script.

### Server side

TeaCSS does not handle saving css to server but simplifies process a lot.

You can add code like this to you development version of page:
```javascript
<script>  
    teacss.buildCallback( function(files) { 
        $.ajax({ type:'POST', url: location.href, data: {css:files['\default.css']}  });
    }); 
</script>
```
```php
<? if (isset($_POST['css']) file_put_contents('path/style.css', $_POST['css']) ?>
```  

Then for every tea link in page you will see an overlay ui that helps you to build all your styles.
# Using as a build system

Using teacss to create build files in pretty simple. It is convinient to have only one entry point for your styles. And it is already handled in teacss using  **@import**.

Would it be nice to have the same thing for your scripts? For sure.

Some script managers already exist. For example RequireJS and StealJS. AFAIK these are the only two that also handle minification and creating production versions.

As to me they have some flaws.

-   They both leave api specific calls inside production file. StealJS has 'pluginify' build type but it is quite buggy.
-   RequireJS does not handle CSS.
-   StealJS does not support CSS embedding and there is no option for output file name (only production.*)
-   StealJS has some path problems in production version and there is no way to reconfigure that.

Some of those problems have their roots in asyncronous web nature. You cannot just write  **require('module_name')**  and use it.

The solution is to use some kind of makefile. TeaCSS introduces as new keyword  **Script**.

And  **@append**  goes to the scenes. All JS code imported with  **@append**  is assumed as needed for production, so it will be bundled into release file.

### Example tea "makefile"
```javascript
// make.tea  
Script my_filename {   
    // jquery   
    @append "scripts/jquery.js";   
    @append "scripts/jquery.plugin.js";   
    // app   
    @append "scripts/app.js";   
    @append  {   
        var x = 5 + 3;  // some plain js   
    }  
}  
// styles  
@append "style/jquery.plugin.css";  
@impоrt "some_teacss_stylesheet.tea";  
```
Instead of creating lots of script and link tags you can use only one entry point for your application.
```javascript
<link  tea="make.tea">  
```
Later, using build script you can get  **my_filename.js**  file that contains jquery.js, jquery.plugin.js and app.js. Minified and compressed.

## Development

- prepare php capable web server
- open <your_teacss_url>/build
- click on "Build <your_teacss_url>/src/build.tea [close]"
- done (teacss.js is built in lib folder now)

## Tests
To run tests
- open <your_teacss_url>/tests/ in your browser

### License

Application is [MIT licensed](./LICENSE).