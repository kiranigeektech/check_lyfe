"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class emailAttachments extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	emailAttachments.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		email_id: {
			type : DataTypes.INTEGER
		},
		attachment_id: {
			type : DataTypes.INTEGER
		},
		isDeleted : {
			type : DataTypes.INTEGER
		}
	}, {
		sequelize,
		modelName: "emailAttachments",
		paranoid: true
	});
	return emailAttachments;
};