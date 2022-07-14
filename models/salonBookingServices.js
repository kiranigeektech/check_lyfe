const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    
    class salonBookingServices extends Model{
        static associate(models){
            salonBookingServices.belongsTo(models.salonServices,{foreignKey:'ticket_id'})
            
        }
    }
    salonBookingServices.init({
        booking_id:{
            type:DataTypes.INTEGER
        },
        ticket_id: {
            type : DataTypes.INTEGER
        },
    },{sequelize:sequelize,modelName:'salonBookingServices',})
    return salonBookingServices;
}
