'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantRatingGallery extends Model{
        static associate(models){
        restaurantRatingGallery.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    restaurantRatingGallery.init({
        rating_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize:sequelize,modelName:'restaurantRatingGallery'})
    return restaurantRatingGallery;
}