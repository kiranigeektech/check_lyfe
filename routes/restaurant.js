"use strict";
const restaurantController = require("../controllers/restaurantController");
const universalFunctions = require("../universalFunctions/lib");
const joi = require("joi");
const Joi = require("joi");
module.exports = [
  // Write your endpoints here
  {
    method: "POST",
    path: "/addRestaurant",
    handler: restaurantController.addRestaurant,
    options: {
      tags: ["api", "Restaurant"],
      notes: "Add Restaurant Api",
      description: "Add Restaurant Api",
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
          restaurantgalleries: joi.array().items(joi.number()),
          featured: joi.boolean(),
		  capacity:joi.number().optional(),
          amenities: joi.array().items(
            joi.object().keys({
              amenitiesItem: joi.string(),
              attachment_id: joi.number(),
            })
          ),
          restaurantAvailability: joi.array().items(
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
		  restaurantMenuCategories: joi.array().items(
			joi.object({
			  name: joi.string(),
			  restaurantMenuCategoryItems: joi.array().items(
				joi.object({	
				  price: joi.number(),
				  itemName: joi.string(),
				  itemDescription: joi.string(),
				  attachment_id:joi.number(),	  
				  isVeg:joi.boolean(),
				  minLimit:joi.number(),
				  maxLimit:joi.number(),
				})
			  ),
			})
		  ),
		  serviceType: joi.number().default(3),
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
 //menu get 
  {
	method : "GET",
		path : "/menu",
		handler : restaurantController.getMenu,
		options: {
			tags: ["api", "restaurantMenu"],
			notes: "Get restaurantMenu Api",
			description: "Get restaurantMenu Api",
			auth:false,
			validate: {
				options: {
					abortEarly: false,
				  },
				
				query : {
					id:joi.number().required()
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
  },
//menuCategeory
  {
	method : "POST",
	path : "/vendor/addmenuCategory",
	handler : restaurantController.addMenuCategory,
	options: {
		tags: ["api", "Vendor"],
		notes: "post restaurantMenu Api",
		description: "post restaurantMenu Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
			payload : {
				restaurantId:joi.number().required(),
				name: joi
				.array()
				.items(joi.string())
				.required()
				.error(() => {
				  return { message: "Item is required" };
				}),
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },
//menuCategoryItem
  {
	method : "POST",
	path : "/vendor/addmenucategoryItem",
	handler : restaurantController.addMenuCategoryItem,
	options: {
		tags: ["api", "Vendor"],
		notes: "post restaurantMenuItem Api",
		description: "post restaurantMenuItem Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
			payload : {
				restaurant_id:joi.number().required(),
				menuCategory_id:joi.number().required(),
				items: joi.array().items(
					joi.object({	
					  price: joi.number(),
					  itemName: joi.string(),
					  itemDescription: joi.string(),
					  attachment_id:joi.number(),	  
					  isVeg:joi.boolean(),
					  isRecommended:joi.boolean(),
					  minLimit:joi.number(),
					  maxLimit:joi.number(),
					})
				  ),
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },
//menuCategeory
  {
	method : "PUT",
	path : "/vendor/editmenuCategory/{id}",
	handler : restaurantController.editMenuCategory,
	options: {
		tags: ["api", "Vendor"],
		notes: "Edit restaurantMenu Api",
		description: "Edit restaurantMenu Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
				params:{
					id:joi.number().required(),
					
				},
			payload : {
				/* restaurantId:joi.number().required(), */
				name:joi.string()
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },

	 //cart 
 { 
	 method : "POST",
	path : "/Cart",
	handler : restaurantController.getCart,
	options: {
		tags: ["api", "restaurantCart"],
		notes: "get cart Api",
		description: "get cart Api",
		auth: {strategy:"jwt", scope: ["admin","user"],mode:'optional'},
		validate: {
			options: {
			  abortEarly: false,
			},
			headers: Joi.object(UniversalFunctions.headers(true)).options({
						allowUnknown: true
					}),
				payload : {
					restaurantId:joi.number().required(),
					totalPrice:joi.number().optional(),
					items:joi.array().items(
						joi.object({
							itemId:joi.number(),
							itemQuantity:joi.number()
						})
					)
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
  
	}
  },
//update cart
  {
	method : "POST",
	path : "/updateCart",
	handler : restaurantController.update,
	options: {
		tags: ["api", "restaurantCart"],
		notes: "update cart Api",
		description: "update cart Api",
		auth: {strategy:"jwt", scope: ["admin","user"]},
		validate: {
			options: {
			  abortEarly: false,
			},
			headers: Joi.object(UniversalFunctions.headers()).options({
						allowUnknown: true
					}),
				payload:{
					cartItemId:joi.number().required(),
                    itemQuantity:joi.number().required()
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
  
	}
  },

//charges
  {
    method: "POST",
    path: "/vendor/addrestaurantCharges",
    handler: restaurantController.addCharges,
    options: {
      tags: ["api", "Vendor"],
      notes: "Add charges Api",
      description: "Add charges Api",
      auth:  {strategy:"jwt", scope:["vendor"]},
      validate: {
		headers: Joi.object(UniversalFunctions.headers()).options({
			allowUnknown: true
		}),
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        payload: {
		restaurantId:joi.number().required(),
		taxes:joi.array().items(
			joi.object().keys({
			taxName: joi.string(),
			percentage:joi.number()
		})
		)
        },
        validator: joi,
      },
    },
  },
  
//charges
  {
	method : "GET",
		path : "/vendor/getrestaurantCharges",
		handler : restaurantController.getCharges,
		options: {
			tags: ["api", "Vendor"],
			notes: "Get restaurantCharges Api",
			description: "Get restaurantCharges Api",
			auth:  {strategy:"jwt", scope:["vendor"]},
			validate: {
			  headers: Joi.object(UniversalFunctions.headers()).options({
				  allowUnknown: true
			  }),
				options: {
					abortEarly: false,
					allowUnknown:true
				  },
				query : {
					id:joi.number().required()
				},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
  },
//charges
  {
	method : "PUT",
	path : "/restaurantCharges/{id}",
	handler : restaurantController.editCharges,
	options: {
		tags: ["api", "restaurantCharges"],
		notes: "Edit restaurantCharges Api",
		description: "Edit restaurantCharges Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"],mode:'optional'},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
			params:{
					id:joi.number().required(),	
				},
			payload : {
				taxName:joi.string().optional(),
				percentage:joi.number().optional()
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },

//order
  { 
	method : "POST",
   path : "/orderFood",
   handler : restaurantController.addOrder,
   options: {
	   tags: ["api", "restaurantOrderFood"],
	   notes: "Order food Api",
	   description: "Order food Api",
	   auth: {strategy:"jwt", scope: ["admin","user"]},
	   validate: {
		   options: {
			 abortEarly: false,
		   },
		   headers: Joi.object(UniversalFunctions.headers()).options({
					   allowUnknown: true
				   }),
			   payload : {
				   cardId:joi.number().optional(),
				   paymentMethod:joi.string().optional(),
				   paymentNonce:joi.string().optional(),
				   deviceData:joi.string().optional(),
				   restaurantId:joi.number().required(),
				   addressId:joi.number().required(),
				   items:joi.array().items(
					   joi.object({
						   itemId:joi.number(),
						   itemQuantity:joi.number()
					   })
				   )
			   },
			   failAction: async (req, h, err) => {
				   return universalFunctions.updateFailureError(err, req);
			   },
			   validator: joi
		   }
 
   }
 },

//cancel order
 { 
	method : "POST",
   path : "/cancelOrder",
   handler : restaurantController.cancelOrder,
   options: {
	   tags: ["api", "restaurantOrderFood"],
	   notes: "Cancel Order  Api",
	   description: "Cancel Order  Api",
	   auth: {strategy:"jwt", scope: ["admin","user"]},
	   validate: {
		   options: {
			 abortEarly: false,
		   },
		   headers: Joi.object(UniversalFunctions.headers()).options({
					   allowUnknown: true
				   }),
			   payload : {
				   orderId:joi.number().required(),
			   },
			   failAction: async (req, h, err) => {
				   return universalFunctions.updateFailureError(err, req);
			   },
			   validator: joi
		   }
 
   }
 },

 //getOrder
 {
	method : "GET",
		path : "/getOrders",
		handler : restaurantController.getOrder,
		options: {
			tags: ["api", "restaurantOrderFood"],
			notes: "Get restaurantOrder Api",
			description: "Get restaurantOrder Api",
			auth: {strategy:"jwt", scope: ["admin","user"]},
			validate: {
				options: {
				  abortEarly: false,
				},
				headers: Joi.object(UniversalFunctions.headers()).options({
							allowUnknown: true
						}),
						query:{
							page:Joi.number()
						},
				
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
  },

//getOrderById
  {
	method : "GET",
		path : "/getorderbyId",
		handler : restaurantController.getOrderById,
		options: {
			tags: ["api", "restaurantOrderFood"],
			notes: "Get restaurantOrder Api",
			description: "Get restaurantOrder Api",
			auth: {strategy:"jwt", scope: ["admin","user"]},
			validate: {
				options: {
				  abortEarly: false,
				},
				headers: Joi.object(UniversalFunctions.headers()).options({
							allowUnknown: true
						}),
						query:{
							id:Joi.number()
						},
				failAction: async (req, h, err) => {
					return universalFunctions.updateFailureError(err, req);
				},
				validator: joi
			}
		}
  },

  //repestOrder
  { 
	method : "GET",
   path : "/repeatOrder/{orderId}",
   handler : restaurantController.repeatOrder,
   options: {
	   tags: ["api", "restaurantOrderFood"],
	   notes: "repeatOrder food Api",
	   description: "repeatOrder food Api",
	   auth: {strategy:"jwt", scope: ["admin","user"]},
	   validate: {
		   options: {
			 abortEarly: false,
		   },
		   headers: Joi.object(UniversalFunctions.headers()).options({
					   allowUnknown: true
				   }),
			   params : {
				   orderId:joi.number().required(),
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
	path : "/vendor/getmenuCategory",
	handler : restaurantController.getMenuCategory,
	options: {
		tags: ["api", "Vendor"],
		notes: "get restaurantMenu Api",
		description: "get restaurantMenu Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
			query: {
			 id:joi.number().required(),
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
	path : "/vendor/getmenuCategoryItem",
	handler : restaurantController.getMenuCategoryItem,
	options: {
		tags: ["api", "Vendor"],
		notes: "get restaurantMenu Api",
		description: "get restaurantMenu Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
			query: {
			 id:joi.number().required(),
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },

  {
	method : "PUT",
	path : "/vendor/editmenuCategoryItem/{id}",
	handler : restaurantController.editMenuCategoryItem,
	options: {
		tags: ["api", "Vendor"],
		notes: "Edit restaurantMenuItem Api",
		description: "Edit restaurantMenuItem Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
				params:{
					id:joi.number().required(),
				},
			payload : {
				price: joi.number(),
				itemName: joi.string(),
				itemDescription: joi.string(),
				attachment_id:joi.number(),	  
				isVeg:joi.boolean(),
				isRecommended:joi.boolean(),
				minLimit:joi.number(),
				maxLimit:joi.number(),
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
	path : "/vendor/getmenucategoryitembyId",
	handler : restaurantController.getMenuCategoryItembyId,
	options: {
		tags: ["api", "Vendor"],
		notes: "get restaurantMenuItem Api",
		description: "get restaurantMenuItem Api",
		auth: {strategy:"jwt", scope: ["vendor","admin"]},
      validate: {
        options: {
          abortEarly: false,
		  allowUnknown:true
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
			query: {
			 id:joi.number().required(),
			},
			failAction: async (req, h, err) => {
				return universalFunctions.updateFailureError(err, req);
			},
			validator: joi
		}
	}
  },

    
  {
	method: "DELETE",
	path: "/vendor/deletemenuCategory",
	handler: restaurantController.deleteMenuCategory,
	options: {
	  tags: ["api", "Vendor"],
	  notes: "Delete Api",
	  description: "Delete Api",
	  auth: {strategy:"jwt", scope: ["vendor"]},
	  validate: {
		options: {
		  abortEarly: false,
		},
		 headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}), 
		payload:{
		  id:joi.number().required(),
		  isDeleted:joi.boolean().required()
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
	path: "/vendor/deletemenucategoryItem",
	handler: restaurantController.deleteMenuCategoryItem,
	options: {
	  tags: ["api", "Vendor"],
	  notes: "Delete Api",
	  description: "Delete Api",
	  auth: {strategy:"jwt", scope: ["vendor"]},
	  validate: {
		options: {
		  abortEarly: false,
		},
		 headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}), 
				payload:{
					id:joi.number().required(),
					isDeleted:joi.boolean().required()
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
	path: "/vendor/changeitemStatus",
	handler: restaurantController.changeMenuCategoryItemStatus,
	options: {
	  tags: ["api", "Vendor"],
	  notes: "item status Api",
	  description: "item status Api",
	  auth: {strategy:"jwt", scope: ["vendor"]},
	  validate: {
		options: {
		  abortEarly: false,
		},
		 headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}), 
		payload:{
		   id:joi.number().required(),
			isActive:joi.boolean().required()
			},
		failAction: async (req, h, err) => {
		  return universalFunctions.updateFailureError(err, req);
		},
		validator: joi,
	  },
	},
  },


];
