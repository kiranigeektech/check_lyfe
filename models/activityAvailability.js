'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class activityAvailability extends Model{
        static associate(models){
            activityAvailability.belongsTo(models.activityAvailability,{onDelete:'cascade', foreignKey:'activity_id'})
        }
    }
    activityAvailability.init({
        activity_id : {
            type : Sequelize.INTEGER,
            references : {
                model : 'activity',
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
    },{sequelize:sequelize,modelName:'activityAvailability',tableName:'activityAvailability'})
    return activityAvailability;
}