const db = require("../models/index");
const constant = require("../config/constant");
const UniversalFunctions = require("../universalFunctions/lib");

class admin {
  setSeeders = async (req,h) => {
    try {

        await db.roles.bulkCreate([
            {
                id : 1,
                role : 'admin',
                status : 1,
                createdAt : new Date(),
                updatedAt : new Date()

            }, 
            {
                id : 2,
                role : 'user',
                status : 1,
                createdAt : new Date(),
                updatedAt : new Date()
            }
        ])

      await db.users.create({
        email: "admin@admin.com",
        password: UniversalFunctions.encrypt("admin@admin"),
        role_id: constant.ROLES.ADMIN_ROLE,
        status: constant.STATUS.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await db.userProfiles.create({
        user_id:1,
        firstName: "System",
        lastName: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return h
        .response({
          message: req.i18n.__("SUCCESSFULLY_ADDED"),
        })
        .code(200);
    } catch (e) {
      console.log("@@@@", e);
    }
  };
}

module.exports = new admin();
