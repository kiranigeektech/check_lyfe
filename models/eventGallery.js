'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class eventGallery extends Model{
        static associate(models){
        eventGallery.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    eventGallery.init({
        event_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize:sequelize,modelName:'eventGallery'})
    return eventGallery;
}