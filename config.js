require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,

    DATABASE: process.env.DATABASE,

    MONGO_LOCAL: process.env.MONGO_LOCAL,

    MONGO_ATLAS: process.env.MONGO_ATLAS,

    MYSQL_DB: process.env.MYSQL_DB,

    MYSQL_USER: process.env.MYSQL_USER,

    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,

    MYSQL_HOST: process.env.MYSQL_HOST,
    
    MYSQL_DIALECT: process.env.MYSQL_DIALECT,

    MAILJET_USER_KEY: process.env.MAILJET_USER_KEY,

    MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY
}