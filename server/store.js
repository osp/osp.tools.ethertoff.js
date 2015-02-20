var liveDbMongo = require('livedb-mongo');
var coffeeify = require('coffeeify');

module.exports = store;

function store(derby) {

  derby.use(require('racer-bundle'));

  var opts = {db: liveDbMongo(process.env.MONGO_URL + '?auto_reconnect', {safe: true})};

  var store = derby.createStore(opts);

  store.on('bundle', function(browserify) {

    // For the navigation menu, we don’t want to transmit the text content of each document,
    // just the path cf. https://groups.google.com/d/msg/derbyjs/4DWls2HvWyw/ahZBdlYxNGcJ
    store.shareClient.backend.addProjection("paths", "documents", "json0", {
        path: true,
        mime: true,
        binary: true
    });

    browserify.transform({global: true}, coffeeify);

    var pack = browserify.pack;
    browserify.pack = function(opts) {
      var detectTransform = opts.globalTransform.shift();
      opts.globalTransform.push(detectTransform);
      return pack.apply(this, arguments);
    };
  });

  return store;
}