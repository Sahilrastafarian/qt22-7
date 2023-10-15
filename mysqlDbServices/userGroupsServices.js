const mysql = require('../databaseMySql/dbConnect.js');
const user = mysql.user;
const userGroup = mysql.userGroup;
const participants = mysql.participants;
const sequelize = mysql.sequelize;

function addContact(userEmail, myEmail, callback){
    user.findOne({ where: {email: userEmail }}).then(async function(result){
        if(!result)
        {
            callback(false, "an error occured user not found");
        }
        else
        {
            const data = await sequelize.query(`SELECT COUNT(*) FROM participants WHERE usergroupId IN (SELECT usergroupId FROM participants GROUP BY usergroupId HAVING COUNT(*) = 2) AND (userEmail = '${myEmail}' OR userEmail = '${userEmail}') GROUP BY usergroupId having count(*) = 2`,{
                type: sequelize.QueryTypes.SELECT
            });
            if(data.length !== 0)
            {
                callback(false, "user already in contact");
            }
            else
            {
                userGroup.create({lastUpdated: Date.now()}).then(function(revert){
                    const response = {_id: revert.dataValues.id,
                    lastUpdated: revert.dataValues.lastUpdated,
                    participants: []
                    };
                    participants.create({userEmail: myEmail,usergroupId: revert.dataValues.id}).then(function(){
                        response.participants.push({email: myEmail});
                        participants.create({userEmail: userEmail, usergroupId: revert.dataValues.id}).then(function(){
                            response.participants.push({email: userEmail});
                            callback(true, response);
                        })
                    })
                }).catch(function(err){
                    console.log(err, "err aaya hai saale");
                })
            }
        }
    }).catch(function(err){
        console.log(err);
        callback(false, "an error occured");
    })
}

async function createNewGroup(members, groupName, callback){
    await userGroup.create({lastUpdated: Date.now(), groupName: groupName}).then(async function(result){
        const data = {_id: result.dataValues.id,
        lastUpdated: result.dataValues.lastUpdated,
        groupName: groupName,
        participants: []
    };
    for(const item of members){
        await participants.create({userEmail: item.email, usergroupId: result.dataValues.id}).then(function(){
            data.participants.push(item);
        })
    }
    callback(true, data);
    }).catch(function(err){
        console.log(err);
        callback(false, "an error occured");
    })
}

async function getAllUserContacts(userEmail, callback){
    const result = await sequelize.query(`SELECT DISTINCT usergroups.* FROM usergroups INNER JOIN participants ON participants.usergroupId = usergroups.id WHERE usergroups.id = ANY (SELECT usergroupId FROM participants WHERE userEmail = '${userEmail}') ORDER BY lastUpdated`,{
        type: sequelize.QueryTypes.SELECT
    })
    for(const item of result){
        const members = await sequelize.query(`SELECT participants.userEmail as email FROM participants where usergroupId = '${item.id}'`,{
            type: sequelize.QueryTypes.SELECT
        })
        item.participants = members;
        item._id = item.id;
    }
    callback(true,result);
}

module.exports = { 
    addThisContact: addContact,
    newGroup: createNewGroup,
    myContacts: getAllUserContacts
}