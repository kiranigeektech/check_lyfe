const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class blogCategory extends Model{
        static associate(models){
       /*  */
        }
    }
    blogCategory.init({
        categoryName:{
            type:DataTypes.STRING,
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        }
    },{sequelize:sequelize,modelName:'blogCategory'})

    return blogCategory;
}