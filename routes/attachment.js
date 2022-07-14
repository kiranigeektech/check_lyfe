"use strict";
const AttachmentController = require("../controllers/attachment");

module.exports = [
    {
		method: "POST",
		path: "/attachment/create",
		handler: AttachmentController.create,
		options: {
			tags: ["api","attachment"],
			notes: "Upload file to server",
			description: "Upload file",
            auth: false,
            payload: {
                maxBytes: 10000000,
                output: "stream",
                parse: true,
                multipart : true,
                timeout: 60000
            },
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					uploadfile: Joi.any()
                        .meta({ swaggerType: "file" })
                        .required()
                        .description("Upload File")
                        .error(() => {
                        return {
                            message: "INVALID_FILE"
                        };
                        })
				},
				failAction: async (req, h,err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
            },
            plugins : {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
		}
	},
    {
        method: 'POST',
        path: '/common/editorimage',
        handler: AttachmentController.uploadFile,
        options: {
			tags: ["api","attachment"],
			notes: "Upload file to server",
			description: "Upload file",
            auth: false,
            payload: {
                maxBytes: 10000000,
                output: "stream",
                parse: true,
                multipart : true,
                timeout: 60000
            },
			validate: {
				options: {
					abortEarly: false
				},
                payload: {
                    file: Joi.any()
                        .meta({ swaggerType: 'file'})
                        .required()
                        .description('Image File'),
                },
				failAction: async (req, h,err) => {
                    console.log(err)
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
            },
            plugins : {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
		}
    }
]