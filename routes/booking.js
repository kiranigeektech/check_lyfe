
const joi = require("joi");
const BookingController = require("../controllers/booking");
const PaymentController = require("../controllers/paymentInfo");

module.exports = [
  {
    method: "GET",
    path: "/getMyReviews",
    handler: BookingController.getMyReviews,
    options: {
      tags: ["api", "EventReview"],
      notes: "Get review Api",
      description: "Get review Api",
      auth: {strategy:"jwt", scope: ["user"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        query:{
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
          page:joi.number()
        },
        validator: joi,
      }
    },
  },
  {
    method: "GET",
    path: "/getbookings",
    handler: BookingController.getbooking,
    options: {
      tags: ["api", "EventBooking"],
      notes: "Get Booking Api",
      description: "Get Booking Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        query:{
          type:joi.string().valid('event','club','activity','shops','restaurant').required(),
          page:joi.number()
        },
        validator: joi,
      }
    },
  },

  {
    method: "POST",
    path: "/addbooking",
    handler: BookingController.addbooking,
    options: {
      tags: ["api", "EventBooking"],
      notes: "Add Booking Api",
      description: "Add Booking Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
          allowUnknown: true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
       /*  query:{
          type:joi.string().valid('event','club','activity').required()
        },  */
        payload: {
          type:joi.string().valid('event','club','activity','shops').required(),
          id: joi.number().required(),
          paymentNonce:joi.string().optional(),
          deviceData:joi.string().optional(),
          cardId:joi.number().optional(),
          paymentMode:joi.string().optional(),
          serviceAt:joi.string().optional(),
          address:joi.string().optional(),
          totalAmount: joi.number().required(),
          timings: joi.array().items(
            joi.object({
              startDate: joi.date().iso(),
                startTime: joi
                .string(),
              endTime: joi
                .string(),
                preferedTime:joi.string().optional(), 
                noOfPerson: joi.number().optional(),
                tickets:joi.array().items(
                  joi.object({
                   ticket_id:joi.number(),
                   ticketSold:joi.number().optional()
                  }),
                ),
            }),
          ),
        },
        validator: joi,
      },
    },
  },

  {
    method: "POST",
    path: "/ticketCountByDate",
    handler: BookingController.ticketRemainByDate,
    options: {
      tags: ["api", "EventBooking"],
      notes: "date ticket Booking Api",
      description: "date ticket Booking Api",
      auth: {strategy:"jwt", scope: ["user", "admin"] ,mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
      
        payload: {
          type:joi.string().valid('event','club','activity','shops').required(),
          id:joi.number().required(),
          startDate: joi.date().iso().required(),
            startTime: joi
            .string()
            ,
          endTime: joi
            .string()
            , 
        },
        validator: joi,
        },
       
      },
    },

    {
      method: "GET",
      path: "/getBookingById/{id}",
      handler: BookingController.getbookingbyId,
      options: {
        tags: ["api", "EventBooking"],
        notes: "Get Booking Api",
        description: "Get Booking Api",
        auth: {strategy:"jwt", scope: ["user", "admin"]},
        validate: {
          options: {
            abortEarly: false,
          },
          headers: Joi.object(UniversalFunctions.headers()).options({
            allowUnknown: true
          }),
          query:{
            type:joi.string().valid('event','club','activity','shops').required()
          },
          params:{
           id:joi.number().required()
          },
          validator: joi,
        }
      },
    },
  
  /* {
    method: "PUT",
    path: "/editBooking/{id}",
    handler: BookingController.editbooking,
    options: {
      tags: ["api", "EventBooking"],
      notes: "Edit Booking Api",
      description: "Edit Booking Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          noOfPerson: joi.number(),
          totalAmount: joi.number(),
          startDate: joi.date().iso(),
          startTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
          endTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
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
    path: "/deleteBooking",
    handler: BookingController.deletebooking,
    options: {
      tags: ["api", "EventBooking"],
      notes: "Delete Booking Api",
      description: "Delete Booking Api",
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

  {
    method: "POST",
    path: "/common/paymentResponse",
    handler: PaymentController.payment,
    options: {
      tags: ["api", "EventBooking"],
      notes: "Delete Booking Api",
      description: "Delete Booking Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        validator: joi,
      },
    },
  },

  {
    method: "POST",
    path: "/cancelBooking",
    handler: BookingController.cancelBooking,
    options: {
      tags: ["api", "EventBooking"],
      notes: "cancel Booking Api",
      description: "cancel Booking Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
        payload: {
          type:joi.string().valid('event','club','activity','shops').required(),
          bookingId: joi
            .number()
            .required()
            .error(() => {
              return { message: "ID is required" };
            }),
          slotId:joi.number().optional(),
         
        },
        validator: joi,
      },
    },
  },


  
  {
    method: "POST",
    path: "/common/paypalpaymentResponse",
    handler: PaymentController.payPal,
    options: {
      tags: ["api", "EventBooking"],
      notes: "paypal payment response api",
      description: "paypal payment response api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        validator: joi,
      },
    },
  },


  {
    method: "GET",
    path: "/clientToken",
    handler: BookingController.clientToken,
    options: {
      tags: ["api", "EventBooking"],
      notes: "get Client Token Api",
      description: "get Client Token Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
    
        validator: joi,
      },
    },
  },







];
