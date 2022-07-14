const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class vendorsubscriptionplanBooking extends Model{
        static associate(models){
             
                  vendorsubscriptionplanBooking.belongsTo(models.users,{foreignKey:'user_id'})
                  vendorsubscriptionplanBooking.belongsTo(models.subscriptionPlan,{foreignKey:'subscriptionPlan_id'}) 
                 
        }
    }
    vendorsubscriptionplanBooking.init({
        user_id:{
            type:DataTypes.INTEGER
        },
        subscriptionPlan_id:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
            type:DataTypes.INTEGER
        },
        expiryDate: {
            type : DataTypes.DATE
        },
        status:{
            type:DataTypes.STRING
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'vendorsubscriptionplanBooking'})

    return vendorsubscriptionplanBooking
}