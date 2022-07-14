"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class userVerifications extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
		}
	}
	userVerifications.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		user_id: {
			type: DataTypes.INTEGER,
        	allowNull: false,
			unique: "entity"},
		verificationEntityType: {
			type: DataTypes.STRING,
			allowNull: false
		},
		verificationEntityValue: {
			type: DataTypes.STRING,
			allowNull: true
		},
		countryCode: {
			type : DataTypes.INTEGER,
			allowNull: true
		},
		verificationCode: {
			type :DataTypes.STRING,
			allowNull: true
		},
		verificationStatus: {
			type : DataTypes.INTEGER,
			defaultValue: 0
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "userVerifications",
		paranoid: true
	});
	return userVerifications;
};
