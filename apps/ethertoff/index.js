var derby = require('derby');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;


app.loadViews(__dirname + '/views');
app.loadStyles(__dirname + '/styles');

app.component(require('d-codemirror'));
app.component(require('d-showdown'));

app.get('/', function(page, model){
    var slug = 'start';
    
    
    var text = model.at('documents.' + slug);
    text.subscribe(function(err) {
        if (err) return next(err);
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            model.set('_page.slug', slug);
            model.set('_page.readMode', true);
            model.ref('_page.text', text);
            allTexts.ref('_page.allTexts');
            page.render("read");
        });
    });
});

app.get('/r/:slug', function(page, model, _arg, next){
    var slug = _arg.slug;
    var text = model.at('documents.' + slug);
    
    text.subscribe(function(err) {
        if (err) return next(err);
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            model.set('_page.slug', slug);
            model.set('_page.readMode', true);
            model.ref('_page.text', text);
            allTexts.ref('_page.allTexts');
            page.render("read");
        });
    });
});

app.get('/w/:slug', function(page, model, _arg, next){
    var slug = _arg.slug;
    var text = model.at('documents.' + slug);
    text.subscribe(function(err) {
        if (err) return next(err); // this throws a 500
        if (!text.get()) {
            // Create a new document
            model.set('documents.' + slug, { text: "Foo Foo Foo", path: slug });
        }
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            console.log(allTexts.get());
            model.set('_page.slug', slug);
            model.set('_page.writeMode', true);
            model.ref('_page.text', text);
            allTexts.ref('_page.allTexts');
            page.render("write"); 
        });
    });
});

app.proto.markdown = function(html) {
  if(!this.md) return;
  this.md.innerHTML = html;
}
