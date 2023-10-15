const UserModel = require("../database/userSchema.js");

function login(email, password, callback){
  UserModel.find({ email: email, password: password }).then(function(data){
    if(!data.length)
		{
			callback(false);
		}
		else
		{
			callback(true);
		}
	}).catch(function(){
		callback(false);
	})
}


function signup(name, email, password, callback){
  UserModel.find({ email: email }).then(function(data){
		if( !data.length )
		{
			UserModel.create({ name: name, email: email, password: password}).then(function(){
				callback(true);
			})
		}
		else
		{
			callback(true);
		}
	}).catch(function(err){
		console.log(err);
    	callback(false);
	})
}

function userData(skip, limit, callback)
{
	UserModel.find({}).skip(skip).limit(limit).then(function(data){
		callback(true, data);
	}).catch(function(err){
		console.log(err);
		callback(false, data);
	})
}

module.exports = {
  logMeIn: login,
  signMeUp: signup,
  giveMeUserData: userData
}
