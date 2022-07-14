const db = require(".");

const {Model,Sequelize} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class businessclaimInfo extends Model{
        static associate(models){
             businessclaimInfo.belongsTo(models.attachments,{foreignKey:"documentAttachment"})
             businessclaimInfo.belongsTo(models.event,{foreignKey:"business_id"})
             businessclaimInfo.belongsTo(models.clubs,{foreignKey:"business_id"})
             businessclaimInfo.belongsTo(models.activity,{foreignKey:"business_id"})
             businessclaimInfo.belongsTo(models.salon,{foreignKey:"business_id"})
             businessclaimInfo.belongsTo(models.restaurant,{foreignKey:"business_id"})
              
        }
    }businessclaimInfo.init({  
        firstName:{
            type:DataTypes.STRING,
        },
        lastName:{
            type:DataTypes.STRING,
        },
        email: {
			type: DataTypes.STRING,
			allowNull : true
		},
		mobile: {
			type:DataTypes.STRING,
			allowNull: true,
		},
        countryCode:{
            type:DataTypes.STRING,
        },
        businessAddress:{
            type: DataTypes.STRING,
			allowNull : true
        },
        documentAttachment:{
            type:DataTypes.INTEGER
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        business_id:{
            type:DataTypes.INTEGER
        },
        type:{
            type:DataTypes.STRING,
        },
        status:{
            type:DataTypes.INTEGER
        }
    },{sequelize:sequelize,modelName:'businessclaimInfo'})

    return businessclaimInfo;
}