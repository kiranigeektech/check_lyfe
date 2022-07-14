'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class activityCategory extends Model{
        static associate(models){
        activityCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    activityCategory.init({
        categoryName:{
            type:DataTypes.STRING
        },
        attachment_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'activityCategory'})
    return activityCategory;
}