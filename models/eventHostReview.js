const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class eventHostReview extends Model{
        static associate(models){

        }
    }
    eventHostReview.init({
       reviewDesription:{
           type:DataTypes.STRING
       },
       rating:{
           type:DataTypes.INTEGER
       },
       ratingCount:{
           type:DataTypes.INTEGER
       }

    },{sequelize:sequelize,modelName:'eventHostReview'})

    return eventHostReview
}