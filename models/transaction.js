const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class transaction extends Model{
        static associate(models){
                  transaction.belongsTo(models.users,{foreignKey:'user_id'})
                  transaction.belongsTo(models.booking,{foreignKey:'booking_id'}) ,
                  transaction.belongsTo(models.activityBooking,{foreignKey:'booking_id'}) ,
                  transaction.belongsTo(models.restaurantOrder,{foreignKey:'order_id'}) 
                  transaction.belongsTo(models.event,{foreignKey:'business_id'}) 
                  transaction.belongsTo(models.activity,{foreignKey:'business_id'}) 
                  transaction.belongsTo(models.restaurant,{foreignKey:'business_id'}) 
                
        }
    }
    transaction.init({
        transaction_id:{
            type:DataTypes.STRING
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        booking_id:{
            type:DataTypes.INTEGER
        },
        order_id:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
            type:DataTypes.INTEGER
        },
        type:{
           type: DataTypes.STRING
        },
        status:{
            type:DataTypes.STRING
        },
        transactionData:{
            type:DataTypes.JSON
        },
        business_id:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        },
    },{sequelize:sequelize,modelName:'transaction'})

    return transaction
}