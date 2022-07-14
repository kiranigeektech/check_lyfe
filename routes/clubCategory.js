const joi = require("joi");
const clubCategoryController = require("../controllers/clubCategory");

module.exports = [
  {
    method: "GET",
    path: "/clubCategory",
    handler: clubCategoryController.getCategory,
    options: {
      tags: ["api", "clubCategory"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/clubCategory",
    handler: clubCategoryController.addCategory,
    options: {
      tags: ["api", "clubCategory"],
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
    path: "/clubCategory/{id}",
    handler: clubCategoryController.editCategory,
    options: {
      tags: ["api", "clubCategory"],
      notes: "Edit Category Api",
      description: "Edit Category Api",
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
        params: {
          id: joi.number().required(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "DELETE",
    path: "/clubCategory",
    handler: clubCategoryController.deleteCategory,
    options: {
      tags: ["api", "clubCategory"],
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
