"use strict";
const vendorController = require("../controllers/vendor");
/* const hostFollow = require("../controllers/hostFollow") */
const universalFunctions = require("../universalFunctions/lib");
const joi = require("joi");
const Joi = require("joi");


module.exports=[

    
        {
            method: "POST",
            path: "/vendor/signUp",
            handler: vendorController.vendorsignUp,
            options: {
                tags: ["api","Vendor"],
                notes: "Register a new vendor with Email ",
                description: "Register vendor with Email",
                auth: false,
                validate: {
                    options: {
                        abortEarly: false
                    },
                    payload: {
                        email: joi.string().email().trim().required().error(() => {
                            return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
                        }),
                        password: joi.string().required().error(() => {
                            return { message: "PASSWORD_IS_REQUIRED" };
                        }),
                        mobile:joi.string(),
                        countryCode:joi.string(),
                        country:joi.string(),
                        firstName : joi.string().allow("").optional(),
					              lastName : joi.string().allow("").optional(),
                        profileImage_id : joi.string().allow("", null).optional(),
                        description:joi.string()
                    },
                    failAction: async (req, h, err) => {
                        return UniversalFunctions.updateFailureError(err, req);
                    },
                    validator: joi
                },
               
            }
        },


        {
            method: "POST",
            path: "/vendor/login",
            handler: vendorController.vendorSignIn,
            options: {
                tags: ["api","Vendor"],
                notes: "vendor login",
                description: "vendor login",
                auth: false,
                validate: {
                    options: {
                        abortEarly: false
                    },
                    payload: {
                        email: Joi.string().email().trim().required().valid(),
                        //error(()=> {return Error('Invalid Email')}),
                        password : Joi.string().required(),
                        token:Joi.string().optional().allow(null)
                    },
                    failAction: async (req, h,err) => {
                        return UniversalFunctions.updateFailureError(err, req);
                    },
                    validator: Joi
                },
               
            }
        },

        {
        method: "POST",
        path: "/vendor/addgallery",
        handler: vendorController.addImage,
        options: {
        tags: ["api", "Vendor"],
        notes: "Add Images Api",
        description: "Add Images Api",
        auth: {strategy:"jwt", scope:["vendor"]},
        validate: {
            headers: Joi.object(UniversalFunctions.headers()).options({
                allowUnknown: true
            }),
            options: {
                abortEarly: false
            },
            payload: {
                id:joi.number(),
                type:joi.string().valid('event','activity','club','restaurant','shops'),
                eventgalleries:joi.array().items(joi.number()),
            },
            validator: joi,
        },
        },
        },

        {
            method: "POST",
            path: "/vendor/logout",
            handler: vendorController.vendorlogOut,
            options: {
                tags: ["api","Vendor"],
                notes: "vendor logout",
                description: "Logout vendor",
                auth: {strategy:"jwt", scope:["vendor"]},
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
                
            }
        },

        {
            method: "POST",
            path: "/vendor/activityAvailablity",
            handler: vendorController.activityAvailability,
            options: {
              tags: ["api", "Vendor"],
              notes: "Post language to the server",
              description: "Post language to the server",
              auth: false,
              validate: {
                options: {
                  abortEarly: false,
                  allowUnknown:true
                },
                payload: {
                type:joi.string().valid('activity','club','shops','restaurant'),
                 id: joi.number(),
                 Availability: joi.array().items(
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
                },
                validator: joi,
              },
            },
          },

          {
            method: "GET",
            path: "/vendor/businessbyId/{id}",
            handler: vendorController.getBusinessById,
            options: {
              tags: ["api", "Vendor"],
              notes: "Detail Page Api",
              description: "Detail Page Api",
              auth: {strategy:"jwt", scope: ["vendor"]},
              validate: {
                options: {
                  abortEarly: false,
                },
                headers: Joi.object(UniversalFunctions.headers()).options({
                            allowUnknown: true
                        }),
                params: {
                  id: joi.number(),
                },
                query:{
                  type:joi.string().valid('event','club','activity','shops','restaurant').required()
                },
                failAction: async (req, h, err) => {
                  return universalFunctions.updateFailureError(err, req);
                },
                validator: joi,
              },
            },
          },


          {
            method: "GET",
            path: "/vendor/businessListing",
            handler: vendorController.vendorBusinessListing,
            options: {
              tags: ["api", "Vendor"],
              notes: "Listing Api",
              description: "Listing Api",
              auth: {strategy:"jwt", scope: ["vendor"]},
              validate: {
                options: {
                  abortEarly: false,
                },
                headers: Joi.object(UniversalFunctions.headers()).options({
                            allowUnknown: true
                        }),
                query:{
                  type:joi.string().valid('event','club','activity','shops','restaurant').required(),
                  id:joi.number(),
                  status:joi.number(),
                  active:joi.boolean(),
                  page:joi.number(),
                  title:joi.string()
                },
                failAction: async (req, h, err) => {
                  return universalFunctions.updateFailureError(err, req);
                },
                validator: joi,
              },
            },
          },

          {
            method: "GET",
            path: "/vendor/gallerybyId",
            handler: vendorController.vendorgetImageById,
            options: {
              tags: ["api", "Vendor"],
              notes: "Listing Api",
              description: "Listing Api",
              auth: {strategy:"jwt", scope: ["vendor"]},
              validate: {
                options: {
                  abortEarly: false,
                },
               headers: Joi.object(UniversalFunctions.headers()).options({
                            allowUnknown: true
                        }), 
                query:{
                  type:joi.string().valid('event','club','activity','shops','restaurant').required(),
                  id:joi.number().required()
                },
                failAction: async (req, h, err) => {
                  return universalFunctions.updateFailureError(err, req);
                },
                validator: joi,
              },
            },
          },


          {
            method: "GET",
            path: "/vendor/activityavailabilitybyId",
            handler: vendorController.getactivityavailabilitybyId,
            options: {
              tags: ["api", "Vendor"],
              notes: "Listing Api",
              description: "Listing Api",
              auth: {strategy:"jwt", scope: ["vendor"]},
              validate: {
                options: {
                  abortEarly: false,
                },
                 headers: Joi.object(UniversalFunctions.headers()).options({
                            allowUnknown: true
                        }), 
                query:{
                  id:joi.number().required(),
                  type:joi.string().valid('activity','club','shops','restaurant'),
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
            path: "/vendor/deleteBusiness",
            handler: vendorController.deleteBusiness,
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
                query:{
                  id:joi.number().required(),
                  type:joi.string().valid('event','club','activity','shops','restaurant').required(),
                },
                failAction: async (req, h, err) => {
                  return universalFunctions.updateFailureError(err, req);
                },
                validator: joi,
              },
            },
          },
    

          {
            method: "GET",
            path: "/vendor/getBooking",
            handler: vendorController.getBooking,
            options: {
              tags: ["api","Vendor"],
              notes: "Get booking list",
              description: "booking Listing",
              auth: {strategy:"jwt", scope: ["vendor"]},
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
                  id:Joi.number().optional().allow("",null),
                  page:Joi.number(),
                  status:joi.string().valid('cancelled','confirmed','delivered'),
                  isBooking:joi.boolean().optional(),
                  /*  id:Joi.number().optional().allow("", null), */
                  userName:Joi.string().optional().allow("", null),
                  mobile:Joi.string().optional().allow("", null),
                    title:Joi.string().optional().allow("", null),
                  /* paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null), */
                  fromDate:Joi.date().iso().optional().allow("", null),
                  toDate:Joi.date().iso().optional().allow("", null), 
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
            path: "/vendor/getOrder",
            handler: vendorController.getOrder,
            options: {
              tags: ["api","Vendor"],
              notes: "Get Order list",
              description: "Order Listing",
              auth: {strategy:"jwt", scope: ["vendor"]},
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
                  /* id:Joi.number().optional().allow("", null), */
                  /* status:Joi.string().valid('pending','cancelled','success').optional().allow("", null), */
 /*                  userName:Joi.string().optional().allow("", null),
                  mobile:Joi.string().optional().allow("", null),
                    title:Joi.string().optional().allow("", null),
                  paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
                  fromDate:Joi.date().iso().optional().allow("", null),
                  toDate:Joi.date().iso().optional().allow("", null), */
                },
                failAction: async (req, h, err) => {
                  return UniversalFunctions.updateFailureError(err, req);
                },
                validator: Joi
              },
          /*     pre: [{ method: vendorController.prefunction }] */
            }
          },

          {
            method : "GET",
              path : "/vendor/getorderbyId",
              handler : vendorController.getOrderById,
              options: {
                tags: ["api", "Vendor"],
                notes: "Get restaurantOrder Api",
                description: "Get restaurantOrder Api",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  options: {
                    abortEarly: false,
                    allowUnknown:true
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

            {
              method : "GET",
                path : "/vendor/getbookingbyId",
                handler : vendorController.getBookingById,
                options: {
                  tags: ["api", "Vendor"],
                  notes: "Get booking by id Api",
                  description: "Get booking by id Api",
                  auth: {strategy:"jwt", scope: ["vendor"]},
                  validate: {
                    options: {
                      abortEarly: false,
                      allowUnknown:true
                    },
                    headers: Joi.object(UniversalFunctions.headers()).options({
                          allowUnknown: true
                        }),
                        query:{
                          id:Joi.number(),
                          type:Joi.string().valid('event','club','activity','shops','restaurant').required(),
                        },
                    failAction: async (req, h, err) => {
                      return universalFunctions.updateFailureError(err, req);
                    },
                    validator: joi
                  }
                }
              },
          
            {
              method: "GET",
              path: "/vendor/getProfile",
              handler: vendorController.getvendorProfile,
              options: {
                  tags: ["api","Vendor"],
                  notes: "vendor login",
                  description: "vendor login",
                  auth: {strategy:"jwt", scope: ["vendor"]},
                  validate: {
                      options: {
                          abortEarly: false
                      },
                      headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                      }),
                      failAction: async (req, h,err) => {
                          return UniversalFunctions.updateFailureError(err, req);
                      },
                      validator: Joi
                  },
                 
              }
          },

          {
            method : "POST",
              path : "/vendor/changebusinessStatus",
              handler : vendorController.businessStatus,
              options: {
                tags: ["api", "Vendor"],
                notes: "Business active inactive Api",
                description: "Business active inactive Api",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                      }),
                      payload:{
                        active:Joi.boolean().required(),
                        id:Joi.number(),
                        type:Joi.string().valid('event','club','activity','shops','restaurant').required(),
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
                path : "/vendor/changeorderStatus",
                handler : vendorController.restaurantorderStatus,
                options: {
                  tags: ["api", "Vendor"],
                  notes: "restuarnt status order Api",
                  description: "restuarnt status order Api",
                  auth: {strategy:"jwt", scope: ["vendor"]},
                  validate: {
                    options: {
                      abortEarly: false,
                      allowUnknown:true
                    },
                    headers: Joi.object(UniversalFunctions.headers()).options({
                          allowUnknown: true
                        }),
                        payload:{
                          type:Joi.string().valid('restaurant','shops','club'),
                         status:Joi.string().valid('cancelled','confirmed','delivered').required(),
                         id:Joi.number().required(),
                        },
                    failAction: async (req, h, err) => {
                      return universalFunctions.updateFailureError(err, req);
                    },
                    validator: joi
                  }
                }
              },
    
              {
                method: "GET",
                path: "/vendor/filterBusiness",
                handler: vendorController.vendorallBusiness,
                options: {
                  tags: ["api", "Vendor"],
                  notes: "Detail Page Api",
                  description: "Detail Page Api",
                  auth: {strategy:"jwt", scope: ["vendor"]},
                  validate: {
                    options: {
                      abortEarly: false,
                    },
                    headers: Joi.object(UniversalFunctions.headers()).options({
                                allowUnknown: true
                            }),
                    failAction: async (req, h, err) => {
                      return universalFunctions.updateFailureError(err, req);
                    },
                    validator: joi,
                  },
                },
              },


              {
                method: "POST",
                path: "/vendor/updateProfile",
                handler: vendorController.vendorupdateProfile,
                options: {
                    tags: ["api","Vendor"],
                    notes: " update vendor profile ",
                    description: " update vendor profile",
                    auth: {strategy:"jwt", scope: ["vendor"]},
                    validate: {
                      options: {
                        abortEarly: false,
                        allowUnknown:true
                      },
                      headers: Joi.object(UniversalFunctions.headers()).options({
                                  allowUnknown: true
                              }),
                        payload: {
                            mobile:joi.string(),
                            countryCode:joi.string(),
                            country:joi.string(),
                            firstName : joi.string().allow("").optional(),
                            lastName : joi.string().allow("").optional(),
                            profileImage_id : joi.number().optional(),
                            description:joi.string()
                        },
                        failAction: async (req, h, err) => {
                            return UniversalFunctions.updateFailureError(err, req);
                        },
                        validator: joi
                    },
                   
                }
            },


            {
              method: "POST",
              path: "/vendor/changePassword",
              handler : vendorController.vendorChangePassword,
              options: {
                tags: ["api","Vendor"],
                notes: "Change Password",
                description: "Change Password",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
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
            
              }
            },

            {
              method: "GET",
              path: "/vendor/getbookingHistory",
              handler: vendorController.vendorBookingHistory,
              options: {
                tags: ["api","Vendor"],
                notes: "Get booking list",
                description: "booking Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
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
                    id:Joi.number().required(),
                    page:Joi.number(),
                   /*  status:joi.string().valid('cancelled','confirmed','delivered'),
                    isBooking:joi.boolean().optional() */
                    /* id:Joi.number().optional().allow("", null),
                    userName:Joi.string().optional().allow("", null),
                    mobile:Joi.string().optional().allow("", null),
                      title:Joi.string().optional().allow("", null),
                    paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
                    fromDate:Joi.date().iso().optional().allow("", null),
                    toDate:Joi.date().iso().optional().allow("", null), */
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
              path: "/vendor/getDashboard",
              handler: vendorController.vendorTotalEarning,
              options: {
                tags: ["api","Vendor"],
                notes: "Get booking list",
                description: "booking Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  query: {
                   /* type:Joi.string().valid('event','activity','restaurant').required(),  */
                   day:Joi.number().valid(1,7,30,365).default(1).required()
                  /*   id:Joi.number().required(),
                    page:Joi.number(), */
                   /*  status:joi.string().valid('cancelled','confirmed','delivered'),
                    isBooking:joi.boolean().optional() */
                    /* id:Joi.number().optional().allow("", null),
                    userName:Joi.string().optional().allow("", null),
                    mobile:Joi.string().optional().allow("", null),
                      title:Joi.string().optional().allow("", null),
                    paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
                    fromDate:Joi.date().iso().optional().allow("", null),
                    toDate:Joi.date().iso().optional().allow("", null), */
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
              path: "/vendor/getallTransaction",
              handler: vendorController.vendorTransaction,
              options: {
                tags: ["api","Vendor"],
                notes: "Get transaction list",
                description: "transaction Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  query: {
                    type:Joi.string().valid('event','activity','restaurant').optional(), 
                    page:Joi.number(),
                    day:Joi.number().valid(1,7,30,365).default(1).optional()
                   /*  status:joi.string().valid('cancelled','confirmed','delivered'),
                    isBooking:joi.boolean().optional() */
                    /* id:Joi.number().optional().allow("", null),
                    userName:Joi.string().optional().allow("", null),
                    mobile:Joi.string().optional().allow("", null),
                      title:Joi.string().optional().allow("", null),
                    paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
                    fromDate:Joi.date().iso().optional().allow("", null),
                    toDate:Joi.date().iso().optional().allow("", null), */
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
              path: "/vendor/getallRating",
              handler: vendorController.vendorGetRatingReview,
              options: {
                tags: ["api","Vendor"],
                notes: "Get rating list",
                description: "rating Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  query: {
                    type:Joi.string().valid('event','shops','club','activity','restaurant').required(), 
                    page:Joi.number(),
                   /*  status:joi.string().valid('cancelled','confirmed','delivered'),
                    isBooking:joi.boolean().optional() */
                    /* id:Joi.number().optional().allow("", null),
                    userName:Joi.string().optional().allow("", null),
                    mobile:Joi.string().optional().allow("", null),
                      title:Joi.string().optional().allow("", null),
                    paymentMode:Joi.string().valid('CARD','PAYPAL','APPLEPAY').optional().allow("", null),
                    fromDate:Joi.date().iso().optional().allow("", null),
                    toDate:Joi.date().iso().optional().allow("", null), */
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
              path: "/vendor/manageRating",
              handler: vendorController.vendormanageRating,
              options: {
                tags: ["api","Vendor"],
                notes: "Get rating list",
                description: "rating Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                    status:Joi.number().valid(0,1).required(),
                    type:Joi.string().valid('event','shops','club','activity','restaurant').required(), 
                    id:Joi.number().required()
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
              path: "/vendor/getsubscriptionPlan",
              handler: vendorController.vendorGetSubscriptionPlan,
              options: {
                tags: ["api","Vendor"],
                notes: "Get plans list",
                description: "plans Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
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
              path: "/vendor/getamenitiesAttachment",
              handler: vendorController.vendorGetAmenitiesAttachment,
              options: {
                tags: ["api","Vendor"],
                notes: "Get images list",
                description: "images Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
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
              method: "POST",
              path: "/vendor/purchasingPlan",
              handler: vendorController.vendorPurchaseSubscription,
              options: {
                tags: ["api","Vendor"],
                notes: "purchasing plan",
                description: "purchasing plan",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                    cardId:Joi.number().optional(),
                    subscriptionPlan_id:Joi.number()
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
              path: "/vendor/forgetPassword",
              handler: vendorController.vendorForgetPassword,
              options: {
                tags: ["api","Vendor"],
                notes: "Forget Password",
                description: "Forget Password",
                auth: false,
                validate: {
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                    email: joi.string().email().trim().required().error(() => {
                      return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
                  }),
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
              path: "/vendor/verifyforgetpasswordOtp",
              handler: vendorController.vendorVerifyResetPasswordOtp,
              options: {
                tags: ["api","Vendor"],
                notes: "Reset Password",
                description: "Reset Password",
                auth: false,
                validate: {
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                   otp:Joi.number().required(),
                   email: joi.string().email().trim().required().error(() => {
                    return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
                }),
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
              path: "/vendor/resetPassword",
              handler: vendorController.vendorResetPassword,
              options: {
                tags: ["api","Vendor"],
                notes: "Reset Password",
                description: "Reset Password",
                auth: false,
                validate: {
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                   otp:Joi.number().required(),
                   newPassword:Joi.string().required()
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
              path: "/vendor/pendingorderCount",
              handler: vendorController.vendorPendingOrderCount,
              options: {
                tags: ["api","Vendor"],
                notes: "pending order count",
                description: "pending order count",
                auth: {strategy:"jwt", scope: ["vendor"]},
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
              path: "/vendor/pendingOrders",
              handler: vendorController.vendorBookingByType,
              options: {
                tags: ["api","Vendor"],
                notes: "pending order ",
                description: "pending order ",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  query:{
                    type:Joi.string().valid('club','shops','restaurant'),
                    page:Joi.number(),
                    isBooking:joi.boolean().optional().default(false),
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
              path: "/vendor/panelDashboard",
              handler: vendorController.vendorDashboardPanel,
              options: {
                tags: ["api","Vendor"],
                notes: "Get booking list",
                description: "booking Listing",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                  }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  query: {
                   day:Joi.number().valid(1,7,30,365).default(1).required()
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
              path: "/vendor/claimbusinessListing",
              handler: vendorController.vendorClaimBusiness,
              options: {
                tags: ["api", "Vendor"],
                notes: "Listing Api",
                description: "Listing Api",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  options: {
                    abortEarly: false,
                  },
                  headers: Joi.object(UniversalFunctions.headers()).options({
                              allowUnknown: true
                          }),
                  query:{
                    type:joi.string().valid('event','club','activity','shops','restaurant').required(),
                    /* id:joi.number(),
                    status:joi.number(),
                    active:joi.boolean(), */
                    page:joi.number(),
                    title:joi.string()
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
              path: "/vendor/claimBusiness",
              handler: vendorController.vendorClaim,
              options: {
                tags: ["api","Vendor"],
                notes: "Reset Password",
                description: "Reset Password",
                auth: {strategy:"jwt", scope: ["vendor"]},
                validate: {
                  options: {
                    abortEarly: false,
                  },
                  headers: Joi.object(UniversalFunctions.headers()).options({
                              allowUnknown: true
                          }),
                  options: {
                    abortEarly: false,
                    allowUnknown:true
                  },
                  payload:{
                   id:Joi.number().required(),
                   type:Joi.string().valid('event','club','activity','shops','restaurant').required(),
                   firstName:Joi.string().required(),
                   lastName:Joi.string().required(),
                   countryCode:Joi.string().required(),
                   email: Joi.string().email().trim().required().error(() => {
                    return { message: "EMAIL_IS_REQUIRED_AND_MUST_BE_A_VALID_EMAIL" };
                   }),
                   mobile:Joi.string(),
                   attachment_id:Joi.number().required()
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
                path : "/vendor/emailVerifcation",
                handler : vendorController.vendorEmailVerification,
                options: {
                  tags: ["api", "Vendor"],
                  notes: "Email verify Api",
                  description: "Email verify Api",
                  auth: false,
                  validate: {
                    options: {
                      abortEarly: false,
                      allowUnknown:true
                    },
                   /*  headers: Joi.object(UniversalFunctions.headers()).options({
                          allowUnknown: true
                        }), */
                        payload:{
                          userId:Joi.number().required()
                        },
                    failAction: async (req, h, err) => {
                      return universalFunctions.updateFailureError(err, req);
                    },
                    validator: joi
                  }
                }
              },
    
]