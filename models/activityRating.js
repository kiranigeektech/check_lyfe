'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class activityRating extends Model{
        static associate(models){
        activityRating.hasMany(models.activityRatingGallery,{onDelete:'cascade',foreignKey:'rating_id',as:'reviewAttachment'}) 
          activityRating.belongsTo(models.users,{onDelete:'cascade',foreignKey:"user_id"})
          activityRating.belongsTo(models.activity,{foreignKey:'activity_id'})
        }
    }
    activityRating.init({
        rating:{
            type:DataTypes.STRING
        },
        review:{
            type:DataTypes.STRING
        },
        activity_id:{
            type:DataTypes.INTEGER
        },
        booking_id:{
            type:DataTypes.INTEGER
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        averageRating:{
            type:DataTypes.FLOAT
        },
        status:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'activityRating'})
    return activityRating;
}