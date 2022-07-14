const joi = require("joi");
const homeController = require("../controllers/businessCategory");

module.exports = [
  {
    method: "GET",
    path: "/user/dashboard",
    handler: homeController.getDashboard,
    options: {
      tags: ["api", "HomePage"],
      notes: "Get Dashboard Api",
      description: "Get Dashboard Api",
      auth: {strategy:"jwt", scope: ["user", "admin","vendor"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        query:{
          lat:joi.number().min(-90).max(90).required(),
          long:joi.number().min(-180).max(180).required(),
        },
        failAction: async (req, h, err) => {
          console.log(req.query.lat,req.query.long)
          return UniversalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
     
    },
  },

  {
    method: "GET",
    path: "/user/category",
    handler: homeController.getCategoryPage,
    options: {
      tags: ["api", "HomePage"],
      notes: "Get CategoryPage Api",
      description: "Get CategoryPage Api",
      auth: {strategy:"jwt", scope: ["user", "admin","vendor"],mode:"optional"},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
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
    method: "GET",
    path: "/generalInfo",
    handler: homeController.getGeneralInfo,
    options: {
      tags: ["api", "HomePage"],
      notes: "Get general Api",
      description: "Get general Api",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        query:{
          appVersion:joi.number().optional(),
        },
        validator: joi,
      },
     
    },
  },

  {
    method: "GET",
    path: "/vendor/generalInfo",
    handler: homeController.getVendorGeneral,
    options: {
      tags: ["api", "Vendor"],
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
        query:{
          appVersion:joi.number().optional(),
        },
        validator: joi,
      },
     
    },
  },

  {
    method: "POST",
    path: "/admin/usergeneralInfo",
    handler: homeController.updateGeneralInfo,
    options: {
      tags: ["api", "admin"],
      notes: "Get general Api",
      description: "Get general Api",
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
          id:joi.number().optional(),
          iosappVersion:joi.number(),
          androidappVersion:joi.number(),
          iosappLink:joi.string(),
          androidappLink:joi.string(),
          privacyPolicy:joi.string(),
          aboutUs:joi.string(),
          termUrl:joi.string(),
          supportEmail:joi.string(),
          supportNumber:joi.string(),
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
    path: "/admin/vendorgeneralInfo",
    handler: homeController.updateVendorGeneralInfo,
    options: {
      tags: ["api", "admin"],
      notes: "Get general Api",
      description: "Get general Api",
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
          id:joi.number().optional(),
          iosappVersion:joi.number(),
          androidappVersion:joi.number(),
          iosappLink:joi.string(),
          androidappLink:joi.string(),
          privacyPolicy:joi.string(),
          aboutUs:joi.string(),
          termUrl:joi.string(),
          supportEmail:joi.string(),
          supportNumber:joi.string(),
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
     
    },
  },


  {
    method: "PUT",
    path: "/fcmToken",
    handler: homeController.updateFCM,
    options: {
      tags: ["api", "HomePage"],
      notes: "update fcm Api",
      description: "update fcm Api",
      auth: {strategy:"jwt", scope: ["user",'vendor']},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload:{
        fcmToken:joi.string().required(),
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
    path: "/globalSearch",
    handler: homeController.globalSearch,
    options: {
      tags: ["api", "HomePage"],
      notes: "Get global search Api",
      description: "Get global search Api",
      auth: {strategy:"jwt", scope: ["user"],mode:'optional'},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers(true)).options({
					allowUnknown: true
				}),
        query:{
          search:joi.string(),
          page:joi.number(),
          types:joi.any()
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/notifications",
    handler: homeController.getNotification,
    options: {
      tags: ["api", "HomePage"],
      notes: "Get global search Api",
      description: "Get global search Api",
      auth: {strategy:"jwt", scope: ["user", "admin", "vendor"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
         query:{
          page:joi.number(),
        }, 
        validator: joi,
      },
     
    },
  },

  {
    method: "PUT",
    path: "/readNotification",
    handler: homeController.readNotification,
    options: {
      tags: ["api", "HomePage"],
      notes: "update fcm Api",
      description: "update fcm Api",
      auth: {strategy:"jwt", scope: ["user","admin", "vendor"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
					allowUnknown: true
				}),
        payload:{
        id:joi.number().required(),
        },
        failAction: async (req, h, err) => {
          return universalFunctions.updateFailureError(err, req);
        },
        validator: joi,
      },
     
    },
  },
]