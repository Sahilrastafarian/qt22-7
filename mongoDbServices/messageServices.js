const MessageModel = require("../database/messageSchema.js");
const UserGroupModel = require("../database/userGroupSchema.js");

function markMessageIsRead(groupId,readerEmail,callback)
{
	MessageModel.updateMany({ recieverGroupId: groupId, readBy: {$not: {$elemMatch: {email: readerEmail}}}},{$push: {readBy:{email: readerEmail}}}).then(function(){
		callback(true);
	}).catch(function(err){
		console.log(err);
		callback(false);
	})
}




function getUnseenMessagesNumber(groupId, userEmail, callback){
	MessageModel.find({ reciverGroupId: groupId, readBy: {$not: {$elemMatch: {email: userEmail}}}}).select('message').then(function(data){
		if(data.length)
		{
			callback(true, `${data.length}`);
		}
		else
		{
			callback(true, '0');
		}
	}).catch(function(err){
		console.log(err);
		callback(false, "an error occured");
	})
}

function getMessagesForUserUnseen(groupId, userEmail, skip, limit, callback){
	MessageModel.find({reciverGroupId: groupId, readBy: {$not: {$elemMatch: {email: userEmail}}} }).sort({timeStamp: 1}).skip(skip).limit(limit).then(function(data){
		if(!data.length)
		{
			callback(false, "no new messages");
		}
		else
		{
			async function updateData(){
				for(const item of data){
					await MessageModel.findOneAndUpdate({_id: item._id},{$push: {readBy:{email: userEmail}}}).then(function(){
						//empty
					}).catch(function(err){
						console.log(err);
					})
				}
				callback(true, data);
			}
			updateData();
			//console.log(data.length);
		}
	})
}



function getMessagesForUserSeen(userEmail, groupId, skip, limit, callback){
  MessageModel.find({ reciverGroupId: groupId, readBy:{ $elemMatch: {email: userEmail}} }).select('message timeStamp senderId').skip(skip).limit(limit).then(function(data){
		if(!data.length)
		{
      callback(false, "no chat for this group here");
		}
		else
		{
      callback(true, data);
		}
	}).catch(function(err){
		console.log(err);
    callback(false, "something went wrong");
	})
}


function saveMessageToDb(text, senderId, reciverGroupId, userEmail, callback){
  MessageModel.create({ message: text, senderId: senderId, reciverGroupId: reciverGroupId, timeStamp: Date.now(), readBy : [{ email: senderId }] }).then(function(data){

		UserGroupModel.findOneAndUpdate({ _id: reciverGroupId},{lastUpdated: Date.now()}).then(function(data){
			
			UserGroupModel.find({ participants: { $elemMatch: { email: userEmail }}},{ _id: 1,"participants.email": 1, lastUpdated: 1, groupName: 1 }).sort({lastUpdated: -1}).then(function(data){
        callback(true, data);
			})
		})
	}).catch(function(err){
		console.log(err);
    callback(false, "error occured");
	})
}

function lastMessage(groupId, skip, limit, callback){
	MessageModel.find({ reciverGroupId: groupId }).select('message timeStamp senderId').skip(skip).limit(limit).then(function(data){
		if(!data.length)
		{
      		callback(false, "no chat for this group here");
		}
		else
		{
      		callback(true, data);
		}
	}).catch(function(err){
		console.log(err);
		callback(false, "error occured");
	})
}

module.exports = {
  getMessages: getMessagesForUserSeen,
  saveMessage: saveMessageToDb,
	getUnseenMessagesNumber: getUnseenMessagesNumber,
	getUnseenMessagesUser: getMessagesForUserUnseen,
	getLastMessage: lastMessage,
	messageRead: markMessageIsRead
}