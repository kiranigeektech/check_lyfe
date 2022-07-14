const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class clubBooking extends Model{
        static associate(models){
                 /*  booking.hasOne(models.bookingTickets,{foreignKey:"booking_id"})   */
                  clubBooking.belongsTo(models.users,{foreignKey:'user_id'})
                  clubBooking.hasMany(models.clubBookingServices,{foreignKey:"booking_id"})
                  clubBooking.belongsTo(models.clubs,{foreignKey:'club_id'})
                  clubBooking.hasMany(models.clubRating,{foreignKey:"booking_id"}) 
                  /* booking.belongsToMany(models.ticket,{foreignKey:"booking_id",through:"bookingticketsName"}) */
        }
    }
    clubBooking.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        club_id:{
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
        type:{
           type: DataTypes.STRING
        },
        status:{
            type:DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'clubBooking'})

    return clubBooking
}