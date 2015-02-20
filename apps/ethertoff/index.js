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

app.get('/', function(page, model, params, next){
    var slug;
    // try to find a document that can resemble the home-page
    var requestedDocument = model.query('documents', {'path': { $regex: '^readme*|^index*', $options: 'i' } });

    requestedDocument.subscribe(function(err) {
        if (err) return next(err); // 500
        if (requestedDocument.get().length === 0) {
            // Create a new home-page if none exists
            slug = 'index.html';
            model.add('documents', {
                path : slug,
                text : '<p>You can set a home page by creating a page called <a href="../w/index.html">index.html</a>, <a href="../w/index.md">index.md, <a href="../w/index.txt">index.txt</a>, <a href="../w/readme.html">readme.html</a>, <a href="../w/readme.md">readme.md</a>, <a href="../w/readme.txt">readme.txt…</a></p>',
                mime : 'text/html',
                binary : false
            });
        } else {
            slug = requestedDocument.get()[0].path;
        }

        model.set('_page.slug', slug);
        model.set('_page.readMode', true);

        var allDocuments = model.query('paths', {});
        allDocuments.subscribe(function(err) {
            if (err) return next(err);
            model.ref('_page.documents', requestedDocument);   // requestedDocument is actually an array of one,
            model.ref('_page.document', '_page.documents.0');  // so these two lines make us able to reference the actual document in the view
                                                               // (thanks https://groups.google.com/d/msg/derbyjs/2eyBuDYCBw4/Ht8-Mr-Z7lwJ Artur Zayats )
            allDocuments.ref('_page.allDocuments');
            page.render("read");
        });
    });
});

app.get(/^\/r\/(.*)/, function(page, model, params, next){
    var slug = params[0];
    var requestedDocument = model.query('documents', {'path' : slug});

    model.set('_page.slug', slug);
    model.set('_page.readMode', true);

    requestedDocument.subscribe(function(err) {
        if (err) return next(err); // 500
        if (requestedDocument.get().length === 0) {
            next(); // 404
        };

        var allDocuments = model.query('documents', {});
        allDocuments.subscribe(function(err) {
            if (err) return next(err);
            model.ref('_page.documents', requestedDocument);
            model.ref('_page.document', '_page.documents.0');
            allDocuments.ref('_page.allDocuments');
            page.render("read");
        });
    });
});

app.get(/^\/w\/(.*)/, function(page, model, params, next){
    var slug = params[0];
    var requestedDocument = model.query('documents', {'path' : slug});

    model.set('_page.slug', slug);
    model.set('_page.writeMode', true);

    requestedDocument.subscribe(function(err) {
        if (err) return next(err); // 500
        if (requestedDocument.get().length === 0) {
            // Create a new document if none exists
            model.add('documents', {
                path : slug,
                text : "Foo Foo Foo",
                mime : mime.lookup(slug) || 'text/plain',
                binary : false // this is not necessary true; if a user creates foo.png, what should happen?
            });
        }

        var allDocuments = model.query('documents', {});
        allDocuments.subscribe(function(err) {
            if (err) return next(err);
            model.ref('_page.documents', requestedDocument);
            model.ref('_page.document', '_page.documents.0');
            allDocuments.ref('_page.allDocuments');
            page.render("write");
        });
    });
});

app.proto.markdown = function(html) {
    if(!this.md) return;
    this.md.innerHTML = html;
};
