"use strict";
const UserController = require("../controllers/user");
const seederController = require("../controllers/seeder");
const Joi = require("joi");
//STRIPE_KEY =sk_test_51ITJnEGl6Wy7ySID7Or6UeLXO9x3mpUYtVHnDOq4HnEqmISvXThWuaLcxONV5sswkTVz1qfpxrd9AV1DrzZpeTRo00fqwiMF2G
//STRIPE_KEY =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

module.exports = [

	{
		method: "POST",
		path: "/user/signUpWithBoth",
		handler: UserController.signUpWithBoth,
		options: {
			tags: ["api","user"],
			notes: "Register a new user with all the Information",
			description: "Register user with all the Information",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					mobile: Joi.string().required().error(() => { return { message: "MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE" }; }),
					countryCode: Joi.string().required(),
					name : Joi.string().required(),
					email : Joi.string().required(),
					password : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/signUpWithMobile",
		handler: UserController.signUpWithMobile,
		options: {
			tags: ["api","user"],
			notes: "Register a new user with Mobile and OTP",
			description: "Register user with Mobile",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					mobile: Joi.string().required().error(()=>{return new Error('Error message here')}),
					countryCode: Joi.string().required(),
					country : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/signUpWithEmail",
		handler: UserController.signUpWithEmail,
		options: {
			tags: ["api","user"],
			notes: "Register a new User with Email and OTP",
			description: "Register user with Email",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					email: Joi.string().email().trim().required().error(() => {
						return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
					}),
					password: Joi.string().required().error(() => {
						return { message: "PASSWORD_IS_REQUIRED" };
					}),
					name : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/verifyAccount",
		handler: UserController.verifyAccount,
		options: {
			tags: ["api","user"],
			notes: "Verify email/mobile no",
			description: "Verify email/mobile no",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},

				payload: {
					userId: Joi.number().required().error(() => {
						return { message: "USERID_IS_REQUIRED" };
					}),
					identifier: Joi.string().optional().valid("email", "mobile").default("mobile").error(() => {
						return { message: "IDENTIFIER_IS_REQUIRED" };
					}),
					verificationCode: Joi.string().required().error(() => {
						return { message: "VERIFICATION_CODE_IS_REQUIRED" };
					}),
					pinId : Joi.string().optional().allow("", null),
					token :Joi.string().optional()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/loginWithMobile",
		handler: UserController.loginWithMobile,
		options: {
			tags: ["api","user"],
			notes: "Login a new user with Mobile and OTP",
			description: "Login user with Mobile",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					mobile: Joi.string().required().error((errors) => { return new Error("MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE"); }),
					countryCode: Joi.string().required().error((errors) => { return new Error("MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE"); }),
					verificationCode : Joi.string().optional(),
					pinId : Joi.string().optional(),
					password: Joi.string().optional(),
				},
				failAction: async (req, h, err) => {
					console.log(err);
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/loginWithEmail",
		handler: UserController.loginWithEmail,
		options: {
			tags: ["api","user"],
			notes: "Login a new user with Email and password",
			description: "Login user with Email",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					email: Joi.string().email().trim().required().error(() => {
						return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
					}),
					password : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/user/isMobileExist",
		handler: UserController.mobileExist,
		options: {
			tags: ["api", "user"],
			notes: "Check Whether Mobile Exist",
			description: "Check Whether Mobile Exist",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				query: {
					mobile: Joi.string().required().error(() => { return { message: "MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE" }; }),
					countryCode: Joi.string().required(),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/loginWithOTP",
		handler: UserController.loginWithOTP,
		options: {
			tags: ["api","user"],
			notes: "Login a new user with Mobile and OTP",
			description: "Login user with Mobile",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					mobile: Joi.string().required().error((errors) => { return new Error("MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE"); }),
					countryCode: Joi.string().required().error((errors) => { return new Error("MOBILE_NO_IS_REQUIRED_AND_MUST_BE_VALID_MOBILE"); }),
				},
				failAction: async (req, h, err) => {
					console.log(err);
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/updateProfile",
		handler: UserController.updateProfile,
		options: {
			tags: ["api", "user"],
			notes: "Update user Profile",
			description: "Update user Profile",
			auth: {strategy:"jwt", scope: ["user", "admin"]},
			validate: {
				options: {
					abortEarly: false
				},
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				payload: {
					firstName : Joi.string().allow("").optional(),
					lastName : Joi.string().allow("").optional(),
					email: Joi.string().email().trim().required().error(() => {
						return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
					}),
					profileImage_id : Joi.string().allow("", null).optional(),
					dob : Joi.string().allow("", null).optional(),
					address : Joi.string().allow("", null).optional(),
					latitude : Joi.number().allow("",null).optional(),
					longitude : Joi.number().allow("", null).optional(),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/user/getProfile",
		handler: UserController.getProfile,
		options: {
			tags: ["api","user"],
			notes: "Get user Profile",
			description: "Get user Profile",
			auth: {strategy:"jwt", scope: ["admin", "user"]},
			validate: {
				options: {
					abortEarly: false
				},
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				query: {
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/resetPasswordInitiate",
		handler: UserController.resetPasswordInitiate,
		options: {
			tags: ["api","user"],
			notes: "Intitate the user reset password to receive token",
			description: "Initiate Reset Password",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					countryCode : Joi.string().required(),
					mobile: Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "PATCH",
		path: "/user/resetPassword",
		handler: UserController.resetPassword,
		options: {
			tags: ["api","user"],
			notes: "Reset User Password with token",
			description: "Reset Password",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					countryCode : Joi.string().required(),
					mobile :  Joi.string().required(),
					verificationCode : Joi.string().required(),
					password : Joi.string().required(),
					pinId : Joi.string().optional()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "PATCH",
		path: "/user/changePassword",
		handler: UserController.changePassword,
		options: {
			tags: ["api","user"],
			notes: "Allow user to change password after login",
			description: "Change password",
			auth: {strategy:"jwt", scope: ["user", "admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					oldPassword: Joi.string()
						.required()
						.error(() => {
							return {
								message: "OLD_PASSWORD_IS_REQUIRED"
							};
						}),
					newPassword: Joi.string()
						.required()
						.error(() => {
							return {
								message: "PASSWORD_IS_REQUIRED"
							};
						})
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/logout",
		handler: UserController.logout,
		options: {
			tags: ["api","user"],
			notes: "User logout",
			description: "Logout Users",
			auth: {strategy:"jwt", scope:["admin", "user"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/updateMobileInitiate",
		handler: UserController.updateMobileInitiate,
		options: {
			tags: ["api","user"],
			notes: "Initiate Mobile Update",
			description: "Initiate Mobile Update",
			auth: {strategy:"jwt", scope:["admin", "user"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload : {
					countryCode : Joi.string().required(),
					mobile : Joi.string().required(),
					country:Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "POST",
		path: "/user/updateMobile",
		handler: UserController.updateMobile,
		options: {
			tags: ["api","user"],
			notes: "Update Mobile",
			description: "Update Mobile",
			auth: {strategy:"jwt", scope:["admin", "user"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload : {
					countryCode : Joi.string().required(),
					mobile : Joi.string().required(),
					verificationCode : Joi.string().optional()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/user/resendVerificationCode",
		handler: UserController.resendVerificationCode,
		options: {
			tags: ["api", "user"],
			notes: "Resend Verification Code",
			description: "Resend Verification Code",
			auth: false,
			validate: {
				options: {
					abortEarly: false,
					allowUnknown:true
				},
				query: {
					userId: Joi.number().required(),
					countryCode: Joi.string().required(),
					mobile: Joi.string().required(),
					country:Joi.string().required()
					
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: UserController.prefunction }]
		}
	},

	 {
		method: "POST",
		path: "/setSeeder",
		handler: seederController.setSeeders,
		options: {
			tags: ["api", "Seeder"],
			notes: "Seeder Code",
			description: "Seeder Code",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
			
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			/* pre: [{ method: UserController.prefunction }] */
		}
	}, 

	{
		method: "POST",
		path: "/user/VerificationCode",
		handler:UserController.UpdateMobileOtpVerification,
		options: {
			tags: ["api", "user"],
			notes: "Update Mobile OTP Verification ",
			description: "Update Mobile OTP Verification ",
			auth: {strategy:"jwt", scope: ["user", "admin"]},
			validate: {
				options: {
					abortEarly: false
				},
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				payload: {
					countryCode: Joi.string().required(),
					mobile : Joi.string().required(),
					identifier: Joi.string().optional().valid("email", "mobile").default("mobile").error(() => {
						return { message: "IDENTIFIER_IS_REQUIRED" };
					}),
					verificationCode: Joi.string().required().error(() => {
						return { message: "VERIFICATION_CODE_IS_REQUIRED" };
					}),
					country:Joi.string().required()
					
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			/* pre: [{ method: UserController.prefunction }] */
		}
	},

	/* {
		method: "GET",
		path: "/guestToken",
		handler: UserController.guestToken,
		options: {
			tags: ["api", "Guest"],
			notes: "guesttoken Code",
			description: "guesttoken Code",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
			},
			pre: [{ method: UserController.prefunction }]
		}
	},
	 */
];
