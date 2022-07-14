'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class clubRatingGallery extends Model{
        static associate(models){
        clubRatingGallery.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    clubRatingGallery.init({
        rating_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize:sequelize,modelName:'clubRatingGallery'})
    return clubRatingGallery;
}