'use strict';

const {Model,Sequelize} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class clubs extends Model{
        static associate(models){
            /* clubs.hasMany(models.menus,{onDelete:'cascade',foreignKey:'clubId'}); */
            clubs.belongsToMany(models.amenities,{onDelete:'cascade',through:'clubAmenitiesList', as: 'aminitiesLists' });
            /* clubs.hasMany(models.bookClub,{foreignKey : 'bookClubId'}); */
            clubs.hasMany(models.availables,{onDelete:'cascade',foreignKey:'availableId'});
            /* clubs.hasMany(models.ticketCategory,{onDelete:'cascade', foreignKey:'categoryId'}) */
            clubs.belongsTo(models.attachments,{onDelete:'cascade',foreignKey:"attachmentId"})
            clubs.hasMany(models.clubGallery,{foreignKey:"club_id"})
            clubs.belongsTo(models.clubCategory,{foreignKey:"category_id", as:'businessCategory'})
            clubs.hasMany(models.clubRating,{onDelete:'cascade',foreignKey:"club_id"}),
            clubs.hasMany(models.clubServices,{onDelete:'cascade',foreignKey:'club_id'}) 
            clubs.hasMany(models.clubBooking,{foreignKey:"club_id"}) 
        }
    }
    clubs.init({
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
        attachmentId:{
            type:DataTypes.INTEGER
        } ,
        lat:{
            type:DataTypes.DOUBLE
        },
        long:{
            type:DataTypes.DOUBLE
        },
        termsAndCondition:{
            type:DataTypes.STRING
        },
        cancellationPolicy:{
            type:DataTypes.STRING
        },
        category_id:{
            type:DataTypes.INTEGER
        },
        type:{
            type:DataTypes.STRING
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
        isOrder:{
            type:DataTypes.BOOLEAN
        },
        isTrending:{
            type:DataTypes.BOOLEAN
        },
        capacity:{
            type:DataTypes.INTEGER
        }
    },{sequelize,modelName:'clubs',tableName:'clubs'})
    return clubs;
}