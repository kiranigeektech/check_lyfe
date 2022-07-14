const joi = require("joi");
const activityCategoryController = require("../controllers/activityCategory");

module.exports = [
  {
    method: "GET",
    path: "/activityCategory",
    handler: activityCategoryController.getCategory,
    options: {
      tags: ["api", "activityCategory"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/activityCategory",
    handler: activityCategoryController.addCategory,
    options: {
      tags: ["api", "activityCategory"],
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
    path: "/activityCategory/{id}",
    handler: activityCategoryController.editCategory,
    options: {
      tags: ["api", "activityCategory"],
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
    path: "/activityCategory",
    handler: activityCategoryController.deleteCategory,
    options: {
      tags: ["api", "activityCategory"],
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
