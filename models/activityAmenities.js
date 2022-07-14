'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class activityAmenities extends Model{
        static associate(models){
        activityAmenities.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    activityAmenities.init({
        amenitiesItem : {
            type : DataTypes.STRING,
            required : true
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'activityAmenities',tableName:'activityAmenities'})
    return activityAmenities;
}