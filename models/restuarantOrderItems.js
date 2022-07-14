'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantOrderItems extends Model{
        static associate(models){
            restaurantOrderItems.belongsTo(models.restaurantMenuCategoryItem,{onDelete:'cascade', foreignKey:'item_id'}) 
        }
    }
    restaurantOrderItems.init({
        restaurantOrder_id : {
            type :  DataTypes.INTEGER
        },
        restaurant_id :{
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
    },{sequelize:sequelize,modelName:'restaurantOrderItems',tableName:'restaurantOrderItems'})
    return restaurantOrderItems;
}