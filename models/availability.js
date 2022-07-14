const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class availability extends Model{
        static associate(models){
            
        }
    }
    availability.init({
        event_id:{
            type:DataTypes.INTEGER
        },
        startDate : {
            type : DataTypes.DATE
        },
        endDate : {
            type : DataTypes.DATE
        },
        startTime : {
            type : DataTypes.TIME
        },
        endTime : {
            type : DataTypes.TIME
        }
    },{sequelize:sequelize,modelName:'availability',})
    return availability;
}
