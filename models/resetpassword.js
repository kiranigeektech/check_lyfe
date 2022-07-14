"use strict";
const {
	Model
} = require("sequelize");
const { defaultFormat } = require("moment");
module.exports = (sequelize, DataTypes) => {
	class resetPassword extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	resetPassword.init({
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
		token: {
			type : DataTypes.STRING
		},
		expiredAt: {
			type :DataTypes.DATE
		},
		status: {
			type : DataTypes.INTEGER,
			defaultValue : Constants.STATUS.ACTIVE
		},
		isDeleted : {
			type: DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "resetPasswords",
		paranoid: true
	});
	return resetPassword;
};