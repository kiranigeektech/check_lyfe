const db = require("../models/index");

class restaurantCategory {
  getCategory = async (request) => {
    try {
      const category = await db.restaurantCategory.findAll({where:{isDeleted:false}});
      return category;
    } catch (e) {
      console.log("ss", e);
    }
  };

  addCategory = async (request) => {
    try {
      var aminities = [];
      let uniqueCategory = [];
      for (let i = 0; i < request.payload.categoryName.length; i++) {
        let checkAlreadyExist = await db.restaurantCategory.findOne({
          where: {
            categoryName: request.payload.categoryName[i],
          },
        });
      
        if (!checkAlreadyExist) {
          uniqueCategory.push({
                categoryName: request.payload.categoryName[i],
                attachment_id:request.payload.attachment_id[i]
          });
        }
      }
      if (uniqueCategory && uniqueCategory.length == 0) {
        return "Category Already Exists";
      }
      const add = await db.restaurantCategory.bulkCreate(uniqueCategory);
      console.log("SSSSSSSSSSSSSS@@@@", add);
      return add
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  editCategory = async (request) => {
    try {
      const editCategory = await db.restaurantCategory.update(
        {
          categoryName: request.payload.categoryName,
          attachment_id:request.payload.attachment_id
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return editCategory;
    } catch (e) {
      console.log("###edit####", e);
    }
  };

  deleteCategory = async (request) => {
    try {
      const delCategory = await db.restaurantCategory.destroy({
        where: {
          id: request.payload.id,
        },
      });
      return "Deleted Successfully";
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  };
}

module.exports = new restaurantCategory();
