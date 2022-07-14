"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class permissions extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	permissions.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		permissionCode: {
			type : DataTypes.STRING,
			allowNull : false
		},
		status: {
			type : DataTypes.INTEGER,
			defaultValue: Constants.STATUS.ACTIVE
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "permissions",
		paranoid: true
	});
	return permissions;
};