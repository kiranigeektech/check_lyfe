"use strict";
const {
	Model
} = require("sequelize");
const { defaultFormat } = require("moment");
module.exports = (sequelize, DataTypes) => {
	class notifications extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate (models) {
			// define association here
		}
	}
	notifications.init({
		id : { 
			type : DataTypes.INTEGER, 
			primaryKey: true,
			allowNull: false,
			autoIncrement : true
		},
		user_id: {
			type: DataTypes.INTEGER,
        	allowNull: false,
			
		},
		notificationTo: {
			type : DataTypes.INTEGER
		},
		title:{
			type:DataTypes.STRING
		},
		body:{
			type:DataTypes.STRING
		},
		type:{
			type:DataTypes.STRING
		},
		booking_id:{
			type:DataTypes.INTEGER
		},
		order_id:{
			type:DataTypes.INTEGER
		},
		notificationType:{
			type:DataTypes.INTEGER
		},
		readStatus: {
			type : DataTypes.INTEGER,
			defaultValue : 0
		},
		isDeleted : {
			type : DataTypes.INTEGER,
			defaultValue : 0
		}
	}, {
		sequelize,
		modelName: "notifications",
		paranoid: true
	});
	return notifications;
};
