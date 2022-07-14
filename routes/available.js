const available= require('../controllers/availableController');
const joi = require('joi');

module.exports = [
    {
        method : "POST",
		path : "/addAvailable",
		handler : available.addAvailables,
		options: {
			tags: ["api", "ClubAvailable"],
			notes: "Add availablitly to the server",
			description: "Add availablitly to the server",
			auth : false,
			validate: {
                options: {
                    abortEarly: false
                },
                payload: 
                    {
                        availableId : joi.number(),
                        startDate : joi.date(),
                        endDate : joi.date(),
                        startTime : joi.string().regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
                        endTime : joi.string().regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/)
                    }
                ,
                validator: joi
            }
			
		}
    },
    {
        method : "GET",
		path : "/getAvailable",
		handler : available.getAvailables,
		options: {
			tags: ["api", "ClubAvailable"],
			notes: "Get Availablity",
			description: "Get Availablity",
			auth : false,
			validate: {
                options: {
                    abortEarly: false
                }
            }
			
		}
    }
]