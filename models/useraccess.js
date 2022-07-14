"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class userAccess extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
		}
	}
	userAccess.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		ip: {
			type : DataTypes.STRING,
			allowNull : true
		},
		role: {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		fcmToken: {
			type : DataTypes.STRING,
			allowNull : true
		},
		browser_details: {
			type : DataTypes.STRING,
			allowNull : true
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "userAccesses",
		paranoid: true
	});
	return userAccess;
};
