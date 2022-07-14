"use strict";
const activityController = require("../controllers/activityController");
const universalFunctions = require("../universalFunctions/lib");
const joi = require("joi");
module.exports = [
  // Write your endpoints here
  {
    method: "POST",
    path: "/vendor/manageActivity",
    handler: activityController.addActivity,
    options: {
      tags: ["api", "Vendor"],
      notes: "Add Acitivity Api",
      description: "Add Acitivity Api",
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload: {
		  id:joi.number(),
		  type:joi.string().valid('activity','club','shops','restaurant').required(),
          title: joi.string(),
          address: joi.string(),
          description: joi.string(),
          attachment_id: joi.number(),
          category_id: joi.number(),
		  refundTime:joi.number(),
          bookingUrl:joi.string().allow("",null),
          cancellationPolicy:joi.string().allow(null),
          termsAndCondition:joi.string().allow(null),
		  serviceAvailableAtHome:joi.boolean().optional(),
		  serviceAvailableAtShop:joi.boolean().optional(),
		  mobile:joi.string().optional(),
          lat:joi.number().min(-90).max(90),
          long:joi.number().min(-180).max(180),
		  capacity:joi.number(),
		  showAddress:joi.boolean().optional(),
		  serviceType: joi.number().default(3),
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
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
