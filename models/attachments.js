"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class attachments extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
		}
	}
	attachments.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		fileName: {type: DataTypes.STRING},
		filePath: {type: DataTypes.STRING},
		thumbnailPath : {type: DataTypes.STRING},
		originalName: {type: DataTypes.STRING},
		format: {type: DataTypes.STRING},
		size: {type: DataTypes.INTEGER},
		usageFlag: {type: DataTypes.INTEGER,
			defaultValue : 0
		},
		type: {type: DataTypes.INTEGER},
		isDeleted : {type: DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "attachments",
		paranoid: true
	});
	return attachments;
};
