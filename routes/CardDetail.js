const joi = require("joi");
const cardDetailController = require("../controllers/CardDetail");
module.exports=[

    {
        method: "POST",
        path: "/savedCard",
        handler: cardDetailController.addCard,
        options: {
          tags: ["api", "UserCard"],
          notes: "Add Card Api",
          description: "Add Card Api",
          auth: {strategy:"jwt", scope: ["user", "admin",'vendor']},
          validate: {
            options: {
              abortEarly: false,
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                        allowUnknown: true
                    }),
            payload: {
                token:joi.string().required(),
            },
            validator: joi,
          },
        },
      },


      {
        method : "GET",
		path : "/paymentOptions",
		handler : cardDetailController.getCard,
		options: {
			tags: ["api", "UserCard"],
			notes: "Get Card Api",
			description: "Get Card Api",
			auth: {strategy:"jwt", scope: ["user", "admin",'vendor']},
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
				validator: joi
			}
		}
	},

  {
    method: "DELETE",
    path: "/deleteCard",
    handler: cardDetailController.deleteCard,
    options: {
      tags: ["api", "UserCard"],
      notes: "Delete Card Api",
      description: "Delete Card Api",
      auth: {strategy:"jwt", scope: ["user", "admin",'vendor']},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                }),
        query: {
            cardId:joi.number().required(),
        },
        validator: joi,
      },
    },
  }


]