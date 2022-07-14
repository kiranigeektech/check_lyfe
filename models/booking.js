const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class booking extends Model{
        static associate(models){
                 /*  booking.hasOne(models.bookingTickets,{foreignKey:"booking_id"})   */
                  booking.belongsTo(models.users,{foreignKey:'user_id'})
                  booking.hasMany(models.eventBookingTimings,{foreignKey:"booking_id"})
                  booking.hasMany(models.userBookingEventsTicket,{foreignKey:"booking_id"})
                  booking.belongsTo(models.event,{foreignKey:'event_id'})
                booking.hasMany(models.eventRating,{foreignKey:"booking_id"}) 
        }
    }
    booking.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        event_id:{
            type:DataTypes.INTEGER
        },
        noOfPerson:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
            type:DataTypes.DOUBLE
        },
        serviceTax:{
            type:DataTypes.DOUBLE
        },
        adminCommission:{
            type:DataTypes.DOUBLE
        }  ,
        adminCommissionAmount:{
            type:DataTypes.DOUBLE
        },
        hostAmount:{
            type:DataTypes.DOUBLE
        },
        type:{
           type: DataTypes.STRING
        },
        paymentMode:{
            type: DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        },
        status:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'booking'})

    return booking
}