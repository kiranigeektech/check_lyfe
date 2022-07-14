"use strict";
const {
	Model
} = require("sequelize");
const { defaultFormat } = require("moment");
module.exports = (sequelize, DataTypes) => {
	class permissionContent extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	permissionContent.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		language_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: "entity"
		},
		permission_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: "entity"
		},
		permissionGroup: {
			type : DataTypes.STRING,
			allowNull : true
		},
		title: {
			type : DataTypes.STRING,
			allowNull : true
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, 
	{
		sequelize,
		modelName: "permissionContent",
		paranoid: true
	});
	return permissionContent;
};