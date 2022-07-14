"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class emailTemplates extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	emailTemplates.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		title: {type:DataTypes.STRING},
		subject: {type:DataTypes.STRING},
		body: {type:DataTypes.TEXT},
		replacements: {type:DataTypes.JSON},
		type: {type:DataTypes.INTEGER},
		isDeleted : {
			type:DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "emailTemplates",
		paranoid: true
	});
	return emailTemplates;
};