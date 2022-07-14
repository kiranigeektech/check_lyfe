'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantAmenities extends Model{
        static associate(models){
        restaurantAmenities.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    restaurantAmenities.init({
        amenitiesItem : {
            type : DataTypes.STRING,
            required : true
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'restaurantAmenities',tableName:'restaurantAmenities'})
    return restaurantAmenities;
}