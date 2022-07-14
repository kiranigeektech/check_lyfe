const joi = require("joi");
const aminitiesController = require("../controllers/eventAminities");

module.exports = [
  {
    method: "GET",
    path: "/vendor/getaminitiesbyId",
    handler: aminitiesController.getAminities,
    options: {
      tags: ["api", "Vendor"],
      notes: "Get Aminities Api",
      description: "Get Aminities Api",
      auth: {strategy:"jwt", scope:["vendor"]},
                validate: {
                    headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                    }),
                    options: {
                        abortEarly: false
                    },
        query:{
          id:joi.number().required(),
          type:joi.string().valid('event','activity','club','restaurant','shops'),
        },
        validator: joi,
      }
    },
  },

  {
    method: "POST",
    path: "/vendor/addaminities",
    handler: aminitiesController.addAminities,
    options: {
      tags: ["api", "Vendor"],
      notes: "Add Aminities Api",
      description: "Add Aminities Api",
      auth: {strategy:"jwt", scope:["vendor"]},
      validate: {
          headers: Joi.object(UniversalFunctions.headers()).options({
              allowUnknown: true
          }),
          options: {
              abortEarly: false,
              allowUnknown:true
          },
        payload: {
          id:joi.number(),
          type:joi.string().valid('event','activity','club','restaurant','shops'),
          amenities: joi.array().items(
            joi.object().keys({
              amenitiesItem: joi.string().allow("",null),
              attachment_id: joi.number().allow("",null),
            })
          ).allow(null)
        },
        validator: joi,
      },
    },
  },

/*   {
    method: "PUT",
    path: "/vendor/editaminities/{id}",
    handler: aminitiesController.editAminities,
    options: {
      tags: ["api", "EventAminities"],
      notes: "Edit Aminities Api",
      description: "Edit Aminities Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          aminitiesItem: joi
            .string()
            .required()
            .error(() => {
              return { message: "Item is required" };
            }),
        },
        params: {
          id: joi.number().required(),
        },
        validator: joi,
      },
    },
  }, */

  {
    method: "DELETE",
    path: "/vendor/deleteaminities",
    handler: aminitiesController.deleteAminities,
    options: {
      tags: ["api", "EventAminities"],
      notes: "Delete Aminities Api",
      description: "Delete Aminities Api",
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
