'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salonRating extends Model{
        static associate(models){
          salonRating.hasMany(models.salonRatingGallery,{onDelete:'cascade',foreignKey:'rating_id',as:'reviewAttachment'}) 
          salonRating.belongsTo(models.users,{onDelete:'cascade',foreignKey:"user_id"})
          salonRating.belongsTo(models.salon,{foreignKey:'salon_id'})
        }
    }
    salonRating.init({
        rating:{
            type:DataTypes.STRING
        },
        review:{
            type:DataTypes.STRING
        },
        salon_id:{
            type:DataTypes.INTEGER
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        booking_id:{
            type:DataTypes.INTEGER
        },
        averageRating:{
            type:DataTypes.FLOAT
        },
        status:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'salonRating'})
    return salonRating;
}