'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class cart extends Model{
        static associate(models){
             cart.hasMany(models.cartItems,{onDelete:'cascade', foreignKey:'cart_id'}) 
        }
    }
    cart.init({
        name : {
            type : DataTypes.STRING
        },
        user_id : {
            type : DataTypes.INTEGER
        },
        address_id:{
            type:DataTypes.INTEGER
        },
        totalCost:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'cart',tableName:'cart'})
    return cart;
}