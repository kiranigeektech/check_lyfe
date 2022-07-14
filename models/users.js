"use strict";
const constants = require("../config/constant");
const {
	Model
} = require("sequelize");
const { all } = require("sequelize/lib/operators");
const user = require("../controllers/user");
module.exports = (sequelize, DataTypes) => {
	class users extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
			users.hasOne(models.userProfiles,{foreignKey:"user_id"})
			users.belongsTo(models.roles,{foreignKey:"role_id"}) 
			users.hasMany(models.transaction,{foreignKey:'user_id'})
			users.hasMany(models.booking,{foreignKey:'user_id'})
			users.hasMany(models.activityBooking,{foreignKey:'user_id'})
			users.hasMany(models.restaurantOrder,{foreignKey:'user_id'})
		}
	}
	users.init({
		
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		email: {
			type: DataTypes.STRING,
			allowNull : true
		},
		mobile: {
			type:DataTypes.STRING,
			allowNull: true,
			
		},
		password: {
			type : DataTypes.STRING,
			allowNull : true
		},
		countryCode: {
			type: DataTypes.STRING,
			allowNull : true
		},
		country:{
			type:DataTypes.STRING,
		},
		status: {
			type : DataTypes.INTEGER,
			defaultValue: constants.STATUS.INACTIVE
		},
		profileStatus: {
			type: DataTypes.INTEGER,
			defaultValue: constants.PROFILE_STATUS.INCOMPLETE
		},
		role_id: {
			type: DataTypes.INTEGER,
			allowNull : false
		},
		isSocialLogin: {
			type : DataTypes.INTEGER,
			allowNull : true
		},	
		socialLoginType: {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		stripeCustomerId:{
			type:DataTypes.STRING,
		},
		stripeaccountconnectId:{
			type:DataTypes.STRING
		},
		stripeaccountEnable:{
			type:DataTypes.BOOLEAN
		},
		resetpasswordOtp:{
			type : DataTypes.INTEGER
		},
		isDeleted : {
			type: DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "users",
		paranoid: true
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['countryCode', 'mobile']
			}
		]
	});
	return users;
};
