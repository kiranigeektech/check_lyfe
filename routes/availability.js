const availableController = require("../controllers/availability");
const joi = require("joi");

module.exports = [
  {
    method: "POST",
    path: "/vendor/eventAvailablity",
    handler: availableController.addavailability,
    options: {
      tags: ["api", "Vendor"],
      notes: "Post language to the server",
      description: "Post language to the server",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          event_id: joi.number(),
          capacity:joi.number().optional(),
          availabilities: joi.array().items(
            joi.object({
                startDate: joi.date().iso(),
                endDate: joi.date().iso(),
                startTime : joi.string().regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
                endTime : joi.string().regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/) 
            }),
            
          ),
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/vendor/geteventavailablitybyId",
    handler: availableController.getavailability,
    options: {
      tags: ["api", "Vendor"],
      notes: "get event availability by id",
      description: "Post language ",
      auth: {strategy:"jwt", scope: ["vendor"]},
      validate: {
        options: {
          abortEarly: false,
        },
        headers: Joi.object(UniversalFunctions.headers()).options({
                    allowUnknown: true
                }),
                query: {
                  event_id: joi.number().required(),
                },
                validator: joi,
      },
    },
  },
  {
    method: "PUT",
    path: "/editAvailablity/{id}",
    handler: availableController.editavailability,
    options: {
      tags: ["api", "EventAvailable"],
      notes: "edit availability ",
      description: "edit availability ",
      auth: false,
      validate: {
        options: {
          abortEarly: false,
        },
        payload: {
          startDate: joi.date().iso(),
          endDate: joi.date().iso(),
          startTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
          endTime: joi
            .string()
            .regex(/\b((1[0-2]|0?[0-9]):([0-5][0-9]) ([AaPp][Mm]))/),
        },
        params: {
          id: joi.number(),
        },
        validator: joi,
      },
    },
  },
];
