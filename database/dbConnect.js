const { MONGO_LOCAL, MONGO_ATLAS } = require("../config.js");

const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

// to connect to mongoDb online Atlas
/*module.exports = function init(callback){
    mongoose.connect(MONGO_ATLAS)
    .then(function(){callback(connected to mongodb)})
    .catch(function(){callback("error occured with mongodb", true)})
}*/

module.exports = function init(callback){
    mongoose.connect(MONGO_LOCAL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(function(){
    callback("connected to mongodb");
}).catch(function(err){
    callback("error occured with mongodb", true);
});
}