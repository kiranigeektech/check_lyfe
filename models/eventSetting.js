"use strict";
const { Model,Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class eventSetting extends Model {
    static associate(models) {
      // define association here
    }
  }
  eventSetting.init(
    {
      serviceTax: {
        type: DataTypes.INTEGER,
      },
      adminCommission:{
          type:DataTypes.INTEGER
      },
      host:{
        type:DataTypes.INTEGER
      }
    },
      {
      sequelize,
      modelName: "eventSetting",
    }
  );
  return eventSetting;
};
