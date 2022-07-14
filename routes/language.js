"use strict";
const LanguageController = require("../controllers/language");

module.exports = [
    {
		method: "GET",
		path : "/common/getLanguages",
		handler : LanguageController.getLanguages,
		options: {
			tags: ["api", "common"],
			notes: "Get Languages",
			description: "Get Languages",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query: {
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: LanguageController.prefunction}]
		}
	},
]