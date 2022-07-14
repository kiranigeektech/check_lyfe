const joi = require("joi");
const TicketController = require("../controllers/ticket");

module.exports = [
  {
    method: "POST",
    path: "/getTickets",
    handler: TicketController.getTicket,
    options: {
      tags: ["api", "Event Tickets"],
      notes: "Get Ticket Api",
      description: "Get Ticket Api",
      auth: {strategy:"jwt", scope: ["user", "admin","vendor"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
      
        payload: {
          type:joi.string().valid('event','club','activity','shops').required(),
          id:joi.number().required(),
          startDate: joi.date().iso().required(),
          startTime: joi
          .string().required()
          ,
        endTime: joi
          .string().required()
         
        },
        validator: joi,
      },
    },
    },
  

  {
    method: "POST",
    path: "/vendor/addTicket",
    handler: TicketController.addTicket,
    options: {
      tags: ["api", "Vendor"],
      notes: "Add Ticket Api",
      description: "Add Ticket Api",
      auth: {strategy:"jwt", scope: ["vendor"]},
      validate: {
        options: {
          abortEarly: false,
          allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload: {
          id: joi.number(),
          type:joi.string().valid('event','activity','club','restaurant','shops'),
          tickets: joi.array().items(
            joi.object({
              ticketName: joi.string(),
              description:joi.string(),
              priceFor:joi.string().optional().allow(null),
              noOfTicketAvailable: joi.number().optional().allow(null),
              price: joi.number(),
              minLimit:joi.number(),
              maxLimit:joi.number()
            })
          ),
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/vendor/getticketbyId",
    handler: TicketController.getTicketById,
    options: {
      tags: ["api", "Vendor"],
      notes: "ticket Api",
      description: "ticket Api",
      auth: {strategy:"jwt", scope:["vendor"]},
                validate: {
                    headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                    }),
                    options: {
                        abortEarly: false
                    },
        query: {
          type:joi.string().valid('event','activity','club','restaurant','shops').required(),
          id: joi.number().required(),
        },
        validator: joi,
      },
    },
  },

  /* {
    method: "DELETE",
    path: "/deleteTicket",
    handler: TicketController.deleteTicket,
    options: {
      tags: ["api", "Ticket"],
      notes: "Delete Ticket Api",
      description: "Delete Ticket Api",
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
