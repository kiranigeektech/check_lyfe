const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class subscriptionPlan extends Model{
        static associate(models){
           
        }
    }
    subscriptionPlan.init({
        title:{
            type:DataTypes.STRING
        },
        description:{
            type:DataTypes.STRING
        },
        duration:{
            type:DataTypes.STRING
        },
        price:{
            type:DataTypes.INTEGER
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'subscriptionPlan'})
    return subscriptionPlan
}