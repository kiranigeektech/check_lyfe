'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salonGallery extends Model{
        static associate(models){
        salonGallery.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    salonGallery.init({
        salon_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize:sequelize,modelName:'salonGallery'})
    return salonGallery;
}