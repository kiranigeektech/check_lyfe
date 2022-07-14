const joi = require("joi");
const restaurantReservationController = require("../controllers/restaurantReservation");

module.exports = [
  {
    method: "POST",
    path: "/reserveRestaurant",
    handler: restaurantReservationController.addrestaurantReservation,
    options: {
      tags: ["api", "RestaurantReservation"],
      notes: "Restaurant Reservation Api",
      description: "Restaurant  Reservation Api",
      auth: { strategy: "jwt", scope: ["user", "admin"] },
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true,
        }),
        payload: {
          id: joi.number().required(),
          startDate: joi.date().iso().required(),
          startTime: joi.string().required(),
          endTime: joi.string().required(),
          preferTime: joi.string().required(),
          noOfPerson: joi.number().required(),
          specialRequest:joi.string().optional().allow('',null),
          firstName:joi.string().required(),
          lastName:joi.string().required(),
          email:joi.string().required(),
          phoneNumber:joi.string().required(),
          countryCode:joi.string()
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/restaurantReservation/{id}",
    handler: restaurantReservationController.getReservationDetail,
    options: {
      tags: ["api", "RestaurantReservation"],
      notes: "Get Restaurant Reservation Api",
      description: "Get Restaurant Reservation Api",
      auth: {strategy:"jwt", scope: ["user", "admin"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
          allowUnknown: true
        }),
        params:{
         id:joi.number().required()
        },
        validator: joi,
      }
    },
  },
];
