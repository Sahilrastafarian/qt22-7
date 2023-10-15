const mysql = require('../databaseMySql/dbConnect.js');
const user = mysql.user;

function login(email, password, callback){
    user.findOne({ where: { email: email , password: password}}).then(function(result){
        if(!result)
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
    user.findOne({where: { email: email}}).then(function(result){
        if(!result)
        {
            user.create({name: name, email: email, password: password}).then(function(){
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
    user.findAll().then(function(data){
        callback(true,data);
    }).catch(function(err){
        console.log(err);
        callback(false, "error occured");
    })
}

module.exports = {
    logMeIn: login,
    signMeUp: signup,
    giveMeUserData: userData
}