var express = require('express');
var router = express.Router();

router.get(/^\/raw\/(.*)/, function(req, res, next){
    var slug = req.params[0];
    
    // .getModel() is the glue between derby and express
    // afterwards we can use derby functions like querying
    // and fetching on the model
    
    var model = req.getModel();
    var c = model.query('documents', {'_id' : slug});
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
        console.log(slug);
    })
});

module.exports = router;
