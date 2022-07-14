
const joi = require("joi");
const eventRatingController = require("../controllers/eventRating");

module.exports = [
  {
    method: "GET",
    path: "/rating",
    handler: eventRatingController.getRating,
    options: {
      tags: ["api", "All Rating"],
      notes: "Get Rating Api",
      description: "Get Rating Api",
      auth: false,
    validate:{
      options: {
        abortEarly: false,
      },
      query:{
        id:joi.number().required(),
        page:joi.number(),
        type:joi.string().valid('event','club','activity','shops','restaurant').required()
      },
      validator: joi,
  }
}
  },

  {
    method: "POST",
    path: "/addRating",
    handler: eventRatingController.addRating,
    options: {
      tags: ["api", "All Rating"],
      notes: "Add Rating Api",
      description: "Add Rating Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload: {
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
            id:joi.number().optional(),
            bookingId:joi.number().optional(),
            rating:joi.number(),
            ratingId:joi.number().optional(),
            review:joi.string().optional(),
            ratinggalleries:joi.array().items(joi.number()).optional(),   
        },
      /*   query:{
          type:joi.string().valid('event','club','activity','shops','restaurant').required()
        }, */
        validator: joi,
      },
    },
  },

 /*  {
    method: "PUT",
    path: "/eventRating/{id}",
    handler: eventRatingController.editRating,
    options: {
      tags: ["api", "EventRating"],
      notes: "Edit Rating Api",
      description: "Edit Rating Api",
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
 */
 /*  {
    method: "DELETE",
    path: "/eventRating",
    handler: eventRatingController.deleteRating,
    options: {
      tags: ["api", "EventRating"],
      notes: "Delete Rating Api",
      description: "Delete Rating Api",
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
  }, */
];
