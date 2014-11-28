/*
Usage: node init.js path_to_folder_to_use_as_wiki_content

This script recursively walks through a folder and adds each file to Ethertoff’s mongo livedb/share.js storage
Binary files are not actually stored:

{
"_id" : "geo.pyc",
"absPath" : "/Users/e/Documents/Titanium_Studio_Workspace/raduga-server/geo.pyc",
"path" : "geo.pyc",
"mime" : "application/octet-stream",
"binary" : true
}

Text-based files get the data stored in the mongo database directly:

{
"_id" : "alerts.py",
"absPath" : "/Users/e/Documents/Titanium_Studio_Workspace/raduga-server/alerts.py",
"path" : "alerts.py",
"mime" : "text/x-python",
"binary" : false,
"data" : "# -*- coding: utf-8 -*-\n\nimport json\nimport sys\nimport urllib2\n\nimport pymongo\n\nfrom utils import logger\nfrom settings import *\nfrom users import synch_users, delayed_synch_users\n\nclient = pymongo.MongoClient()\n(…)"
}

To find out a files mime-type and whether it is binary or not, the script relies on file extensions,
with a fall back to the libmagic library—much in the way webservers like Apache or nginx do it.
*/


// npm
var livedb = require('derby/node_modules/racer/node_modules/share/node_modules/livedb');
var mime = require('serve-static/node_modules/send/node_modules/mime');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var textExtensions = require('istextorbinary/node_modules/textextensions');
var binaryExtensions = require('istextorbinary/node_modules/binaryextensions');
var dive = require('dive');

// local
var defaults = require('./config/defaults');

// node
var path = require('path');
var fs = require('fs');
var sys = require('sys');

// Parse command line options
if (process.argv.length > 3) {
    console.log("Too many arguments");
    console.log("Usage: node init.js path_to_folder_to_use_as_wiki_content");
    process.exit(1);
}

// Read in configuration from the ethertoff derby.js project
for(var key in defaults) {
  process.env[key] = process.env[key] || defaults[key];
}

// initialise database and mime-stuff
mime.default_type = "unknown";
var magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);
var db = require('livedb-mongo')(process.env.MONGO_URL + '?auto_reconnect', {safe:true});
var backend = livedb.client(db);

// initialise other vars
// if no folder is specified, we load the example content
var folder = process.argv.length === 3 ? process.argv[2] : 'example_content';
// TODO: create a separate script that initialises Ethertoff with process.cwd() as folder

var toDo = 0;

// this function we are going to need to insert documents
var insertDoc = function(doc) {
    var submit = function(doc) {
        backend.submit(process.env.COLLECTION_NAME, doc._id, {
            create : {
                type : 'json0',
                data : doc
            }
        }, function(err, version, transformedByOps, snapshot) {
            toDo -= 1;
            if (toDo === 0) db.close();
        });
    };
    if (doc.binary) {
        submit(doc);
    } else {
        fs.readFile(doc.absPath, "utf-8", function(err, contents) {
            doc.text = contents;
            submit(doc);
        });
    }
};

// First drop the existing collection, then go!
db.mongo.dropCollection(process.env.COLLECTION_NAME, function(err, reply) {
    db.mongo.dropCollection(process.env.COLLECTION_NAME + "_ops", function(err, reply) {
        console.log("dropped existing collections");
        dive(folder, {}, function(err, file) {
          if (err) throw err;
          toDo += 1;
          var doc = {};
          doc.absPath = file;
          doc.path = path.relative(folder, file);
          doc._id = doc.path;
          doc.mime = mime.lookup(file);
          var extension = path.extname(file).replace('.','');
          if (binaryExtensions.indexOf(extension) >= 0) {
              doc.binary = true;
          } else if (textExtensions.indexOf(extension) >= 0) {
              doc.binary = false;
          } else {
              doc.binary = 'unknown';
          }
          if(doc.mime === "unknown" || doc.binary === "unknown") {
              // libmagic to the rescue!
              magic.detectFile(file, function(err, result) {
                  if (err) throw err;
                  doc.mime = result.split(';')[0];
                  if (result.indexOf("binary") >= 0) {
                      doc.binary = true;
                  } else {
                      doc.binary = false;
                  }
                  console.log(doc);
                  insertDoc(doc);
              });
          } else {
              console.log(doc);
              insertDoc(doc);
          }
        }, function() {
          console.log('complete');
        });
    });
});

