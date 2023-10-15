const { MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DIALECT } = require("../config.js");

const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('./userSchema.js');
const userGroupModel = require('./userGroupSchema.js');
const messageModel = require('./messageSchema.js');

const sequelize = new Sequelize(
    MYSQL_DB,
    MYSQL_USER,
    MYSQL_PASSWORD,
    {
        host: MYSQL_HOST,
        dialect: MYSQL_DIALECT,
        logging: false
    }
);

const user = userModel(sequelize, DataTypes);
const userGroup = userGroupModel(sequelize, DataTypes);
const message = messageModel(sequelize, DataTypes);

const isread = sequelize.define('isread',{},{timestamps: false, freezeTableName: true, tableName: 'isread'});
const participants = sequelize.define('participant',{},{timestamps: false});

user.hasMany(message, {foreignKey: 'senderId', name: 'fk_senderId'});
message.belongsTo(user, {foreignKey: 'senderId', name: 'fk_senderId'});

userGroup.hasMany(message, {foreignKey: 'reciverGroupId', name: 'fk_reciverGroupId'});
message.belongsTo(userGroup, {foreignKey: 'reciverGroupId', name: 'fk_reciverGroupId'});

user.belongsToMany(userGroup, { through: participants});
userGroup.belongsToMany(user, { through: participants});

user.belongsToMany(message, { through: isread});
message.belongsToMany(user, { through: isread});

module.exports = {connect: async function mysqlConnect(callback){
    await sequelize.authenticate().then(() => {
        callback('connected to mysql database');
    }).catch((error) => {
        callback('error occured with mysql',true);
    })
    await sequelize.sync().then(()=>{
        console.log("tables created in database");
    }).catch((err)=>{
        console.log(err);
        console.log("an error occured");
    })
},
user: user,
userGroup: userGroup,
message: message,
isread: isread,
participants: participants,
sequelize: sequelize
}
