"use strict";
const Joi = require("joi");
const AdminController = require("../controllers/admin");
const vendorController = require("../controllers/vendor")

module.exports = [

	{
		method: "POST",
		path: "/admin/login",
		handler: AdminController.login,
		options: {
			tags: ["api","admin"],
			notes: "Admin login",
			description: "Admin login",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					email: Joi.string().email().trim().required().valid(),
					//error(()=> {return Error('Invalid Email')}),
					password : Joi.string().required()
				},
				failAction: async (req, h,err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

/* 	{
		method: "PATCH",
		path: "/admin/user/changePassword",
		handler : AdminController.userChangePassword,
		options: {
			tags: ["api","admin"],
			notes: "Change Password",
			description: "Change Password",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					userId : Joi.number().required(),
					password : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	}, */
	{
		method: "PATCH",
		path: "/admin/changePassword",
		handler : AdminController.changePassword,
		options: {
			tags: ["api","admin"],
			notes: "Change Password",
			description: "Change Password",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					oldPassword: Joi.string().required(),
					newPassword : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},
	{
		method: "GET",
		path: "/admin/user/list",
		handler: AdminController.getUserListing,
		options: {
			tags: ["api","admin"], 
			notes: "Get Users Listing",
			description: "Get Users Listing",
			auth: {strategy: "jwt", scope:["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					page: Joi.number().allow("").default(1),
					name: Joi.string().optional().allow("", null),
					/* lastName: Joi.string().optional().allow("", null), */
					email: Joi.string().email().optional().allow("",null),
          			mobile: Joi.string().optional().allow("", null),
					/* role: Joi.string().optional().min(1).max(3), */
					status : Joi.number().optional().min(-1).max(2).default(-1), 
					isCsv:Joi.boolean().optional().default(false) 
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "PATCH",
		path: "/admin/user/updateStatus",
		handler : AdminController.activateDeactivateUser,
		options: {
			tags: ["api","admin"],
			notes: "Activate/Deactivate User",
			description: "Activate/Deactivate User",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					userId : Joi.number().required(),
					status : Joi.number().integer().min(1).max(3).required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "DELETE",
		path: "/admin/user/delete",
		handler : AdminController.deleteUser,
		options: {
			tags: ["api","admin"],
			notes: "Delete User",
			description: "Delete User",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					userId : Joi.number().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	/* {
		method : "POST",
		path : "/admin/user/create",
		handler: AdminController.createUser,
		options: {
			tags: ["api","admin"],
			notes: "Create user",
			description: "Create user by admin",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				payload: {
					email: Joi.string().optional(),
					password : Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
					name : Joi.string().required(),
					mobile: Joi.string().required(),
					countryCode : Joi.string().required(),
					role : Joi.number().required().min(1).max(3)
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	}, */

	/* {
		method: "GET",
		path: "/admin/user/viewProfile",
		handler: AdminController.viewProfileUser,
		options: {
			tags: ["api","admin"],
			notes: "View profile user",
			description: "View profile user",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					userId : Joi.number().required()
				},
				failAction: async (req, h,err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	}, */

/* 	{
		method: "POST",
		path: "/admin/resetPasswordInitiate",
		handler: AdminController.resetPasswordInitiate,
		options: {
			tags: ["api","admin"],
			notes: "Intitate the admin reset password to receive otp",
			description: "Initiate Reset Password",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					email :  Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	}, */

	/* {
		method: "PATCH",
		path: "/admin/resetPassword",
		handler: AdminController.resetPassword,
		options: {
			tags: ["api","admin"],
			notes: "Reset User Password with code",
			description: "Reset Password",
			auth: false,
			validate: {
				options: {
					abortEarly: false
				},
				payload: {
					email :  Joi.string().required(),
					verificationCode : Joi.string().required(),
					password : Joi.string().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	}, */

	{
		method: "GET",
		path: "/admin/getRoles",
		handler: AdminController.getRoles,
		options: {
			tags: ["api","acl"],
			notes: "Get the Roles list",
			description: "Roles Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
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
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method : "POST",
		path: "/admin/addRole",
		handler: AdminController.addRoles,
		options: {
			tags: ["api","acl"],
			notes: "Add Roles",
			description: "Add Roles",
			auth: {strategy:"jwt", scope:["admin"]},
			validate:{
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly : false
				},
				payload: {
					role : Joi.string().required(),
					permissionIds: Joi.array().items(Joi.number().required()).required(),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{ method: AdminController.prefunction }]
		}
	},

	{	
		method : "PATCH",
		path: "/admin/editRole",
		handler: AdminController.editRoles,
		options: {
			tags: ["api","acl"],
			notes: "Edit Roles",
			description: "Edit Roles",
			auth: {strategy:"jwt", scope:["admin"]},
			validate:{
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly : false
				},
				payload: {
					id : Joi.number().required(),
					role : Joi.string().optional(),
					permissionIds: Joi.array().items(Joi.number().required()).required(),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{ method: AdminController.prefunction }]
		}
	},

	{
		method : "DELETE",
		path: "/admin/deleteRole",
		handler: AdminController.deleteRoles,
		options: {
			tags: ["api","acl"],
			notes: "Delete Roles",
			description: "Delete Roles",
			auth: {strategy:"jwt", scope:["admin"]},
			validate:{
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly : false
				},
				payload: {
					id : Joi.number().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre : [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/getPermissions",
		handler: AdminController.getPermissions,
		options: {
			tags: ["api","acl"],
			notes: "Get Permissions list",
			description: "Permissions Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
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
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/getRolesWithPermissions",
		handler: AdminController.getRolesWithPermissions,
		options: {
			tags: ["api","acl"],
			notes: "Get Permissions list",
			description: "Permissions Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
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
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/getRoleWithId",
		handler: AdminController.getRolesWithId,
		options: {
			tags: ["api","acl"],
			notes: "Get Permissions list",
			description: "Permissions Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false
				},
				query: {
					roleId : Joi.number().required()
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/getbooking",
		handler: AdminController.getBooking,
		options: {
			tags: ["api","admin"],
			notes: "Get booking list",
			description: "booking Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false,
					allowUnknown:true
				},
				query: {
					type:Joi.string().valid('event','club','activity','shops','restaurant').required(),
					page:Joi.number(),
					id:Joi.number().optional().allow("", null),
					/* status:Joi.string().valid('pending','cancelled','success').optional().allow("", null), */
					userName:Joi.string().optional().allow("", null),
					mobile:Joi.string().optional().allow("", null),
				    title:Joi.string().optional().allow("", null),
					paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
					fromDate:Joi.date().iso().optional().allow("", null),
					toDate:Joi.date().iso().optional().allow("", null),
					
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},


	{
		method: "GET",
		path: "/admin/getOrder",
		handler: AdminController.getOrder,
		options: {
			tags: ["api","admin"],
			notes: "Get Order list",
			description: "Order Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false,
					allowUnknown:true
				},
				query: {
					page:Joi.number(),
					id:Joi.number().optional().allow("", null),
					/* status:Joi.string().valid('pending','cancelled','success').optional().allow("", null), */
					userName:Joi.string().optional().allow("", null),
					mobile:Joi.string().optional().allow("", null),
				    title:Joi.string().optional().allow("", null),
					paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
					fromDate:Joi.date().iso().optional().allow("", null),
					toDate:Joi.date().iso().optional().allow("", null),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/getTransactions",
		handler: AdminController.getTransactions,
		options: {
			tags: ["api","admin"],
			notes: "Get Transactions list",
			description: "Transactions Listing",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false,
					allowUnknown:true
				},
				query: {
					type:Joi.string().valid('event','activity','restaurant').required(),
					page:Joi.number(),
					transactionId:Joi.string().optional().allow("", null),
					bookingId:Joi.number().optional().allow("", null),
					/* status:Joi.string().valid('pending','cancelled','success').optional().allow("", null), */
					userName:Joi.string().optional().allow("", null),
					mobile:Joi.string().optional().allow("", null),
				 /*    title:Joi.string().optional().allow("", null), */
					paymentMode:Joi.string().optional().allow("", null),
					fromDate:Joi.date().iso().optional().allow("", null),
					toDate:Joi.date().iso().optional().allow("", null),
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},

	{
		method: "GET",
		path: "/admin/vendor/list",
		handler: AdminController.getVendorListing,
		options: {
			tags: ["api","admin"], 
			notes: "Get Vendor Listing",
			description: "Get Vendor Listing",
			auth: {strategy: "jwt", scope:["admin"]},
			validate: {
				headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
				options: {
					abortEarly: false,
					allowUnknown:true
				},
				query: {
					page: Joi.number().allow("").default(1),
					name: Joi.string().optional().allow("", null),
					/* lastName: Joi.string().optional().allow("", null), */
					email: Joi.string().email().optional().allow("",null),
          			mobile: Joi.string().optional().allow("", null),
					/* role: Joi.string().optional().min(1).max(3), */
					status : Joi.number().optional().min(-1).max(2).default(-1),  
				},
				failAction: async (req, h, err) => {
					return UniversalFunctions.updateFailureError(err, req);
				},
				validator: Joi
			},
			pre: [{ method: AdminController.prefunction }]
		}
	},


	{
		method: "GET",
		path: "/admin/getbusinessListing",
		handler: AdminController.getbusinessListing,
		options: {
		  tags: ["api", "admin"],
		  notes: "Listing Api",
		  description: "Listing Api",
		  auth: {strategy:"jwt", scope: ["admin"]},
		  validate: {
			options: {
			  abortEarly: false,
			  allowUnknown:true
			},
			headers: Joi.object(UniversalFunctions.headers()).options({
						allowUnknown: true
					}),
			query:{
			  type:Joi.string().valid('event','club','activity','shops','restaurant').required(),
			  page:Joi.number(),
			  title:Joi.string().allow("", null),
			  id:Joi.number().allow("", null),
			  status:Joi.number().allow("", null),
			  /* active:Joi.boolean() */
			},
			validator: Joi,
		  },
		},
	  },


	  {
		method : "POST",
		  path : "/admin/changebusinessStatus",
		  handler : AdminController.managebusinessStatus,
		  options: {
			tags: ["api", "admin"],
			notes: "Accept reject Business Api",
			description: "Accept reject Business Api",
			auth: {strategy:"jwt", scope: ["admin"]},
			validate: {
			  options: {
				abortEarly: false,
				allowUnknown:true
			  },
			  headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				  }),
				  payload:{
					type:Joi.string().valid('restaurant','shops','club','event','activity'),
				    status:Joi.number().required(),
				    id:Joi.number().required(),
				  },
			  failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			  },
			  validator: Joi
			}
		  }
		},


		{
			method : "POST",
			  path : "/admin/managesubscriptionPlan",
			  handler : AdminController.addSubscriptionPlan,
			  options: {
				tags: ["api", "admin"],
				notes: "add plan  Api",
				description: "add plan  Api",
				auth: {strategy:"jwt", scope: ["admin"]},
				validate: {
				  options: {
					abortEarly: false,
					allowUnknown:true
				  },
				  headers: Joi.object(UniversalFunctions.headers()).options({
						allowUnknown: true
					  }),
					  payload:{
						title:Joi.string().required(),
						description:Joi.string().required(),
						duration:Joi.string().required(),
						price:Joi.number().required(),
						id:Joi.number().optional(),
					  },
				  failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				  },
				  validator: Joi
				}
			  }
			},

			{
				method: "DELETE",
				path: "/admin/deletesubscriptionPlan",
				handler: AdminController.deleteSubscriptionPlan,
				options: {
				  tags: ["api", "admin"],
				  notes: "Delete plan Api",
				  description: "Delete plan Api",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
				   options: {
						 abortEarly: false,
						 allowUnknown:true
					   },
				   headers: Joi.object(UniversalFunctions.headers()).options({
						 allowUnknown: true
				   }),
				   query: {
					  id: Joi
						.number()
						.required()
					},
					validator: Joi,
				  },
				},
			  },


			  {
				method: "GET",
				path: "/admin/getsubscriptionplanbyId",
				handler: AdminController.getSubscriptionPlanById,
				options: {
				  tags: ["api", "admin"],
				  notes: "Listing Api",
				  description: "Listing Api",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					options: {
					  abortEarly: false,
					},
					headers: Joi.object(UniversalFunctions.headers()).options({
								allowUnknown: true
							}),
					query:{
					  id:Joi.number().required()
					},
					failAction: async (req, h, err) => {
					  return universalFunctions.updateFailureError(err, req);
					},
					validator: Joi,
				  },
				},
			  },


			  {
				method: "GET",
				path: "/admin/getsubscriptionPlan",
				handler: vendorController.vendorGetSubscriptionPlan,
				options: {
				  tags: ["api","admin"],
				  notes: "Get plans list",
				  description: "plans Listing",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					headers: Joi.object(UniversalFunctions.headers()).options({
					  allowUnknown: true
					}),
					options: {
					  abortEarly: false,
					  allowUnknown:true
					},
					failAction: async (req, h, err) => {
					  return UniversalFunctions.updateFailureError(err, req);
					},
					validator: Joi
				  },
				  
				}
			  },


			  {
				method: "GET",
				path: "/admin/claimbusinessrequestListing",
				handler: AdminController.claimBusinessRequestListing,
				options: {
				  tags: ["api","admin"],
				  notes: "Get plans list",
				  description: "plans Listing",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					headers: Joi.object(UniversalFunctions.headers()).options({
					  allowUnknown: true
					}),
					options: {
					  abortEarly: false,
					  allowUnknown:true
					},
					query:{
						page:Joi.number(),
						type:Joi.string().valid('restaurant','shops','club','event','activity').required(),
						title:Joi.string().allow("",null).optional(),
						status:Joi.number().valid(0,1,2).optional()
					},
					failAction: async (req, h, err) => {
					  return UniversalFunctions.updateFailureError(err, req);
					},
					validator: Joi
				  },
				  
				}
			  },

			  {
				method: "POST",
				path: "/admin/claimbusiness",
				handler: AdminController.claimBusinessAction,
				options: {
				  tags: ["api","admin"],
				  notes: " claim business",
				  description: "claim business",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					headers: Joi.object(UniversalFunctions.headers()).options({
					  allowUnknown: true
					}),
					options: {
					  abortEarly: false,
					  allowUnknown:true
					},
					payload:{
						type:Joi.string().valid('restaurant','shops','club','event','activity').required(),
						id:Joi.number().required(),
						business_id:Joi.number().required(),
						user_id:Joi.number().required(),
						status:Joi.number().valid(1,2).required()
					},
					failAction: async (req, h, err) => {
					  return UniversalFunctions.updateFailureError(err, req);
					},
					validator: Joi
				  },
				  
				}
			  },

			  {
				method: "POST",
				path: "/admin/uploadClaimBusinessListing",
				handler: AdminController.uploadClaimBusinessListing,
				options: {
				  tags: ["api","admin"],
				  notes: " claim business",
				  description: "claim business",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					headers: Joi.object(UniversalFunctions.headers()).options({
					  allowUnknown: true
					}),
					options: {
					  abortEarly: false,
					  allowUnknown:true
					},
					payload:{
						type:Joi.string().valid('restaurant','shops','club','event','activity').required(),
						csvRecords:Joi.any(),
						locationName:Joi.string().required(),

						// csvRecords: Joi.array().items(Joi.object({
						// 	title: Joi.string(),
						// 	address: Joi.string(),
						// 	description: Joi.string(),
						// 	// attachment_id: joi.number(),
						// 	category_id: Joi.number(),
						// 	refundTime:Joi.number(),
						// 	bookingUrl:Joi.string().allow("",null),
						// 	cancellationPolicy:Joi.string().allow(null),
						// 	termsAndCondition:Joi.string().allow(null),
						// 	serviceAvailableAtHome:Joi.boolean().optional(),
						// 	serviceAvailableAtShop:Joi.boolean().optional(),
						// 	mobile:Joi.string().optional(),
						// 	lat:Joi.number().min(-90).max(90),
						// 	long:Joi.number().min(-180).max(180),
						// 	capacity:Joi.number(),
						// 	showAddress:Joi.boolean().optional()
						// })).required().min(1).error((er)=>{
						// 	return 'constant.MESSAGE.INVALID_CSV'
						// }),					
					},
					failAction: async (req, h, err) => {
					  return UniversalFunctions.updateFailureError(err, req);
					},
					validator: Joi
				  },
				  
				}
			  },
			  {
				method: "POST",
				path: "/admin/uploadMixClaimBusinessListing",
				handler: AdminController.uploadMixClaimBusinessListing,
				options: {
				  tags: ["api","admin"],
				  notes: " claim business",
				  description: "claim business",
				  auth: {strategy:"jwt", scope: ["admin"]},
				  validate: {
					headers: Joi.object(UniversalFunctions.headers()).options({
					  allowUnknown: true
					}),
					options: {
					  abortEarly: false,
					  allowUnknown:true
					},
					payload:{
						csvRecords:Joi.any(),				
					},
					failAction: async (req, h, err) => {
					  return UniversalFunctions.updateFailureError(err, req);
					},
					validator: Joi
				  },
				  
				}
			  },

			  {
				method : "POST",
				  path : "/admin/managebusinessTrending",
				  handler : AdminController.manageBusinessTrending,
				  options: {
					tags: ["api", "admin"],
					notes: "manage Business trending Api",
					description: "manage Businesstrending  Api",
					auth: {strategy:"jwt", scope: ["admin"]},
					validate: {
					  options: {
						abortEarly: false,
						allowUnknown:true
					  },
					  headers: Joi.object(UniversalFunctions.headers()).options({
							allowUnknown: true
						  }),
						  payload:{
							type:Joi.string().valid('restaurant','shops','club','event','activity'),
							isTrending:Joi.number().valid(0,1).optional(),
							featured:Joi.number().valid(0,1).optional(),
							id:Joi.number().required(),
						  },
					  failAction: async (req, h, err) => {
						return universalFunctions.updateFailureError(err, req);
					  },
					  validator: Joi
					}
				  }
				},



				{
					method: "GET",
					path: "/admin/getusergeneralInfo",
					handler: AdminController.getGeneralInfo,
					options: {
					  tags: ["api", "admin"],
					  notes: "Get general Api",
					  description: "Get general Api",
					  auth: false,
					  validate: {
						options: {
						  abortEarly: false,
						  allowUnknown:true
						},
						headers: Joi.object(UniversalFunctions.headers(true)).options({
									allowUnknown: true
								}),
					
						validator: Joi,
					  },
					 
					},
				  },
				
				  {
					method: "GET",
					path: "/admin/getvendorgeneralInfo",
					handler: AdminController.getVendorGeneral,
					options: {
					  tags: ["api", "admin"],
					  notes: "Get general Api",
					  description: "Get general Api",
					  auth: false,
					  validate: {
						options: {
						  abortEarly: false,
						  allowUnknown:true
						},
						headers: Joi.object(UniversalFunctions.headers(true)).options({
									allowUnknown: true
								}),
						validator: Joi,
					  },
					 
					},
				  },


				  {
					method: "GET",
					path: "/admin/getvendorpayAmount",
					handler: AdminController.getVendorPayoutAmount,
					options: {
					  tags: ["api", "admin"],
					  notes: "Get total Api",
					  description: "Get total Api",
					  auth:  {strategy:"jwt", scope: ["admin"]},
					  validate: {
						options: {
						  abortEarly: false,
						},
						headers: Joi.object(UniversalFunctions.headers(true)).options({
									allowUnknown: true
								}),
						query:{
									user_id:Joi.number().required()
								},
						validator: Joi,
					  },
					 
					},
				  },


				  {
					method : "POST",
					  path : "/admin/payamounttoVendor",
					  handler : AdminController.AdminPayVendor,
					  options: {
						tags: ["api", "admin"],
						notes: "vendpr pay  Api",
						description: "vendpr pay  Api",
						auth: {strategy:"jwt", scope: ["admin"]},
						validate: {
						  options: {
							abortEarly: false,
							allowUnknown:true
						  },
						  headers: Joi.object(UniversalFunctions.headers()).options({
								allowUnknown: true
							  }),
							  payload:{
								user_id:Joi.number().required(),
								stripeaccountconnectId:Joi.string().required(),
								amount:Joi.number().required(),
							  },
						  failAction: async (req, h, err) => {
							return universalFunctions.updateFailureError(err, req);
						  },
						  validator: Joi
						}
					  }
					},


					{
						method: "GET",
						path: "/admin/vendorPaymentListing",
						handler: AdminController.getAdminPayVendorList,
						options: {
						  tags: ["api","admin"],
						  notes: "Get vendor transaction list",
						  description: "vendor transaction Listing",
						  auth: {strategy:"jwt", scope: ["admin"]},
						  validate: {
							headers: Joi.object(UniversalFunctions.headers()).options({
							  allowUnknown: true
							}),
							options: {
							  abortEarly: false,
							  allowUnknown:true
							},
							query:{
								page:Joi.number(),
								vendor_id:Joi.number().required(),
								is_csv: Joi.boolean().default(false)
							},
							failAction: async (req, h, err) => {
							  return UniversalFunctions.updateFailureError(err, req);
							},
							validator: Joi
						  },
						  
						}
					  },


					  {
						method: "GET",
						path: "/admin/dashboard",
						handler: AdminController.adminDashboard,
						options: {
						  tags: ["api","admin"],
						  notes: "Get dashboard",
						  description: "dashboarding",
						  auth: {strategy:"jwt", scope: ["admin"]},
						  validate: {
							headers: Joi.object(UniversalFunctions.headers()).options({
							  allowUnknown: true
							}),
							options: {
							  abortEarly: false,
							  allowUnknown:true
							},
							query:{
								day:Joi.number().valid(1,7,30,365).default(1).required()
							},
							failAction: async (req, h, err) => {
							  return UniversalFunctions.updateFailureError(err, req);
							},
							validator: Joi
						  },
						  
						}
					  },
		
		
		



];