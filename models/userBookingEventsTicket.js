const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class userBookingEventsTicket extends Model{
        static associate(models){
            userBookingEventsTicket.belongsTo(models.ticket,{foreignKey:'ticket_id'})
            userBookingEventsTicket.belongsTo(models.eventBookingTimings,{foreignKey:'slot_id'})
        }
    }
    userBookingEventsTicket.init({
        booking_id:{
            type:DataTypes.INTEGER
        },
        slot_id:{
            type:DataTypes.INTEGER
        },
        ticket_id: {
            type : DataTypes.INTEGER
        },
        ticketSold: {
            type : DataTypes.INTEGER
        },
    
    },{sequelize:sequelize,modelName:'userBookingEventsTicket',})
    return userBookingEventsTicket;
}
