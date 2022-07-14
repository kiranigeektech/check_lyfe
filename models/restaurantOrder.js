'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantOrder extends Model{
        static associate(models){
             restaurantOrder.hasMany(models.restaurantOrderItems,{onDelete:'cascade', foreignKey:'restaurantOrder_id'})
             restaurantOrder.belongsTo(models.restaurant,{onDelete:'cascade', foreignKey:'restaurant_id'}) 
             restaurantOrder.belongsTo(models.users,{foreignKey:'user_id'})
             restaurantOrder.belongsTo(models.userAddress,{foreignKey:'address_id'})

        }
    }
    restaurantOrder.init({
        user_id : {
            type : DataTypes.INTEGER
        },
        address_id:{
            type:DataTypes.INTEGER
        },
        restaurant_id:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.STRING
        },
        orderPlaced:{
            type:DataTypes.STRING
        },
        refundStatus:{
            type:DataTypes.STRING
        },
        totalCost:{
            type:DataTypes.INTEGER
        },
        orderData:{
            type:DataTypes.JSON
        },
        paymentMethod:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'restaurantOrder',tableName:'restaurantOrder'})
    return restaurantOrder;
}