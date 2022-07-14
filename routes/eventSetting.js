const joi = require("joi");
const eventSettingController = require("../controllers/eventSetting");
module.exports=[

    {
        method: "POST",
        path: "/admin/manageSetting",
        handler: eventSettingController.addSetting,
        options: {
          tags: ["api", "admin"],
          notes: "Add Setting Api",
          description: "Add Setting Api",
          auth: {strategy:"jwt", scope: ["user", "admin"]},
          validate: {
            options: {
              abortEarly: false,
              allowUnknown:true
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                    }),
            payload: {
                serviceTax:joi.number(),
                adminCommission:joi.number(),
            },
            validator: joi,
          },
        },
      },

      {
        method: "GET",
        path: "/admin/getSetting",
        handler: eventSettingController.getSetting,
        options: {
          tags: ["api", "admin"],
          notes: "get Setting Api",
          description: "get Setting Api",
          auth: {strategy:"jwt", scope: ["user", "admin"]},
          validate: {
            options: {
              abortEarly: false,
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                    }),
            validator: joi,
          },
        },
      },
]