'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class businessCategory extends Model{
        static associate(models){
            businessCategory.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:"attachment_id"})
        }
    }
    businessCategory.init({
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            allowNull : false,
            autoIncrement : true
        },
        title : {
            type : DataTypes.STRING,
            required : true
        },
        type : {
            type : DataTypes.STRING,
            required : true
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
      
    },{sequelize,modelName:'businessCategory',tableName:'businessCategory'})
    return businessCategory;
}