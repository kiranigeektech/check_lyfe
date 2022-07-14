"use strict";
const UserController = require("../controllers/user");
const Joi = require("joi");

module.exports = [

{
    method: "POST",
    path: "/addAddress",
    handler:UserController.addAddress,
    options: {
        tags: ["api", "userAddress"],
        notes: "Add userAddress ",
        description: "Add userAddress ",
        auth: {strategy:"jwt", scope: ["user", "admin"]},
        validate: {
            options: {
                abortEarly: false
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                allowUnknown: true
            }),
            payload: {
                id:Joi.number().optional(),
                userLatitude:Joi.number().required(),
                userLongitude:Joi.number().required(),
                address:Joi.string().required(),
                type:Joi.string().required(),
                other:Joi.string().optional(),
                houseNo:Joi.string().required(),
                buildingName:Joi.string().required(),
                pinCode:Joi.number().optional(),
                state:Joi.string().optional(),
                city:Joi.string().optional(),
        },
        validator: Joi
    }
}
},
{
    method: "GET",
    path: "/allAddress",
    handler:UserController.getAddress,
    options: {
        tags: ["api", "userAddress"],
        notes: "get userAddress ",
        description: "get userAddress ",
        auth: {strategy:"jwt", scope: ["user", "admin"]},
        validate: {
            options: {
                abortEarly: false
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                allowUnknown: true
            }),
            
        validator: Joi
    }
}
},

{
    method: "DELETE",
    path: "/deleteAddress",
    handler:UserController.deleteAddress,
    options: {
        tags: ["api", "userAddress"],
        notes: "delete userAddress ",
        description: "delete userAddress ",
        auth: {strategy:"jwt", scope: ["user", "admin"]},
        validate: {
            options: {
                abortEarly: false
            },
            headers: Joi.object(UniversalFunctions.headers()).options({
                allowUnknown: true
            }),
            query:{
                id:Joi.number().required()
            },
        validator: Joi
    }
}
}

]