var express = require('express');
var router = express.Router();

/**
 * These views are handled serverside, by express — they don’t need to update in realtime.
 */

router.get(/^\/raw\/(.*)/, function(req, res, next){
    /**
     * The RAW view (/raw/document.name) returns the current state of the document as an HTTP response */

    var slug = req.params[0];
    
    // .getModel() is the glue between derby and express
    // afterwards we can use derby functions like querying
    // and fetching on the model
    
    var model = req.getModel();
    var c = model.query('documents', {'path' : slug});
    c.fetch(function(err) {
        var r = c.get();
        if (r.length > 0) {
            var doc = r[0];
            if (!doc.binary) {      // get file mime-type from the database
                res.set('Content-Type', doc.mime);
                res.send(doc.text);
            } else {                // binary files are not stored in the
                                    // database but saved on disk
                                    // it looks like this is camelCased `sendFile` in more recent versions
                res.sendfile(doc.absPath);
            }
        } else {
            next();
        }
    });
});

router.get('/style.css', function(req, res, next){
    /**
     * This is something of a hack, for if we want to edit the site’s styles in realtime:
     * if there is a document called style.css in the database we will use this instead of the style.css available
     * as a static file.
     */
    
    var model = req.getModel();
    var c = model.query('documents', {'path' : 'style.css'});
    c.fetch(function(err) {
        var r = c.get();
        if (r.length > 0) {
            var doc = r[0];
                res.set('Content-Type', doc.mime);
                res.send(doc.text);
        } else {
            next(); // fallback to static
        }
    });
});

module.exports = router;
