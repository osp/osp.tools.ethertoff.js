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

exports.PORT = process.env.VCAP_APP_PORT;
exports.MONGO_URL = generate_mongo_url(mongo);
