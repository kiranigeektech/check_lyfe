const joi = require("joi");
const salonCategoryController = require("../controllers/salonCategory");

module.exports = [
  {
    method: "GET",
    path: "/salonCategory",
    handler: salonCategoryController.getCategory,
    options: {
      tags: ["api", "salonCategory"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/salonCategory",
    handler: salonCategoryController.addCategory,
    options: {
      tags: ["api", "salonCategory"],
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
    path: "/salonCategory/{id}",
    handler: salonCategoryController.editCategory,
    options: {
      tags: ["api", "salonCategory"],
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
    path: "/salonCategory",
    handler: salonCategoryController.deleteCategory,
    options: {
      tags: ["api", "salonCategory"],
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
