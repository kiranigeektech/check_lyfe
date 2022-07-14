"use strict";

const { Model,Sequelize, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userCardDetail extends Model {
    static associate(models) {
      // define association here
      userCardDetail.belongsTo(models.users,{foreignKey:'user_id'})
    }
  }
  userCardDetail.init(
    {
      user_id:{
        type:DataTypes.INTEGER
      },
      lastFourDigit: {
        type: DataTypes.INTEGER,
      },
      cardType:{
          type:DataTypes.STRING
      },
      cardBrand:{
        type:DataTypes.STRING
      },
      token:{
        type:DataTypes.STRING
      },
      expiryDate:{
        type:DataTypes.STRING
      },
      stripCustomerId:{
        type:DataTypes.STRING
      },
      isDeleted:{
        type:DataTypes.BOOLEAN
      }
    },
      {
      sequelize,
      modelName: "userCardDetail",
    }
  );
  return userCardDetail;
};
