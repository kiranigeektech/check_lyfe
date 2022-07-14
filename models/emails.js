"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class emails extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
		}
	}
	emails.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		senderEmail: {
			type : DataTypes.STRING
		},
		receiverEmail: {
			type: DataTypes.STRING
		},
		subject: {
			type: DataTypes.STRING
		},
		emailData: {
			type: DataTypes.TEXT
		},
		status: {
			type: DataTypes.INTEGER
		},
		isDeleted : {
			type :DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "emails",
		paranoid: true
	});
	return emails;
};
