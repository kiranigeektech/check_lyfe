'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class eventCategory extends Model{
        static associate(models){
        eventCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    eventCategory.init({
        categoryName:{
            type:DataTypes.STRING
        },
        attachment_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'eventCategory'})
    return eventCategory;
}