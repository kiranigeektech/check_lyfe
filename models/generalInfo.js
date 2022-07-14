"use strict";
const { Model,Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class generalInfo extends Model {
    static associate(models) {
      // define association here
    }
  }
  generalInfo.init(
    {
      iosappVersion: {
        type: DataTypes.DOUBLE,
      },
      androidappVersion:{
          type:DataTypes.DOUBLE
      },
      criticalandroidappVersion:{
        type:DataTypes.DOUBLE
      },
      criticaliosappVersion:{
        type:DataTypes.DOUBLE
      },
      iosappLink:{
        type:DataTypes.STRING
      },
      androidappLink:{
        type:DataTypes.STRING
      },
      privacyPolicy:{
        type:DataTypes.STRING
     },
      aboutUs:{
        type:DataTypes.STRING
     },
      termUrl:{
        type:DataTypes.STRING
     },
      supportEmail:{
        type:DataTypes.STRING
     },
      supportNumber:{
        type:DataTypes.STRING
     },
     issoftUpdate:{
         type:DataTypes.BOOLEAN
     },
     isforceUpdate:{
        type:DataTypes.BOOLEAN
    }
    },
      {
      sequelize,
      modelName: "generalInfo",
    }
  );
  return generalInfo;
};
