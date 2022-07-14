'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class cartItems extends Model{
        static associate(models){
            /* cartItems.belongsTo(models.clubs,{onDelete:'cascade', foreignKey:'availableId'}) */
        }
    }
    cartItems.init({
        cart_id : {
            type :  DataTypes.INTEGER
        },
        restaurant_id : {
            type : DataTypes.INTEGER
        },
        item_id:{
            type : DataTypes.INTEGER
        },
        itemQuantity:{
            type : DataTypes.INTEGER
        },
        itemPrice:{
            type:DataTypes.INTEGER
        },
        cost:{
            type:DataTypes.INTEGER    
        }
    },{sequelize:sequelize,modelName:'cartItems',tableName:'cartItems'})
    return cartItems;
}