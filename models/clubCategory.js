'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class clubCategory extends Model{
        static associate(models){
        clubCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    clubCategory.init({
        categoryName:{
            type:DataTypes.STRING
        },
        attachment_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'clubCategory'})
    return clubCategory;
}