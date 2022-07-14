'use strict';

const {Model,Sequelize, DATE} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class userAddress extends Model{
        static associate(models){
         userAddress.belongsTo(models.users,{onDelete:'cascade', foreignKey:'user_id'}) 
        }
    }
    userAddress.init({
        user_id : {
            type :  DataTypes.INTEGER
        },
        userLatitude:{
            type:DataTypes.DOUBLE
        },
        userLongitude:{
            type:DataTypes.DOUBLE
        },
        address:{
            type:DataTypes.STRING
        },
        houseNo:{
            type:DataTypes.STRING
        },
        buildingName:{
            type:DataTypes.STRING
        },
        pinCode:{
            type:DataTypes.INTEGER
        },
        state:{
            type:DataTypes.STRING
        },
        city:{
            type:DataTypes.STRING
        },
        other:{
            type:DataTypes.STRING
        },
        type:{
            type:DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'userAddress',tableName:'userAddress'})
    return userAddress;
}