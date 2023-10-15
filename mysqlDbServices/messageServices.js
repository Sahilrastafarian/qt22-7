const mysql = require('../databaseMySql/dbConnect.js');
const user = mysql.user;
const userGroup = mysql.userGroup;
const participants = mysql.participants;
const message = mysql.message;
const isread = mysql.isread;
const sequelize = mysql.sequelize;

function saveMessageToDb(text, senderId, recieverGroupId, userEmail, callback){
    message.create({ message: text, timeStamp: Date.now(), senderId: senderId, reciverGroupId: recieverGroupId, timeStamp: Date.now()}).then(function(revert){
        const messageId = revert.dataValues.id;
        isread.create({userEmail: userEmail, messageId: messageId}).then(async function(){
            const result = await sequelize.query(`SELECT DISTINCT usergroups.* FROM usergroups INNER JOIN participants ON participants.usergroupId = usergroups.id WHERE usergroups.id = ANY (SELECT usergroupId FROM participants WHERE userEmail = '${userEmail}') ORDER BY lastUpdated`,{
                type: sequelize.QueryTypes.SELECT
            })
            for(const item of result){
                const members = await sequelize.query(`SELECT participants.userEmail as email FROM participants where usergroupId = '${item.id}'`,{
                    type: sequelize.QueryTypes.SELECT
                })
                item.participants = members;
            }
            callback(true,result);
        })
    }).catch(function(err){
        callback(false, "error occured");
    })
}

function lastMessage(groupId, skip, limit, callback){
    message.findAll({where: {
        reciverGroupId: [groupId]
    },
        order: [
        ['timeStamp', 'DESC']
    ],
    
    limit: 1,
    }).then(function(result){
        callback(true,[result[0].dataValues]);
    }).catch(function(err){
        console.log(err);
        callback(false, "error occured");
    })
}

async function getMessagesForUserSeen(userEmail, groupId, skip, limit, callback){
    const result = await sequelize.query(`SELECT message, timeStamp, senderId FROM (SELECT message, timeStamp, senderId, userEmail as readby FROM isread INNER JOIN messages ON isread.messageId = messages.id WHERE messages.reciverGroupId = ${groupId} ORDER BY timestamp DESC) AS q WHERE readby = '${userEmail}' LIMIT ${limit} OFFSET ${skip}`,{
        type: sequelize.QueryTypes.SELECT
    })
    if(!result.length)
    {
        callback(false, "no chat for this group here");
    }
    else
    {
        callback(true, result);
    }
}

async function getUnseenMessagesNumber(groupId, userEmail, callback){
    const result = await sequelize.query(`select * from messages right join isread on messages.id = isread.messageId where id in (select messageId from isread group by messageId having
        count(messageId) = 1) and messages.reciverGroupId = ${groupId} and isread.userEmail != '${userEmail}'`,{
        type: sequelize.QueryTypes.SELECT
    }).catch(function(err){
        console.log(err);
    })
    if(result.length)
    {
        callback(true, `${result.length}`);
    }
    else
    {
        callback(true, '0');
    }
}

async function getMessagesForUserUnseen(groupId, userEmail, skip, limit, callback){
    const result = await sequelize.query(`select * from messages right join isread on messages.id = isread.messageId where id in (select messageId from isread group by messageId having
        count(messageId) = 1) and messages.reciverGroupId = ${groupId} and isread.userEmail != '${userEmail}' LIMIT ${limit} OFFSET ${skip}`,{
        type: sequelize.QueryTypes.SELECT
    })
    if(!result.length)
    {
        callback(false, "no new messages");
    }
    else
    {
        async function updateData(){
            for(const item of result){
                const none = await sequelize.query(`INSERT INTO isread (userEmail, messageId) VALUES ('${userEmail}', ${item.messageId})`,{
                    type: sequelize.QueryTypes.INSERT
                }).catch(function(err){
                    console.log(err);
                })
            }
            callback(true, result);
        }
        updateData();
    }
}

async function markMessageIsRead(groupId, readerEmail, callback){
    console.log("aaya");
    const result = await sequelize.query(`select messageId from messages right join isread on messages.id = isread.messageId where id in (select messageId from isread group by messageId having
        count(messageId) = 1) and messages.reciverGroupId = ${groupId} and isread.userEmail != '${readerEmail}'`,{
        type: sequelize.QueryTypes.SELECT
    })
    console.log(result);
    for(const item of result){
        console.log(item);
        const none = await sequelize.query(`INSERT INTO isread (userEmail, messageId) VALUES ('${readerEmail}', ${item.messageId})`,{
            type: sequelize.QueryTypes.INSERT
        }).catch(function(err){
            console.log(err);
            callback(false);
        })
    }
    callback(true);
}

module.exports = {
    getMessages: getMessagesForUserSeen,
    saveMessage: saveMessageToDb,
    getUnseenMessagesNumber: getUnseenMessagesNumber,
    getUnseenMessagesUser: getMessagesForUserUnseen,
    getLastMessage: lastMessage,
    messageRead: markMessageIsRead
  }