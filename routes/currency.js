"use strict";
const CurrencyController = require("../controllers/currency");

module.exports = [
    
    {
		method : "POST",
		path : "/admin/addCurrency",
		handler: CurrencyController.addCurrency,
		options : {
			tags : ["api", "currency"],
			notes : "Add Currency",
			description: "Add Currency",
			auth : {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload : {
					name : Joi.string().required(),
					currencyCode : Joi.string().required(),
					currencySymbol : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: CurrencyController.prefunction}]
		}
	},

	{
		method : "PATCH",
		path: "/admin/editCurrency",
		handler : CurrencyController.editCurrency,
		options: {
			tags: ["api", "currency"],
			notes: "Edit Currency",
			description: "Edit Currency",
			auth : {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload : {
					id : Joi.number().required(),
					name : Joi.string().required(),
					currencyCode : Joi.string().required(),
					currencySymbol : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: CurrencyController.prefunction}]
		}
	},

	{
		method: 'GET',
		path: "/admin/getCurrencies",
		handler: CurrencyController.getCurrency,
		options: {
			tags: ["api", "currency"],
			notes: "Get Currency",
			description : "Get Currency",
			auth : {strategy: "jwt", scope: ["admin"]},
			validate : {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query : {
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method : CurrencyController.prefunction}]
		}
    },
    
    {
		method: 'GET',
		path: "/admin/getCurrencyWithId",
		handler: CurrencyController.getCurrencyWithId,
		options: {
			tags: ["api", "currency"],
			notes: "Get Currency With Id",
			description : "Get Currency With Id",
			auth : {strategy: "jwt", scope: ["admin"]},
			validate : {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
                query : {
                    id : Joi.number().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method : CurrencyController.prefunction}]
		}
	},

	{
		method : "DELETE",
		path : "/admin/deleteCurrency",
		handler : CurrencyController.deleteCurrency,
		options: {
			tags: ["api", "currency"],
			notes: "Delete Currency",
			description : "Delete Currency",
			auth : {strategy: "jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload : {
					id : Joi.number().required(),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: CurrencyController.prefunction}]
		}
	}

]