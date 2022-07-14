'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class activity extends Model{
        static associate(models){
            activity.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:"attachment_id"})
            activity.belongsToMany(models.activityAmenities,{onDelete:'cascade',through:'activityAmenitiesList',as:'aminitiesLists'});
            activity.hasMany(models.activityAvailability,{onDelete:'cascade',foreignKey:'activity_id'});
            activity.hasMany(models.activityGallery,{foreignKey:"activity_id"})
            activity.belongsTo(models.activityCategory,{foreignKey:"category_id",as:'businessCategory'})
            activity.hasMany(models.activityRating,{onDelete:'cascade',foreignKey:"activity_id"})
            activity.hasMany(models.activityTicket,{onDelete:'cascade',foreignKey:'activity_id'})
            activity.hasMany(models.activityBooking,{foreignKey:"activity_id"})
        }
    }
    activity.init({
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            allowNull : false,
            autoIncrement : true
        },
        title : {
            type : DataTypes.STRING,
            required : true
        },
        address : {
            type : DataTypes.STRING,
            required : true
        },
        description : {
            type : DataTypes.TEXT,
            required : true
        },
        bookmarked : {
            type : DataTypes.BOOLEAN
        },
        featured:{
            type:DataTypes.INTEGER
        },
        rating:{
            type:DataTypes.FLOAT
        },
        ratingCount:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER
        } ,
        lat:{
            type:DataTypes.DOUBLE
        },
        long:{
            type:DataTypes.DOUBLE
        },
        category_id:{
            type:DataTypes.INTEGER
        },
        type:{
            type:DataTypes.STRING
        },
        termsAndCondition:{
            type:DataTypes.TEXT
        },
        cancellationPolicy:{
            type:DataTypes.TEXT
        },
        bookingUrl:{
            type:DataTypes.STRING
        },
        capacity:{
            type:DataTypes.INTEGER
        },
        refundTime:{
            type:DataTypes.INTEGER
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.INTEGER
        },
        active:{
            type:DataTypes.BOOLEAN
        },
        isTrending:{
            type:DataTypes.BOOLEAN
        },
        isOrder:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize,modelName:'activity',tableName:'activity'})
    return activity;
}