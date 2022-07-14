'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salonAmenities extends Model{
        static associate(models){
        salonAmenities.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachment_id'})
        }
    }
    salonAmenities.init({
        amenitiesItem : {
            type : DataTypes.STRING,
            required : true
        },
        attachment_id:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'salonAmenities',tableName:'salonAmenities'})
    return salonAmenities;
}