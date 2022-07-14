const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class activityBookingTimings extends Model{
        static associate(models){
          activityBookingTimings.hasMany(models.activityBookingTickets,{foreignKey:"slot_id"}) 
        }
    }
    activityBookingTimings.init({
        booking_id:{
            type:DataTypes.INTEGER
        },
        startDate : {
            type : DataTypes.DATE
        },
        startTime : {
            type : DataTypes.TIME
        },
        endTime : {
            type : DataTypes.TIME
        },
        preferedTime:{
            type:DataTypes.TIME
        },
        ticketBooked:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.STRING
        },
        refundStatus:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'activityBookingTimings',})
    return activityBookingTimings;
}
