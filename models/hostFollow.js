"use strict";
const { Model,Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hostFollow extends Model {
    static associate(models) {
      // define association here
    }
  }
  hostFollow.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
      },
      host_id:{
          type:DataTypes.INTEGER
      },
      follow:{
        type:DataTypes.BOOLEAN
      }
    },
      {
      sequelize,
      modelName: "hostFollow",
    }
  );
  return hostFollow;
};
