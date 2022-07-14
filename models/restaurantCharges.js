'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantCharges extends Model{
        static associate(models){
  
          
        }
    }
    restaurantCharges.init({
        restaurant_id:{
            type:DataTypes.INTEGER
        },
        taxName:{
            type:DataTypes.STRING
        },
        percentage:{
            type:DataTypes.INTEGER
        },
    },{sequelize:sequelize,modelName:'restaurantCharges'})
    return restaurantCharges;
}