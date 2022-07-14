'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class businessamenitiesImages extends Model{
        static associate(models){
        businessamenitiesImages.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    businessamenitiesImages.init({
        attachment_id:{
            type:DataTypes.INTEGER
        },
        name:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'businessamenitiesImages',tableName:'businessamenitiesImages'})
    return businessamenitiesImages;
}