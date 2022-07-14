const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class eventBookingTimings extends Model{
        static associate(models){
          eventBookingTimings.hasMany(models.userBookingEventsTicket,{foreignKey:"slot_id"})
        }
    }
    eventBookingTimings.init({
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
        ticketBooked:{
            type:DataTypes.INTEGER
        },
        isCancelled:{
            type:DataTypes.BOOLEAN
        },
        status:{
            type:DataTypes.STRING
        },
        refundStatus:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'eventBookingTimings',})
    return eventBookingTimings;
}
