const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class restaurantReservations extends Model{
        static associate(models){
                  restaurantReservations.belongsTo(models.users,{foreignKey:'user_id'})
                  restaurantReservations.belongsTo(models.restaurant,{foreignKey:'restaurant_id'})
        }
    }
    restaurantReservations.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        restaurant_id:{
            type:DataTypes.INTEGER
        },
        noOfPerson:{
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
        specialRequest:{
            type:DataTypes.STRING
        },
        firstName:{
            type:DataTypes.STRING
        },
        lastName:{
            type:DataTypes.STRING
        },
        email:{
            type:DataTypes.STRING
        },
        phoneNumber:{
            type:DataTypes.STRING
        },
        countryCode:{
            type:DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        },
        status:{
            type:DataTypes.STRING
        }
    },{sequelize:sequelize,modelName:'restaurantReservations'})

    return restaurantReservations
}