'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class amenities extends Model{
        static associate(models){
        amenities.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:'attachmentId'})
        }
    }
    amenities.init({
        // amenityId : {
        //     type : Sequelize.INTEGER,
        //     references : {
        //         model : 'clubs',
        //         key : 'id'
        //     }
        // }, 
        amenitiesItem : {
            type : DataTypes.STRING,
            required : true
        },
        attachmentId:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'amenities',tableName:'amenities'})
    return amenities;
}