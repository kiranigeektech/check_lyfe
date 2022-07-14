const db = require("../models/index");

class salonCategory {
  getCategory = async (request) => {
    try {
      const category = await db.salonCategory.findAll({where:{isDeleted:false}});
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
        let checkAlreadyExist = await db.salonCategory.findOne({
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
      const add = await db.salonCategory.bulkCreate(uniqueCategory);
      console.log("SSSSSSSSSSSSSS@@@@", add);
      return add
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  editCategory = async (request) => {
    try {
      const editCategory = await db.salonCategory.update(
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
      const delCategory = await db.salonCategory.destroy({
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

module.exports = new salonCategory();
