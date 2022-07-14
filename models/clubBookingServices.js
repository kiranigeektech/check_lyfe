const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class clubBookingServices extends Model{
        static associate(models){
            clubBookingServices.belongsTo(models.clubServices,{foreignKey:'ticket_id'})
            
        }
    }
    clubBookingServices.init({
        booking_id:{
            type:DataTypes.INTEGER
        },
        ticket_id: {
            type : DataTypes.INTEGER
        },
        ticketSold:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'clubBookingServices',})
    return clubBookingServices;
}
