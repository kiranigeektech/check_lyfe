"use strict";
const salonController = require("../controllers/salonController");
const universalFunctions = require("../universalFunctions/lib");
const joi = require("joi");
module.exports = [
  // Write your endpoints here
  {
    method: "POST",
    path: "/addsalon",
    handler: salonController.addsalon,
    options: {
      tags: ["api", "Salon"],
      notes: "Add Salon Api",
      description: "Add Salon Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          title: joi.string(),
          address: joi.string(),
          description: joi.string(),
          attachment_id: joi.number(),
          category_id: joi.number(),
          salongalleries: joi.array().items(joi.number()),
          featured: joi.boolean(),
		  capacity:joi.number(),
          amenities: joi.array().items(
            joi.object().keys({
              amenitiesItem: joi.string(),
              attachment_id: joi.number(),
            })
          ),
          salonAvailability: joi.array().items(
            joi.object({
              days: joi.number(),
              startTime: joi
                .string()
                .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
              endTime: joi
                .string()
                .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
            })
          ),
		   tickets: joi.array().items(
            joi.object({
              ticketName: joi.string(),
              description:joi.string(),
                price: joi.number(), 
            })
          ), 
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
      // plugins: {
      // 	"hapi-swagger": {
      // 	  payloadType: "form",
      // 	},
      //   }
    },
  },
  /* {
        method : "GET",
		path : "/Clubs",
		handler : clubController.getClub,
		options: {
			tags: ["api", "Club"],
			notes: "Get Club Api",
			description: "Get Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query : {
					title : joi.string(),
					 page:joi.number()
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	},

	{
        method : "GET",
		path : "/ClubById/{id}",
		handler : clubController.getClubById,
		options: {
			tags: ["api", "Club"],
			notes: "Get Club Api",
			description: "Get Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				params : {
					id : joi.number()
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	},



	{
        method : "POST",
		path : "/addAmenity",
		handler : clubController.addAmenity,
		options: {
			tags: ["api", "ClubAmenity"],
			notes: "Add Club Api",
			description: "Add Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
						amenitiesItem : joi.array().items(joi.string())
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	},
	{
        method : "GET",
		path : "/getAmenity",
		handler : clubController.getAmenity,
		options: {
			tags: ["api", "ClubAmenity"],
			notes: "Get Club Api",
			description: "Get Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	},

	{
        method : "POST",
		path : "/BookmarkedClub",
		handler : clubController.saveClub,
		options: {
			tags: ["api", "Club"],
			notes: "Add Club Api",
			description: "Add Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload:{
					bookmarked:joi.boolean()
				},
				query: {
					id : joi.number().required()	
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	},
	{
        method : "GET",
		path : "/BookmarkedClub",
		handler : clubController.savedClubs,
		options: {
			tags: ["api", "Club"],
			notes: "Add Club Api",
			description: "Add Club Api",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
	} */
];
