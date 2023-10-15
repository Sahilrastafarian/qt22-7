module.exports = (sequelize, DataTypes) => {
    return sequelize.define('message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timeStamp: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    },
    {
        timestamps: false,
        initialAutoIncrement: 1
    })
}