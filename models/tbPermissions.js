const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class tbPermissions extends Model{
        static associate(models){
       /*  */
        }
    }
    tbPermissions.init({
        name:{
            type:DataTypes.STRING,
        },
        slug:{
            type:DataTypes.STRING,
        },
    },{sequelize:sequelize,modelName:'tbPermissions'})

    return tbPermissions;
}