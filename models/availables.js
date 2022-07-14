'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class availables extends Model{
        static associate(models){
            availables.belongsTo(models.clubs,{onDelete:'cascade', foreignKey:'availableId'})
        }
    }
    availables.init({
        availableId : {
            type : Sequelize.INTEGER,
            references : {
                model : 'clubs',
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
    },{sequelize:sequelize,modelName:'availables',tableName:'availables'})
    return availables;
}