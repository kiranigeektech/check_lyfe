'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salonAvailability extends Model{
        static associate(models){
            salonAvailability.belongsTo(models.salonAvailability,{onDelete:'cascade', foreignKey:'salon_id'})
        }
    }
    salonAvailability.init({
        salon_id : {
            type : Sequelize.INTEGER,
            references : {
                model : 'salon',
                key : 'id'
            }
        },
        days : {
            type : DataTypes.INTEGER
        },
        startTime : {
            type : DataTypes.TIME
        },
        endTime : {
            type : DataTypes.TIME
        }
    },{sequelize:sequelize,modelName:'salonAvailability',tableName:'salonAvailability'})
    return salonAvailability;
}