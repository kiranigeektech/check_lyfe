'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantCategory extends Model{
        static associate(models){
        restaurantCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    restaurantCategory.init({
        categoryName:{
            type:DataTypes.STRING
        },
        attachment_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'restaurantCategory'})
    return restaurantCategory;
}