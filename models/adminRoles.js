const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class adminRoles extends Model{
        static associate(models){
            adminRoles.belongsTo(models.roles,{foreignKey:"roleId"})
       /*  */
        }
    }
    adminRoles.init({
        roleId:{
            type:DataTypes.INTEGER
        },
        adminId:{
            type:DataTypes.INTEGER
        },
    },{sequelize:sequelize,modelName:'adminRoles'})

    return adminRoles;
}