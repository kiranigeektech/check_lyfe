const joi = require("joi");
const eventHostController = require("../controllers/eventHostReview");

module.exports = [
  /* {
    method: "GET",
    path: "/getHostReviews",
    handler: eventHostController.getHostReview,
    options: {
      tags: ["api", "EventHost"],
      notes: "Get eventHost Api",
      description: "Get eventHost Api",
      auth: false,
    },
  },
 */
  /* {
    method: "POST",
    path: "/addeventHost",
    handler: eventHostController.addHostReview,
    options: {
      tags: ["api", "EventHost"],
      notes: "Add eventHost Api",
      description: "Add eventHost Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          reviewDesription: joi.string(),
          rating: joi.number(),
          ratingCount: joi.number().optional(),
        },
        validator: joi,
      },
    },
  }, */

  /* {
    method: "PUT",
    path: "/editeventHost/{id}",
    handler: eventHostController.editHostReview,
    options: {
      tags: ["api", "EventHost"],
      notes: "Edit eventHost Api",
      description: "Edit eventHost Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          eventHostItem: joi
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
  },
 */
  /* {
    method: "DELETE",
    path: "/deleteeventHost",
    handler: eventHostController.deleteHostReview,
    options: {
      tags: ["api", "EventHost"],
      notes: "Delete eventHost Api",
      description: "Delete eventHost Api",
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
