'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class clubRating extends Model{
        static associate(models){ 
          clubRating.belongsTo(models.users,{onDelete:'cascade',foreignKey:"userId"})
          clubRating.hasMany(models.clubRatingGallery,{onDelete:'cascade',foreignKey:'rating_id',as:'reviewAttachment'})
          clubRating.belongsTo(models.clubs,{foreignKey:'club_id'})
        }
    }
    clubRating.init({
        rating:{
            type:DataTypes.STRING
        },
        review:{
            type:DataTypes.STRING
        },
        club_id:{
            type:DataTypes.INTEGER
        },

        booking_id:{
            type:DataTypes.INTEGER
        },
        userId:{
            type:DataTypes.INTEGER
        },
        averageRating:{
            type:DataTypes.FLOAT
        },
        status:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'clubRating'})
    return clubRating;
}