var derby = require('derby');
// because the mime lookup function is also used within the client-side, we use
// a module that is compatible with browserify:
var mime = require('../../node_modules/express/node_modules/accepts/node_modules/mime-types');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;


app.loadViews(__dirname + '/views');
app.loadStyles(__dirname + '/styles');

app.component(require('d-codemirror'));
app.component(require('d-showdown'));

app.get('/', function(page, model){
    // try to find a document that can resemble the home-page
    var text = model.query('documents', {'_id': { $regex: '^readme*|^index*', $options: 'i' } });
    
    text.subscribe(function(err) {
        if (err) return next(err);
        console.log(text.get());
        if (text.get().length === 0) {
            model.set('_page.text', {
                path : '',
                text : "You can set a home page by creating a page called index.txt, index.html, index.md, readme.md, readme.html, readme.txt…",
                mime : 'text/plain',
                binary : false
            })
        } else {
            model.ref('_page.texts', text);
            model.ref('_page.text', '_page.texts.0');
        }
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            model.set('_page.slug', '');
            model.set('_page.readMode', true);
            allTexts.ref('_page.allTexts');
            page.render("read");
        });
    });
});

app.get(/^\/r\/(.*)/, function(page, model, params, next){
    var slug = params[0];
    var text = model.query('documents', {'_id' : slug});
        
    text.subscribe(function(err) {
        if (err) return next(err);
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            model.set('_page.slug', slug);
            model.set('_page.readMode', true);
            model.ref('_page.texts', text);
            model.ref('_page.text', '_page.texts.0');
            allTexts.ref('_page.allTexts');
            page.render("read");
        });
    });
});

app.get(/^\/w\/(.*)/, function(page, model, params, next){
    var slug = params[0];
    var text = model.query('documents', {'_id' : slug});
    text.subscribe(function(err) {
        if (err) return next(err); // this throws a 500
        if (text.get().length === 0) {
            // Create a new document
            model.add('documents', {
                id : slug,
                path : slug,
                text : "Foo Foo Foo",
                mime : mime.lookup(slug) || 'text/plain',
                binary : false // this is not necessary true; if a user creates foo.png, what should happen?
            })
        }
        var allTexts = model.query('documents', {});
        allTexts.subscribe(function(err) {
            if (err) return next(err);
            console.log(allTexts.get());
            model.set('_page.slug', slug);
            model.set('_page.writeMode', true);
            model.ref('_page.texts', text);
            model.ref('_page.text', '_page.texts.0');
            allTexts.ref('_page.allTexts');
            page.render("write"); 
        });
    });
});

app.proto.markdown = function(html) {
  if(!this.md) return;
  this.md.innerHTML = html;
}
