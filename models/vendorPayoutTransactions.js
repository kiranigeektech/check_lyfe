const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class vendorPayoutTransactions extends Model{
        static associate(models){
             
                  /* vendorPayoutTransactions.belongsTo(models.users,{foreignKey:'user_id'})
                  vendorPayoutTransactions.belongsTo(models.subscriptionPlan,{foreignKey:'subscriptionPlan_id'})  */
                 
        }
    }
    vendorPayoutTransactions.init({
        vendor_id:{
            type:DataTypes.INTEGER
        },
        admin_id:{
            type:DataTypes.INTEGER
        },
        totalAmount:{
            type:DataTypes.INTEGER
        },
        amountPaid: {
            type : DataTypes.INTEGER
        },
        amountDue:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'vendorPayoutTransactions'})

    return vendorPayoutTransactions
}