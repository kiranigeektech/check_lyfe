const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class aminitiesList extends Model{
        static associate(models){
        aminitiesList.belongsTo(models.attachments,{foreignKey:"attachment_id"})
        }
    }
    aminitiesList.init({
     amenitiesItem:{
            type:DataTypes.STRING,
        },
        attachment_id:{
            type:DataTypes.INTEGER,
        }
    },{sequelize:sequelize,modelName:'aminitiesList'})

    return aminitiesList;
}