'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class salon extends Model{
        static associate(models){
            salon.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:"attachment_id"})
           salon.belongsToMany(models.salonAmenities,{onDelete:'cascade',through:'salonAmenitiesList',as:'aminitiesLists'});
            salon.hasMany(models.salonAvailability,{onDelete:'cascade',foreignKey:'salon_id'});
            salon.hasMany(models.salonGallery,{foreignKey:"salon_id"})
            salon.belongsTo(models.salonCategory,{foreignKey:"category_id",as:'businessCategory'})
            salon.hasMany(models.salonRating,{onDelete:'cascade',foreignKey:"salon_id"})
            salon.hasMany(models.salonServices,{onDelete:'cascade',foreignKey:'salon_id'}) 
            salon.hasMany(models.salonBooking,{foreignKey:"salon_id"})  
        }
    }
    salon.init({
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
            type:DataTypes.STRING
        },
        cancellationPolicy:{
            type:DataTypes.STRING
        },
        capacity:{
            type:DataTypes.INTEGER
        },
        serviceAvailableAtHome:{
            type:DataTypes.BOOLEAN
        },
        serviceAvailableAtShop:{
            type:DataTypes.BOOLEAN
        },
        refundTime:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.INTEGER
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        active:{
            type:DataTypes.BOOLEAN
        },
        isOrder:{
            type:DataTypes.BOOLEAN
        },
        isTrending:{
            type:DataTypes.BOOLEAN
        },
        showAddress:{
            type:DataTypes.BOOLEAN
        }

    },{sequelize,modelName:'salon',tableName:'salon'})
    return salon;
}