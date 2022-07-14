"use strict";
const {
	Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class roles extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			roles.hasMany(models.tbRolePermissionMap,{foreignKey:'roleId'})
			// define association here
		}
	}
	roles.init({
	/* 	user_id:DataTypes.INTEGER, */
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		role: {
			type : DataTypes.STRING,
			allowNull : false
		},
		createdBy: {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue : Constants.STATUS.ACTIVE,
		},
		isDeleted : {
			type: DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "roles",
		paranoid: true
	});
	return roles;
};