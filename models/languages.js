"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class languages extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	languages.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		name: {
			type : DataTypes.STRING,
			allowNull : false
		},
		code: {
			type : DataTypes.STRING,
			allowNull : false
		},
		default: {
			type : DataTypes.INTEGER,
			defaultValue : 0
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "languages",
		paranoid: true
	});
	return languages;
};