'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class currencies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  currencies.init({
    id : { 
        type : DataTypes.INTEGER, 
        primaryKey: true,
        allowNull: false,
        autoIncrement : true
    },
    name: {type : DataTypes.STRING},
    currencyCode: {type : DataTypes.STRING},
    currencySymbol: {type : DataTypes.STRING},
    isDeleted: {
        type : DataTypes.INTEGER,
        defaultValue : 0
    }
  }, {
    sequelize,
    modelName: 'currencies',
  });
  return currencies;
};