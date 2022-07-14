"use strict";
const AttributeController = require("../controllers/attribute");

module.exports = [ 
    
  /*   {
		method : "POST",
		path : "/admin/addAttributes",
		handler : AttributeController.addAttributes,
		options : {
			tags: ["api", "attributes"],
			notes: "Add Attributes",
			description: "Add Attributes",
			auth : {strategy:'jwt', scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options : {
					abortEarly: false
				},
				payload : {
                    id : Joi.number().optional(),
                    categoryId : Joi.number().required(),
					type : Joi.number().required(),
					isVariation : Joi.number().required(),
					costAlterable : Joi.number().required(),
					name : Joi.string().required()
				},
				failAction: async(req,h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method: AttributeController.prefunction}]
		}
	},

	{
		method : "PATCH",
		path : "/admin/editAttributes",
		handler : AttributeController.editAttributes,
		options : {
			tags: ["api", "attributes"],
			notes : "Edit Attributes",
			description: "Edit Attributes",
			auth : {strategy: 'jwt', scope : ["admin"]},
			validate : {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options : {
					abortEarly : false
				},
				payload : {
                    id : Joi.number().required(),
                    categoryId : Joi.number().optional(),
					type : Joi.number().optional(),
					isVariation : Joi.number().optional(),
					costAlterable : Joi.number().optional(),
					name : Joi.string().optional()
				},
				failAction: async(req,h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method : AttributeController.prefunction}]
		}
	},

	{
		method : "GET",
		path : "/admin/getAttributes",
		handler : AttributeController.getAttributes,
		options: {
			tags: ["api", "attributes"],
			notes : "Get Attributes",
			description: "Get Attributes",
			auth : {strategy: 'jwt',scope : ["admin"]},
			validate : {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options : {
					abortEarly : false
				},
				query : {

				},
				failAction : async(req, h, err) =>{
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method : AttributeController.prefunction}]
		}
    },
    
    {
		method : "GET",
		path : "/admin/getAttributeWithId",
		handler : AttributeController.getAttributeWithId,
		options: {
			tags: ["api", "attributes"],
			notes : "Get Attributes",
			description: "Get Attributes",
			auth : {strategy: 'jwt',scope : ["admin"]},
			validate : {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options : {
					abortEarly : false
				},
				query : {
                    id : Joi.number().required()
				},
				failAction : async(req, h, err) =>{
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{method : AttributeController.prefunction}]
		}
	},

	{
		method : "DELETE",
		path : "/admin/deleteAttributes",
		handler : AttributeController.deleteAttributes,
		options: {
			tags : ["api", "attributes"],
			notes : "Delete Attributes",
			description : "Delete Attributes",
			auth : {strategy: 'jwt', scope : ["admin"]},
			validate : {
				headers : Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options : {
					abortEarly : false
				},
				payload : {
					id : Joi.number().required()
				},
				failAction : async(req, h, err) =>{
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{method: AttributeController.prefunction}]
		}
    }
     */
]