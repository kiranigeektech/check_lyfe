'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantAvailability extends Model{
        static associate(models){
            restaurantAvailability.belongsTo(models.restaurantAvailability,{onDelete:'cascade', foreignKey:'restaurant_id'})
        }
    }
    restaurantAvailability.init({
        restaurant_id : {
            type : Sequelize.INTEGER,
            references : {
                model : 'restaurant',
                key : 'id'
            }
        },
        days : {
            type : DataTypes.INTEGER
        },
        startTime : {
            type : DataTypes.TIME
        },
        endTime : {
            type : DataTypes.TIME
        }
    },{sequelize:sequelize,modelName:'restaurantAvailability',tableName:'restaurantAvailability'})
    return restaurantAvailability;
}