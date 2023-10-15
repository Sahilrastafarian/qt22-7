module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    });
}