const joi = require("joi");
const eventCategoryController = require("../controllers/eventCategory");

module.exports = [
  {
    method: "GET",
    path: "/eventCategory",
    handler: eventCategoryController.getCategory,
    options: {
      tags: ["api", "EventCategory"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: false,
    },
  },

  {
    method: "POST",
    path: "/admin/managebusinessCategory",
    handler: eventCategoryController.addCategory,
    options: {
      tags: ["api", "admin"],
      notes: "Add business Category Api",
      description: "Add business Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
      headers: Joi.object(UniversalFunctions.headers()).options({
        allowUnknown: true
      }),
        options: {
          abortEarly: false,
          allowUnknown:true
        },
        payload: {
          id:joi.number().optional(),
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
          categoryName:joi.string().required().error(() => {return { message: "Name is required" };}),
          attachment_id:joi.number().required()
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/admin/getbusinesscategorybyId",
    handler: eventCategoryController.getbusinessCategory,
    options: {
      tags: ["api", "admin"],
      notes: "get business Category by id Api",
      description: "get business Category by id Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
        options: {
          abortEarly: false,
        },
        query: {
          id:joi.number().optional(),
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "DELETE",
    path: "/admin/deletebusinessCategory",
    handler: eventCategoryController.deleteCategory,
    options: {
      tags: ["api", "admin"],
      notes: "Delete Category Api",
      description: "Delete Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
        options: {
          abortEarly: false,
        },
        query: {
          id: joi
            .number()
            .required()
            .error(() => {
              return { message: "ID is required" };
            }),
            type:joi.string().valid('event','club','activity','shops','restaurant').required(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/admin/getbusinesscategory",
    handler: eventCategoryController.admingetCategory,
    options: {
      tags: ["api", "admin"],
      notes: "get business Category Api",
      description: "get business Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
        options: {
          abortEarly: false,
        },
        query: {
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
        },
        validator: joi,
      },
    },
  },
];
