/** Trying out hosting through Appfog **/

var env = JSON.parse(process.env.VCAP_SERVICES);
var mongo = env['mongodb2-2.4.8'][0]['credentials'];

var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};

var mongourl = generate_mongo_url(mongo);

exports.defaults = {
  "NODE_ENV": "production",
  "PORT": process.env.VCAP_APP_PORT || 3000,
  "MONGO_URL": generate_mongo_url(mongo),
  "COLLECTION_NAME": "documents",
  "SESSION_SECRET": "c3a817f7196b0270a0f9d789d296ece998091c51",
  "SESSION_COOKIE": "e28a23612c4a32a5808e02b219b3ba76346eb411"
};
