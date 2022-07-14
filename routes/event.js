"use strict";
const EventController = require("../controllers/event");
const hostFollow = require("../controllers/hostFollow")
const universalFunctions = require("../universalFunctions/lib");
const joi = require("joi");

module.exports = [
  // Write your endpoints here
  {
    method: "POST",
    path: "/vendor/manageEvent",
    handler: EventController.createEvent,
    options: {
      tags: ["api", "Vendor"],
      notes: "Event Post Api",
      description: "Event Post Api",
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
          // your payload or requested body here
          id:joi.number(),
          title: joi.string(),
          description: joi.string(),
          address: joi.string(),
          startDate: joi.date().iso(),
          endDate: joi.date().iso(),
          capacity: joi.number(),
          attachment_id:joi.number(),
          category_id:joi.number(),
          refundTime:joi.number(),
          bookingUrl:joi.string().optional().allow("",null),
          cancellationPolicy:joi.string().allow(null),
          termsAndCondition:joi.string().allow(null),
          lat:joi.number().min(-90).max(90),
          long:joi.number().min(-180).max(180),
          showAddress:joi.boolean().allow(null,'').default(false)

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
    path: "/listByType",
    handler: EventController.getEvent,
    options: {
      tags: ["api", "View All"],
      notes: "List Post Api",
      description: "List Post Api",
      auth: {strategy:"jwt", scope: ["user", "admin"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        query: {
          category_id: joi.number(),
          page:joi.number(),
          type:joi.string().valid('event','club','activity','shops','restaurant','blog').required(),
          lat:joi.number().min(-90).max(90).optional(),
          long:joi.number().min(-180).max(180).optional(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/detailByType/{id}",
    handler: EventController.getEventById,
    options: {
      tags: ["api", "All DetailsPage"],
      notes: "Detail Page Api",
      description: "Detail Page Api",
      auth: {strategy:"jwt", scope: ["user", "admin"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        params: {
          id: joi.number(),
        },
        query:{
          type:joi.string().valid('event','club','activity','shops','restaurant','blog').required(),
          lat:joi.number().min(-90).max(90).optional(),
          long:joi.number().min(-180).max(180).optional(),
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  },

  {
    method: "POST",
    path: "/bookmark",
    handler: EventController.savedEvent,
    options: {
      tags: ["api", "Bookmarked"],
      notes: "Bookmarked Api",
      description: "Bookmarked Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload:{
          bookmarked:joi.boolean().required(),
          id: joi.number().required(),
          type:joi.string().required()
        },
      
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  },

  {
    method: "PUT",
    path: "/updateEvent/{id}",
    handler: EventController.updateEvent,
    options: {
      tags: ["api", "Event"],
      notes: "Event Post Api",
      description: "Event Post Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          // your payload or requested body here
          title: joi.string(),
          description: joi.string(),
          price: joi.number(),
          address: joi.string(),
          startDate: joi.date().iso(),
          endDate: joi.date().iso(),
          startTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
          endTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
          capacity: joi.number(),
          available:joi.number(),
          featured:joi.boolean()
        },
        params: {
          id: joi.number(),
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
    path: "/getBookmark",
    handler: EventController.getsavedEvent,
    options: {
      tags: ["api", "Bookmarked"],
      notes: "Bookmarked Api",
      description: "Bookmarked Api",
      auth: {strategy:"jwt", scope: ["user", "admin"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        query:{
          type:joi.string().valid('event','club','activity','restaurant','shops','blog').required(),
          page:joi.number()
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  }, 

  {
    method: "DELETE",
    path: "/event/{id}",
    handler: EventController.deleteEvent,
    options: {
      tags: ["api", "Event"],
      notes: "Event delete Api",
      description: "Event delete Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        params:{
          id:joi.number()
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
    path: "/gallery",
    handler: EventController.getGallery,
    options: {
      tags: ["api", "Gallery"],
      notes: "Event Gallery Api",
      description: "Event Gallery Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        query:{
          page:joi.number(),
          id:joi.number().required(),
          type:joi.string().valid('event','club','activity','shops','restaurant').required()
        },
        
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  } ,

  {
    method: "GET",
    path: "/categoryDetails",
    handler: EventController.getCategoryDetails,
    options: {
      tags: ["api", "All Category"],
      notes: "All Category detail Api",
      description: "All Category detail Api",
      auth: {strategy:"jwt", scope: ["user"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
      query:{
        type:joi.string().valid('event','club','activity','shops','restaurant').required(),
        lat:joi.number().min(-90).max(90).optional(),
        long:joi.number().min(-180).max(180).optional(),
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  } ,

  {
    method: "POST",
    path: "/follow",
    handler: hostFollow.hostFollows,
    options: {
      tags: ["api", "Follow host"],
      notes: "Follow Api",
      description: "Follow Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
      payload:{
        host_id:joi.number().required(),
        follow:joi.boolean()
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
    },
  } 



  

];
