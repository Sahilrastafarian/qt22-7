module.exports = (sequelize, DataTypes) => {
    return sequelize.define('usergroup', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        groupName: {
            type: DataTypes.STRING,
            allowNUll: true
        },
        lastUpdated: {
            type: DataTypes.BIGINT,
            allowNUll: false
        }
    },
    {
        timestamps: false,
        initialAutoIncrement: 1
    });
}