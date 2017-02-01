var liveDbMongo = require('livedb-mongo');

module.exports = store;

function store(derby) {

  derby.use(require('racer-bundle'));

  var opts = {db: liveDbMongo(process.env.MONGO_URL + '?auto_reconnect', {safe: true})};

  var store = derby.createStore(opts);

  // Add a Database projection when querying all documents, that excludes the `text` field
  // For the navigation menu, we don’t want to transmit the text content of each document
  // to the client each time, just the path
  // cf. https://groups.google.com/d/msg/derbyjs/4DWls2HvWyw/ahZBdlYxNGcJ
  store.shareClient.backend.addProjection("paths", "documents", "json0", {
      path: true,
      mime: true,
      binary: true
  });

  return store;
}
