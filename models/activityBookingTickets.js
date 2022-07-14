const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class activityBookingTickets extends Model{
        static associate(models){
            activityBookingTickets.belongsTo(models.activityTicket,{foreignKey:'ticket_id'})
            activityBookingTickets.belongsTo(models.activityBookingTimings,{foreignKey:'slot_id'})
        }
    }
    activityBookingTickets.init({
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
    
    },{sequelize:sequelize,modelName:'activityBookingTickets',})
    return activityBookingTickets;
}
