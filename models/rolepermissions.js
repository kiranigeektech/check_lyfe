"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class rolePermissions extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
		}
	}
	rolePermissions.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		role_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: "entity"
		},
		permission_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: "entity"
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "rolePermissions",
		paranoid: true
	});
	return rolePermissions;
};