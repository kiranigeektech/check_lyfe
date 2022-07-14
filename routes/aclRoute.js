const joi = require("joi");
const aclController = require("../controllers/aclController");
module.exports = [
  {
    method: "GET",
    path: "/admin/getAllPermissions",
    handler: aclController.getAllPermissions,
    options: {
      tags: ["api", "acl"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
    }
    },
  },
  {
    method: "POST",
    path: "/admin/addAclRole",
    handler: aclController.addAclRole,
    options: {
      tags: ["api", "blog"],
      notes: "Add Category Api",
      description: "Add Acl role Api",
      auth: {strategy:"jwt", scope: ["admin"]},
       validate: {
        options: {
              abortEarly: false,
            },
        headers: Joi.object(UniversalFunctions.headers()).options({
              allowUnknown: true
        }),
        payload:{
            id: Joi.optional().allow('',null),
            name: Joi.string().required().error(() => {
                return { message: "Name is required" };
            }),
            permission: Joi.array().items(Joi.number())
        },
        validator: joi,
      },
    },
  },
  {
    method: "GET",
    path: "/admin/getRoleListing",
    handler: aclController.getRoleListing,
    options: {
      tags: ["api", "acl"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
    }
    },
  },
  {
    method: "GET",
    path: "/admin/getRoleDetailById",
    handler: aclController.getRoleDetailById,
    options: {
      tags: ["api", "acl"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
        },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
       query: {
        roleId : Joi.number().required()
        },
        validator: joi,
    }
    },
  },
  {
    method: "POST",
    path: "/admin/addStaff",
    handler: aclController.addStaff,
    options: {
      tags: ["api", "blog"],
      notes: "Add staff Api",
      description: "Add Acl role Api",
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
            id: Joi.number().optional(),
            contactNumber: Joi.string().required(),
            password: Joi.string().optional().allow('',null),
            address: Joi.string().required(),
            email: Joi.string().required(),
            name: Joi.string().required(),
            role: Joi.array().items(Joi.number()),
            profileImageId: Joi.number().default(null).allow('',null),
        },
        validator: joi,
      },
    },
  },
  {
    method: "GET",
    path: "/admin/getStaffListing",
    handler: aclController.getStaffListing,
    options: {
      tags: ["api", "acl"],
      notes: "Get Category Api",
      description: "Get Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
    }
    },
  },
  {
    method: "GET",
    path: "/admin/getStaffDetailById",
    handler: aclController.getStaffDetailById,
    options: {
      tags: ["api", "acl"],
      notes: "Get staff Api",
      description: "Get staff Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
        },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
       query: {
        staffId : Joi.number().required()
        },
        validator: joi,
    }
    },
  },

   /* 


  {
    method: "DELETE",
    path: "/admin/deleteblogcategory",
    handler: blogController.deleteCategory,
    options: {
      tags: ["api", "blog"],
      notes: "Delete Category Api",
      description: "Delete Category Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
       query: {
          id: joi
            .number()
            .required()
            .error(() => {
              return { message: "ID is required" };
            }),
        },
        validator: joi,
      },
    },
  },

  {
    method: "POST",
    path: "/admin/manageBlog",
    handler: blogController.addBlog,
    options: {
      tags: ["api", "blog"],
      notes: "Add Blog Api",
      description: "Add Blog Api",
      auth: {strategy:"jwt", scope: ["admin"]},
       validate: {
        options: {
              abortEarly: false,
            },
        headers: Joi.object(UniversalFunctions.headers()).options({
              allowUnknown: true
        }),
        payload: {
         title:joi.string().required(),
         id:joi.number().optional(),
         description:joi.string().required(),
         category_id:joi.number().required(),
         content:joi.string().required(),
         attachment_id:joi.number().required(),
        },
        validator: joi,
      },
    },
  },

  {
    method: "POST",
    path: "/admin/updateBlogStatus",
    handler: blogController.updateStatus,
    options: {
      tags: ["api", "blog"],
      notes: "Add status Api",
      description: "Add status Api",
      auth: {strategy:"jwt", scope: ["admin"]},
       validate: {
        options: {
              abortEarly: false,
            },
        headers: Joi.object(UniversalFunctions.headers()).options({
              allowUnknown: true
        }),
        payload: {
          id:joi.number().required(),
          status: joi.number().required()
        },
        validator: joi,
      },
    },
  },

  {
    method: "GET",
    path: "/admin/getblog",
    handler: blogController.getBlog,
    options: {
      tags: ["api", "blog"],
      notes: "Get blog Api",
      description: "Get blog Api",
      auth: {strategy:"jwt", scope: ["admin"]},
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
       validator:joi
    }
    },
  },

  {
    method: "GET",
    path: "/admin/getblogcategorybyId",
    handler: blogController.getblogcategorybyId,
    options: {
      tags: ["api", "blog"],
      notes: "Get blog category by id Api",
      description: "Get blog category by id Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
       query:{
           id:joi.number().required(),
       },
       validator:joi
    }
    },
  },

  {
    method: "GET",
    path: "/admin/getblogbyId",
    handler: blogController.getblogbyId,
    options: {
      tags: ["api", "blog"],
      notes: "Get blog by id Api",
      description: "Get blog by id Api",
      auth: {strategy:"jwt", scope: ["admin"]},
      validate: {
       options: {
             abortEarly: false,
           },
       headers: Joi.object(UniversalFunctions.headers()).options({
             allowUnknown: true
       }),
       query:{
           id:joi.number().required(),
       },
       validator:joi
    }
    },
  },

  {
    method: "DELETE",
    path: "/admin/deleteblog",
    handler: blogController.deleteBlog,
    options: {
      tags: ["api", "blog"],
      notes: "Delete  Api",
      description: "Delete  Api",
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
          id: joi
            .number()
            .required()
            .error(() => {
              return { message: "ID is required" };
            }),
        },
        validator: joi,
      },
    },
  },
  */

]