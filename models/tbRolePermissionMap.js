const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class tbRolePermissionMap extends Model{
        static associate(models){
            tbRolePermissionMap.belongsTo(models.roles,{foreignKey:"roleId"})
       /*  */
        }
    }
    tbRolePermissionMap.init({
        roleId:{
            type:DataTypes.INTEGER
        },
        permission:{
            type:DataTypes.INTEGER
        },
    },{sequelize:sequelize,modelName:'tbRolePermissionMap'})

    return tbRolePermissionMap;
}