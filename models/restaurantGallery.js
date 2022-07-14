'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantGallery extends Model{
        static associate(models){
        restaurantGallery.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    restaurantGallery.init({
        restaurant_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize:sequelize,modelName:'restaurantGallery'})
    return restaurantGallery;
}