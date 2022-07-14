"use strict";

const { Model,Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class paymentOptions extends Model {
    static associate(models) {
      // define association here
      
    }
  }
  paymentOptions.init(
    {
      platForm:{
          type:DataTypes.STRING

      } ,
      enable:{
          type:DataTypes.BOOLEAN
      }    
    },
      {
      sequelize,
      modelName: "paymentOptions",
    }
  );
  return paymentOptions;
};
