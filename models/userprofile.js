"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class userProfiles extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
			userProfiles.belongsTo(models.users, {foreignKey : "user_id"})
			userProfiles.belongsTo(models.attachments,{foreignKey : "profileImage_id"})
		}
	}
	userProfiles.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		user_id: {
			type: DataTypes.INTEGER,
        	allowNull: false,
			unique: "entity"
		},
		firstName: {
			type : DataTypes.STRING,
			allowNull : true
		},
		lastName: {
			type : DataTypes.STRING,
			allowNull : true
		},
		address: {
			type :DataTypes.TEXT,
			allowNull : true
		},
		email: {
			type: DataTypes.STRING,
			allowNull : true
		},
		profileImage_id: {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		description:{
			type:DataTypes.STRING,
		},
		followers:{
			type:DataTypes.INTEGER
		},
		isFollowing:{
			type:DataTypes.BOOLEAN
		},
		latitude :  {
			type : DataTypes.FLOAT,
			allowNull : true
		},
		longitude : {
			type : DataTypes.FLOAT,
			allowNull : true
		},
		referralCode: {
			type : DataTypes.STRING,
			allowNull : true
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "userProfiles",
		paranoid: true
	});
	return userProfiles;
};
