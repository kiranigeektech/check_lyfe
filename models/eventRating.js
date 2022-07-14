'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class eventRating extends Model{
        static associate(models){
        eventRating.hasMany(models.eventRatingGallery,{onDelete:'cascade',foreignKey:'rating_id',as:'reviewAttachment'})  
          eventRating.belongsTo(models.users,{onDelete:'cascade',foreignKey:"user_id"})
          eventRating.belongsTo(models.event,{foreignKey:'event_id'})
        }
    }
    eventRating.init({
        rating:{
            type:DataTypes.STRING
        },
        review:{
            type:DataTypes.STRING
        },
        event_id:{
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
    },{sequelize:sequelize,modelName:'eventRating'})
    return eventRating;
}