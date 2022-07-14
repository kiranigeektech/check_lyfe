const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class restaurantMenuCategory extends Model{
        static associate(models){
             restaurantMenuCategory.hasMany(models.restaurantMenuCategoryItem,{foreignKey:"menuCategory_id"})
              
        }
    }restaurantMenuCategory.init({  
        restaurant_id:{
            type:DataTypes.INTEGER
        },
        name:{
            type:DataTypes.STRING,
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'restaurantMenuCategory'})

    return restaurantMenuCategory;
}