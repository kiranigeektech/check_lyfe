'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class restaurant extends Model{
        static associate(models){
            restaurant.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:"attachment_id"})
            restaurant.belongsToMany(models.restaurantAmenities,{onDelete:'cascade',through:'restaurantAmenitiesList',as:'aminitiesLists'});
            restaurant.hasMany(models.restaurantAvailability,{onDelete:'cascade',foreignKey:'restaurant_id'});
            restaurant.hasMany(models.restaurantGallery,{foreignKey:"restaurant_id"})
            restaurant.belongsTo(models.restaurantCategory,{foreignKey:"category_id",as:'businessCategory'})
            restaurant.hasMany(models.restaurantRating,{onDelete:'cascade',foreignKey:"restaurant_id"})
            restaurant.hasMany(models.restaurantMenuCategory,{foreignKey:"restaurant_id"}) 
            restaurant.hasMany(models.restaurantCharges,{onDelete:'cascade',foreignKey:"restaurant_id"})
        }
    }
    restaurant.init({
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
            type:DataTypes.STRING
        },
        cancellationPolicy:{
            type:DataTypes.STRING
        },
        isOrder:{
            type:DataTypes.BOOLEAN
        },
        refundTime:{
            type:DataTypes.INTEGER
        },
        status:{
            type:DataTypes.INTEGER
        },
        mobile: {
			type:DataTypes.STRING,
			allowNull: true,	
		},
        active:{
            type:DataTypes.BOOLEAN
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        isTrending:{
            type:DataTypes.BOOLEAN
        },
        serviceType:{
            type:DataTypes.INTEGER,
            defaultValue : 3
        }
    },{sequelize,modelName:'restaurant',tableName:'restaurant'})
    return restaurant;
}