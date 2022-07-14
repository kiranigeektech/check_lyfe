const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class blog extends Model{
        static associate(models){
        blog.belongsTo(models.attachments,{foreignKey:"attachment_id"})
        blog.belongsTo(models.blogCategory,{foreignKey:"category_id"})
        blog.belongsTo(models.users,{foreignKey:"authorId"})
        }
    }
    blog.init({
        title:{
            type:DataTypes.STRING,
        },
        description:{
            type:DataTypes.STRING
        },
        category_id:{
            type:DataTypes.INTEGER
        },
        attachment_id:{
            type:DataTypes.INTEGER,
        },
        content:{
            type:DataTypes.TEXT
        },
        status:{
            type:DataTypes.INTEGER
        },
        publishedDate:{
            type:DataTypes.DATE
        },
        isDeleted:{
            type:DataTypes.BOOLEAN
        },
        Slug:{
            type:DataTypes.STRING
        },
        metaTitle:{
            type:DataTypes.STRING
        },
        metaDescription:{
            type:DataTypes.STRING
        },
        metaTag:{
            type:DataTypes.STRING
        },
        authorId:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'blog'})

    return blog;
}