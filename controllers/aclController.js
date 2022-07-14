const db = require("../models/index");
const constant = require('../config/constant');
var UniversalFunctions = require("../universalFunctions/lib");
const { QueryTypes } = require("sequelize");
const role = require("../models/role");
const sendEmailReceipt = require("../notifications/email")
const emailContent = require("../templates/staffadd")
const emailTemplate=require('../templates/header')
const handlebars = require("handlebars");



class acl {
    getAllPermissions = async (request,h) => {
    try {
      const permissions = await db.tbPermissions.findAll();
      return h.response({
        responseData:{
            permissions
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
    };

  addAclRole = async (request,h) => {
    try {
        let payload = request.payload;
        if(payload.id){
            let role = await Models.roles.update(
                {
                  role: payload.name,
                },
                {
                  where: { id: payload.id },
                }
            );
            await db.tbRolePermissionMap.destroy({
                where:{roleId:payload.id}
            })

            let roles = []
            if (payload.permission && payload.permission.length > 0) {
                for (let i = 0; i < payload.permission.length; i++) {
                    if(payload.permission[i]){
                        roles.push({
                            roleId: payload.id, 
                            permission: payload.permission[i]
                        })
                    }
                }
                await db.tbRolePermissionMap.bulkCreate(roles);
            }

            return h.response({
                message:'updated Successfuly'
            })
        }
        else{
            if(!payload.permission){
                return Boom.badRequest(req.i18n.__("PLEASE_SELECT_PERMISSION"));
            }
            let role = await db.roles.create({
                role: payload.name,
                status: 1,
            });

            let roles = [] 
            if (payload.permission && payload.permission.length > 0) {
                for (let i = 0; i < payload.permission.length; i++) {
                    if(payload.permission[i]){
                        roles.push({
                            roleId: role.dataValues.id, 
                            permission: payload.permission[i]
                        })
                    }
                }
                console.log(roles)
                await db.tbRolePermissionMap.bulkCreate(roles);
            }

            return h.response({
                message:'created Successfuly'
            })
        }
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  getRoleListing = async (request,h) => {
    try {
      const data =  await Models.sequelize.query(`
        SELECT roles.id as roleId, roles.role as name, group_concat(tbPermissions.name SEPARATOR ', ') as permission
        FROM roles
        LEFT JOIN tbRolePermissionMaps ON roles.id = tbRolePermissionMaps.roleId
        LEFT JOIN tbPermissions ON tbPermissions.id = tbRolePermissionMaps.permission
        WHERE roles.id > 3 AND roles.isDeleted=0
        group by roles.id
      `)
      console.log(data)
      return h.response({
        responseData:{
            data: data[0]
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  getRoleDetailById = async (request,h) => {
    try {
        var data = await db.roles.findOne({
            attributes:["id", ["role","name"]],
            include: [
                {
                  required: false,
                  model: Models.tbRolePermissionMap,
                  attributes: ["permission"],
                },
            ],
            where:{id:request.query.roleId}
        })
        if(data){
            let permissions = [];
            if(data.dataValues.tbRolePermissionMaps.length){
                for(let i=0; i<data.dataValues.tbRolePermissionMaps.length; i++){
                    if(data.dataValues.tbRolePermissionMaps[i]){
                        permissions.push(data.dataValues.tbRolePermissionMaps[i].permission)
                    }
                }
            }
            delete data.dataValues.tbRolePermissionMaps;
            data.dataValues.permission = permissions
        }
      return h.response({
        responseData:{
            data
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  addStaff = async (request,h) => {
    try {
        let payload = request.payload;
        let adminId = payload.id;

        let existEmail = 'SELECT id from users where email = ? '
        let existEmailParam = [payload.email]
        if (payload.id) {
            existEmail += ' and id <> ?'
            existEmailParam.push(payload.id)
        }
        var existCheck = await Models.sequelize.query(existEmail, {
            replacements : existEmailParam,
            type : QueryTypes.SELECT,
        })
        if (existCheck && existCheck.length > 0) {
            return Boom.badRequest(request.i18n.__("USER_ALLREADY_EXIST"));
        }

        if (payload.id) {
            await Models.users.update(
              {
                email: payload.email              
              },
              {
                where: { id: payload.id },
              }
            );
            await Models.userProfiles.update(
                {
                    firstName: payload.name,
                    profileImage_id: payload.profileImageId,
                    address: payload.address                
                },
                {
                  where: { user_id: payload.id },
                }
            );
            await db.adminRoles.destroy({
                where:{adminId:payload.id}
            })
        } else {
            let pass = payload.password ? payload.password : '123456' ;
            let staff = await db.users.create({
                email: payload.email,
                password: UniversalFunctions.encrypt(pass),
                role_id: constant.ROLES.ADMIN_ROLE,
                status: constant.STATUS.ACTIVE,
                mobile: payload.contactNumber,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            if(staff){
                await db.userProfiles.create({
                    user_id:staff.dataValues.id,
                    firstName: payload.name,
                    profileImage_id: payload.profileImageId,
                    address: payload.address,                
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
            }
            adminId = staff.dataValues.id;

            let data =  await Models.sequelize.query(`
            SELECT group_concat(roles.role SEPARATOR ', ') as roleName
            FROM roles
            WHERE roles.id IN (${payload.role})
            `)
            console.log(data)
            let rolesAccess;
            if(data && data.length){
              data = data[0]
              rolesAccess = data[0].roleName;
            }
            console.log({rolesAccess})
    
            //send email to staff
            let Contentdata={
              href:`https://admin.enjoyinglyfe.com/`,
              email: payload.email,
              password: payload.password,
              roles: rolesAccess
            }
            let completeHtml = handlebars.compile(emailContent.staffadd)(Contentdata) 
            let templateData={
              content:completeHtml
            }
            var htmlToSend = handlebars.compile(emailTemplate.header)(templateData)
            sendEmailReceipt.sendEmail(constant.EMAIL_FROM.FROM,payload.email,'Staff Added',htmlToSend)
        }

        let roles = [];
        if (payload.role && payload.role.length > 0) {
            for (let i = 0; i < payload.role.length; i++) {
                if(payload.role[i]){
                    roles.push({
                        roleId: payload.role[i],
                        adminId
                    })
                }
            }
            console.log(roles)
            await db.adminRoles.bulkCreate(roles);
        }

        return h.response({
            message:'added Successfuly'
        })

    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  getStaffListing = async (request,h) => {
    try {
      const data =  await Models.sequelize.query(`
        SELECT adminRoles.adminId as id, users.mobile as contactNumber, users.status, userProfiles.firstName as name, group_concat(roles.role SEPARATOR ', ') as roleName
        FROM adminRoles
        LEFT JOIN roles ON roles.id = adminRoles.roleId
        LEFT JOIN users ON users.id = adminRoles.adminId
        LEFT JOIN userProfiles ON userProfiles.user_id = adminRoles.adminId
        group by adminRoles.adminId
      `)
      return h.response({
        responseData:{
            data: data[0]
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  getStaffDetailById = async (request,h) => {
    try {
        let data =  await Models.sequelize.query(`
        SELECT adminRoles.adminId as id, users.mobile as contactNumber, users.status, users.email, userProfiles.firstName as name, userProfiles.address,
		(SELECT JSON_OBJECT(
            'id',attachments.id,
            'filePath',TRIM(CONCAT('${process.env.NODE_SERVER_API_HOST}/', attachments.filePath)),
            'thumbnailPath',TRIM(CONCAT('${process.env.NODE_SERVER_API_HOST}/', attachments.thumbnailPath))
        ) AS imageUrl
        FROM
            attachments
        WHERE
            attachments.id = userProfiles.profileImage_id) as profileImage
        FROM adminRoles
        LEFT JOIN users ON users.id = adminRoles.adminId
        LEFT JOIN userProfiles ON userProfiles.user_id = adminRoles.adminId
        where adminRoles.adminId=?
        group by adminRoles.adminId
      `,{
        replacements : [request.query.staffId],
        type : QueryTypes.SELECT,
        }
        )

        if(data && data.length){
            data =  data[0]
            let roles = await db.adminRoles.findAll({
                attributes:["roleId"],
                where:{adminId:request.query.staffId}
            })
            console.log(roles)
            let rolesIds = [];
            if(roles && roles.length){
                for(let i=0; i<roles.length; i++){
                    if(roles[i].dataValues.roleId){
                        rolesIds.push(roles[i].dataValues.roleId)
                    }
                }
            }
            data.role = rolesIds;
        }

      return h.response({
        responseData:{
            data
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

//   deleteCategory = async (request,h) => {
//     try {
//       var deleteB = await db.blogCategory.update({
//         isDeleted:true,
//       },{
//           where:{id:request.query.id}
//       })
//       console.log('SSSSSS',deleteB)
    
//       return h.response({
//         responseData:{
//           message:'Deleted Successfully'
//         }
//       });
    
//     } catch (e) {
//       console.log("@@delete@@@", e);
//     }
//   };

//   addBlog = async(request,h)=>{
//      try{
//          var data = request.payload
//          var date = new Date()
//          if(data.attachmentId=='' || data.attachmentId==0 && data.categoryId=='' || data.categorytId==0)
//          {
//              return h.response({message:'Enter All the feilds'})
//          }
//          if(data.id)
//          {
//             var blog = await db.blog.update({
//                 title:data.title,
//                 description:data.description,
//                 category_id:data.category_id,
//                 content:data.content,
//                 attachment_id:data.attachment_id,
//                 status:constant.BLOG_STATUS.PUBLISH,
//                 isDeleted:false
//             },{
//                 where:{id:data.id}
//             })  
//             if(data.title)
//             {
//                 data.title = data.title.replace(/^\s+|\s+$/g, ''); // trim
//                 data.title = data.title.toLowerCase();
//                 // remove accents, swap ñ for n, etc
//                 var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
//                 var to = "aaaaeeeeiiiioooouuuunc------";
//                 for (var i = 0, l = from.length; i < l; i++) {
//                   data.title = data.title.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
//                 }
//                 data.title = data.title.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
//                   .replace(/\s+/g, '-') // collapse whitespace and replace by -
//                   .replace(/-+/g, '-');

//                   var slugValue = (data.title + "-" + data.id)
//                   const slug = db.blog.update({
//                       Slug:slugValue
//                   },{
//                       where:{id:data.id}
//                   })
//             }

//             return h.response({
//                 message:'edit Successfully'
//             })

//          }
//          var blog = await db.blog.create({
//                 title:data.title,
//                 description:data.description,
//                 category_id:data.category_id,
//                 content:data.content,
//                 attachment_id:data.attachment_id,
//                 status:constant.BLOG_STATUS.PUBLISH,
//                 publishedDate:date,
//                 isDeleted:false
//             })  
//          if(blog)
//             {
//                 data.title = data.title.replace(/^\s+|\s+$/g, ''); // trim
//                 data.title = data.title.toLowerCase();
//                 // remove accents, swap ñ for n, etc
//                 var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
//                 var to = "aaaaeeeeiiiioooouuuunc------";
//                 for (var i = 0, l = from.length; i < l; i++) {
//                   data.title = data.title.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
//                 }
//                 data.title = data.title.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
//                   .replace(/\s+/g, '-') // collapse whitespace and replace by -
//                   .replace(/-+/g, '-');

//                   var slugValue = (data.title + "-" + blog.dataValues.id)
//                   const slug = db.blog.update({
//                       Slug:slugValue
//                   },{
//                       where:{id:blog.dataValues.id}
//                   })
//             }
//             return h.response({
//                 blog,
//                 message:"Successfully Created"
//             })

//      }
//      catch(e)
//      {
//          console.log('SSSSSSSSSaddblog',e)
//      }
//   }

//   getBlog = async(request,h)=>{
//       try{
//         const query = request.query;
//         const page = query.page ? query.page : 1;
//             const blogData = await db.blog.findAndCountAll({
//                 include:[
//                     {
                        
//                           attributes:["categoryName"],
//                               model:Models.blogCategory ,
//                               required:true,
//                               where:{isDeleted:false}          
                            
//                     }
//                 ],
//                 offset: (parseInt(page) - 1) * 10,
//                 distinct: true,
//                 /* order: [["id", "desc"]], */
//                 limit: 10,
//                 where:{isDeleted:false}

//             })
//             var totalPages = await UniversalFunctions.getTotalPages(blogData.count, 10)

//             return h.response({
//                 responseData:{
//                     blog:blogData.rows,
//                     totalRecords: blogData.count,
//                     page: page,
//                     nextPage: page + 1,
//                     totalPages: totalPages,
//                     perPage: 10,
//                     loadMoreFlag: blogData.rows.length < 10 ? 0 : 1,
//                 }
//             })
//       }
//       catch(e)
//       {
//         console.log('SSSSSSSS',e)
//       }
//   }

//   updateStatus = async(request,h)=>{
//       try{
//         var date = new Date()
//           const checkBlog = await db.blog.findOne({ where:{id:request.payload.id}})
//           console.log('SSSSSS',checkBlog)
//           if(!checkBlog)
//           {
//               return h.response({message:"Enter Valid Blog Id"}).code(400)
//           }


//             var status = await db.blog.update({
//                 status:request.payload.status,
//             },{
//                 where:{id:request.payload.id}
//             })

//             if(status)
//             {
//                if(request.payload.status==constant.BLOG_STATUS.PUBLISH)
//                {
//                     var status = await db.blog.update({
//                       status:request.payload.status,
//                       publishedDate:date
//                   },{
//                       where:{id:request.payload.id}
//                   })
//                }
//             }

//             return h.response({message:"Status Changed"})
//       }
//       catch(e)
//       {
//           console.log('SSSSSSSSstatusBlog',e)
//       }
//   }

//   getblogcategorybyId = async (request,h) => {
//     try {
//       const category = await db.blogCategory.findOne({
//         where:{id:request.query.id}
//       });
//       if(!category)
//       {
//         return h.response({message:'No category Found'})
//       }
//       return h.response({
//         responseData:{
//           category
//         }
//       });
//     } catch (e) {
//       console.log("ss", e);
//     }
//   };

//   getblogbyId=async(request,h)=>{
//     try{
//       const blogData = await db.blog.findOne({
//         include:[
//             {
                
//              attributes:["categoryName"],
//                       model:Models.blogCategory ,
//                       required:false          
                    
//             },
//             {
//               attributes: [
//               [
//                 Sequelize.literal(
//                   "CONCAT('" +
//                     process.env.NODE_SERVER_API_HOST +
//                     "','/',`attachment`.`filePath`)"
//                 ),
//                 "filePath",
//               ],
//               [
//                 Sequelize.literal(
//                   "CONCAT('" +
//                     process.env.NODE_SERVER_API_HOST +
//                     "','/',`attachment`.`thumbnailPath`)"
//                 ),
//                 "thumbnailPath",
//               ],
//               "id",
//               "originalName",
//               "fileName",
//             ],
//             model: Models.attachments,
//           }, 
//         ],
    
       
//         /* order: [["id", "desc"]], */
      
//         where:{id:request.query.id}
//     })
//     if(!blogData)
//     {
//       return h.response({message:'no blog found'})
//     }
//     return h.response({
//       responseData:{
//         blogData
//       } 
//     })
//   }
//     catch(e)
//     {
//       console.log('ssssssssssblogbyid',e)
//     }
//   }

//   deleteBlog=async(request,h)=>{
//     try{
//       var deleteB = await db.blog.update({
//         isDeleted:true,
//     },{
//         where:{id:request.query.id}
//     })
//       return h.response({
//         responseData:{
//           message:'Deleted Successfully'
//         }
//       });;
//     }
//     catch(e)
//     {
//       console.log('SSSSSSSS',e)
//     }
//   }

}

module.exports = new acl();
