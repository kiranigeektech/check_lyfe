const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class salonBooking extends Model{
        static associate(models){
                 /*  booking.hasOne(models.bookingTickets,{foreignKey:"booking_id"})   */
                  salonBooking.belongsTo(models.users,{foreignKey:'user_id'})
                  salonBooking.hasMany(models.salonBookingServices,{foreignKey:"booking_id"})
                  salonBooking.belongsTo(models.salon,{foreignKey:'salon_id'})
                  salonBooking.hasMany(models.salonRating,{foreignKey:"booking_id"}) 
                  /* booking.belongsToMany(models.ticket,{foreignKey:"booking_id",through:"bookingticketsName"}) */
        }
    }
    salonBooking.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        salon_id:{
            type:DataTypes.INTEGER
        },
        noOfPerson:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
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
        preferTime:{
            type:DataTypes.TIME
        },
        serviceAt:{
            type:DataTypes.STRING
        },
        type:{
           type: DataTypes.STRING
        },
        status:{
            type:DataTypes.STRING
        },
        address:{
            type:DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'salonBooking'})

    return salonBooking
}