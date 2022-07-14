'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salonCategory extends Model{
        static associate(models){
        salonCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    salonCategory.init({
        categoryName:{
            type:DataTypes.STRING
        },
        attachment_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'salonCategory'})
    return salonCategory;
}