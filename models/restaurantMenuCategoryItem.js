const db = require(".");

const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class restaurantMenuCategoryItem extends Model {
    static associate(models) {
        restaurantMenuCategoryItem.belongsTo(models.attachments,{foreignKey:'attachment_id'})
        restaurantMenuCategoryItem.belongsTo(models.restaurantMenuCategory,{foreignKey:'menuCategory_id'})
    }
  }
  restaurantMenuCategoryItem.init(
    {
      menuCategory_id: {
        type: DataTypes.INTEGER,
      },
      restaurant_id:{
        type:DataTypes.INTEGER
      },
      price: {
        type: DataTypes.INTEGER,
      },
      itemName: {
        type: DataTypes.STRING,
      },
      itemDescription: {
        type: DataTypes.STRING,
      },
      attachment_id:{
          type:DataTypes.INTEGER
      },
      isRecommended: {
        type: DataTypes.BOOLEAN,
      },
      isDeleted:{
          type:DataTypes.BOOLEAN,
          defaultValue: false
      },
      isVeg:{
          type:DataTypes.BOOLEAN
      },
      isBestSeller:{
          type:DataTypes.BOOLEAN
      },
      noOfOrder:{
          type:DataTypes.BOOLEAN
      },
      minLimit:{
        type:DataTypes.INTEGER
      },
      maxLimit:{
        type:DataTypes.INTEGER
      },
      isActive:{
        type:DataTypes.BOOLEAN
      }
    },
    { sequelize: sequelize, modelName: "restaurantMenuCategoryItem" }
  );

  return restaurantMenuCategoryItem;
};
