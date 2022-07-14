const joi = require("joi");
const restaurantCategoryController = require("../controllers/restaurantCategory");

module.exports = [
  {
    method: "GET",
    path: "/restaurantCategory",
    handler: restaurantCategoryController.getCategory,
    options: {
      tags: ["api", "restaurantCategory"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/restaurantCategory",
    handler: restaurantCategoryController.addCategory,
    options: {
      tags: ["api", "restaurantCategory"],
      notes: "Add Category Api",
      description: "Add Category Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          categoryName: joi
            .array()
            .items(joi.string())
            .required()
            .error(() => {
              return { message: "Name is required" };
            }),
            attachment_id:joi.array().items(joi.number()).required()
        },
        validator: joi,
      },
    },
  },

  {
    method: "PUT",
    path: "/restaurantCategory/{id}",
    handler: restaurantCategoryController.editCategory,
    options: {
      tags: ["api", "restaurantCategory"],
      notes: "Edit Category Api",
      description: "Edit Category Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
            categoryName: joi.string(),
            attachment_id:joi.number(),
        },
        params: {
          id: joi.number().required(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "DELETE",
    path: "/restaurantCategory",
    handler: restaurantCategoryController.deleteCategory,
    options: {
      tags: ["api", "restaurantCategory"],
      notes: "Delete Category Api",
      description: "Delete Category Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          id: joi
            .number()
            .required()
            .error(() => {
              return { message: "ID is required" };
            }),
        },
        validator: joi,
      },
    },
  },
];
