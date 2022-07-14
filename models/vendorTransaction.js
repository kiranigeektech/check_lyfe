const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class vendorTransaction extends Model{
        static associate(models){
                
        }
    }
    vendorTransaction.init({
        vendorTransaction_id:{
            type:DataTypes.STRING
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        subscriptionbooking_id:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.STRING
        },
        vendorTransactionData:{
            type:DataTypes.JSON
        }
    },{sequelize:sequelize,modelName:'vendorTransaction'})

    return vendorTransaction
}