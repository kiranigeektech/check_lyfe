'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurantRating extends Model{
        static associate(models){
        restaurantRating.hasMany(models.restaurantRatingGallery,{onDelete:'cascade',foreignKey:'rating_id',as:'reviewAttachment'}) 
          restaurantRating.belongsTo(models.users,{onDelete:'cascade',foreignKey:"user_id"})
          restaurantRating.belongsTo(models.restaurant,{foreignKey:'restaurant_id'})
        }
    }
    restaurantRating.init({
        rating:{
            type:DataTypes.STRING
        },
        review:{
            type:DataTypes.STRING
        },
        restaurant_id:{
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
    },{sequelize:sequelize,modelName:'restaurantRating'})
    return restaurantRating;
}