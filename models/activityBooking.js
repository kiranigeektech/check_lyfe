const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class activityBooking extends Model{
        static associate(models){
                 /*  booking.hasOne(models.bookingTickets,{foreignKey:"booking_id"})   */
                  activityBooking.belongsTo(models.users,{foreignKey:'user_id'})
                  activityBooking.hasMany(models.activityBookingTimings,{foreignKey:"booking_id"})
                  activityBooking.hasMany(models.activityBookingTickets,{foreignKey:"booking_id"}) 
                  activityBooking.belongsTo(models.activity,{foreignKey:'activity_id'})
                  activityBooking.hasMany(models.activityRating,{foreignKey:"booking_id"}) 
                  /* booking.belongsToMany(models.ticket,{foreignKey:"booking_id",through:"bookingticketsName"}) */
        }
    }
    activityBooking.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        activity_id:{
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
    },{sequelize:sequelize,modelName:'activityBooking'})

    return activityBooking
}