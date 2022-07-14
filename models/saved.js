"use strict";
const { Model,Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class saved extends Model {
    static associate(models) {
      // define association here
      saved.belongsTo(models.event,{foreignKey:'savedId'})
      saved.belongsTo(models.restaurant,{foreignKey:'savedId'})
      saved.belongsTo(models.clubs,{foreignKey:'savedId'})
      saved.belongsTo(models.activity,{foreignKey:'savedId'})
      saved.belongsTo(models.salon,{foreignKey:'savedId'})
      saved.belongsTo(models.blog,{foreignKey:'savedId'})
    }
  }
  saved.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
      },
      savedId:{
          type:DataTypes.INTEGER
      },
      type:{
        type:DataTypes.STRING
      }
    },
      {
      sequelize,
      modelName: "saved",
    }
  );
  return saved;
};
