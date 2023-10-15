const UserModel = require("../database/userSchema.js");
const UserGroupModel = require("../database/userGroupSchema.js");

function addContact(userEmail, myEmail, callback){
  UserModel.find({ email: userEmail }).then(function(data){
		if(!data.length)
		{
      callback(false, "an error occured user not found");
		}
		else
		{
			UserGroupModel.find( {$and: [{participants:{$size: 2,$elemMatch:{email: myEmail}}},{participants:{$size: 2,$elemMatch:{email: userEmail}}}]} ).then(function(data){
				if( !data.length )
				{
					UserGroupModel.create({ lastUpdated: Date.now(), participants: [{ email: userEmail },{ email: myEmail }]}).then(function(data){
						callback(true, data);
						});
				}
				else
				{
          			callback(false, "user already in contact");
				}
			})
		}
	}).catch(function(err){
		console.log(err);
    callback(false, "an error occured");
	})
}

function createNewGroup(members, groupName, callback){
  UserGroupModel.create({ lastUpdated: Date.now(), participants: members, groupName: groupName }).then(function(data){
		callback(true,data);
	}).catch(function(err){
		console.log(err);
    	callback(false,"error occured try again");
	})
}

function getAllUserContacts(userEmail, callback){
  UserGroupModel.find({ participants: { $elemMatch: { email: userEmail }}},{ _id: 1,"participants.email": 1, lastUpdated: 1, groupName: 1 }).sort({lastUpdated: -1}).then(function(data){
		if(!data.length)
		{
      callback(false, "no data found");
		}
		else
		{
      callback(true, data);
		}
	}).catch(function(err){
		console.log(err);
		callback(false, "an error occured");
	})
}


module.exports = {
  addThisContact: addContact,
  newGroup: createNewGroup,
  myContacts: getAllUserContacts
}
