const joi = require("joi");
const eventHostController = require("../controllers/event");

module.exports = [
  {
    method: "GET",
    path: "/eventHostDetail",
    handler: eventHostController.getEventHost,
    options: {
      tags: ["api", "EventHost"],
      notes: "Get Host Api",
      description: "Get Host Api",
      auth: {strategy:"jwt", scope: ["user", "admin","vendor"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        query: {
          user_id:joi.number().required()
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
     
    },
  },

    {
        method: "GET",
        path: "/hostEvents",
        handler: eventHostController.getHostUpcomingEvent,
        options: {
          tags: ["api", "EventHost"],
          notes: "Get Host Api",
          description: "Get Host Api",
          auth: false,
          validate: {
            options: {
              abortEarly: false,
            },
            query: {
              user_id:joi.number().required(),
              type:joi.string().valid('upcoming','past'),
              page:joi.number()
            },
           /*  failAction: async (req, h, err) => {
              return universalFunctions.updateFailureError(err, req);
            }, */
            validator: joi,
          },
         
        },
 
  
  },

  /* {
    method: "POST",
    path: "/eventHost",
    handler: eventHostController.addHost,
    options: {
      tags: ["api", "EventHost"],
      notes: "Add Host Api",
      description: "Add Host Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload: {
            event_id:joi.number(),
            rating:joi.number(),
            review:joi.string()
        },
        validator: joi,
      },
    },
  }, */

 /*  {
    method: "PUT",
    path: "/eventHost/{id}",
    handler: eventHostController.editHost,
    options: {
      tags: ["api", "EventHost"],
      notes: "Edit Host Api",
      description: "Edit Host Api",
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
    path: "/eventHost",
    handler: eventHostController.deleteHost,
    options: {
      tags: ["api", "EventHost"],
      notes: "Delete Host Api",
      description: "Delete Host Api",
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
