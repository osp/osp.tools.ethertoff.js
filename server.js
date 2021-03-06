require('coffee-script/register');

var http  = require('http');
var derby = require('derby');
var express = require('./server/express');

var chalk = require('chalk');

var apps = [
  require('./apps/ethertoff')
];

var error = require('./server/error');
var publicDir = process.cwd() + '/public';


var defaults = require('./config/defaults');

if(process.env.VCAP_SERVICES){ // appfog
    var appfog_defaults = require('./config/appfog');
    defaults.PORT = appfog_defaults.PORT;
    defaults.MONGO_URL = appfog_defaults.MONGO_URL;
}

if(process.env.MONGOSOUP_URL){ // heroku with mongosoup
    process.env.MONGO_URL = process.env.MONGOSOUP_URL;
}


for(var key in defaults) {
  process.env[key] = process.env[key] || defaults[key];
}

derby.run(function(){
  var store = require('./server/store')(derby);
  express(store, apps, error, function(expressApp, upgrade){
    var server = http.createServer(expressApp);

    server.on('upgrade', upgrade);

    server.listen(process.env.PORT, function() {
      console.log('%d listening. Go to: http://localhost:%d/', process.pid, process.env.PORT);
    });

    apps.forEach(function(app){
      app.writeScripts(store, publicDir, {extensions: ['.coffee']}, function(){
        console.log('Bundle created:', chalk.yellow(app.name));
      });
    });
  });
});
