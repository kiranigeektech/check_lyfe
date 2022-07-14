const db = require("../models/index");

class eventCategory {
  getCategory = async (request) => {
    try {
      const category = await db.eventCategory.findAll({where:{isDeleted:false}});
      return category;
    } catch (e) {
      console.log("ss", e);
    }
  };

  addCategory = async (request,h) => {
    try {
     var authToken = request.auth.credentials.userData
     if(request.payload.type=='event')
     {
     if(request.payload.id)
     {
      const editCategory = await db.eventCategory.update(
        {
          categoryName: request.payload.categoryName,
          attachment_id:request.payload.attachment_id
        },
        {
          where: {
            id: request.payload.id,
          },
        })

        if(editCategory)
        {
          return h.response({message:"Edit Successfully"}).code(200)
        }
     }
     if(request.payload.categoryName)
     {
       var already = await db.eventCategory.findOne({where:{categoryName:request.payload.categoryName}})
       if(already)
       {
         return h.response({message:"Category already Exist"}).code(400)
       }
     }
      var category= await db.eventCategory.create({
        categoryName: request.payload.categoryName,
        attachment_id:request.payload.attachment_id,
        isDeleted:false
      })
    }
    if(request.payload.type=='activity')
    {
      if(request.payload.id)
      {
       const editCategory = await db.activityCategory.update(
         {
           categoryName: request.payload.categoryName,
           attachment_id:request.payload.attachment_id
         },
         {
           where: {
             id: request.payload.id,
           },
         })
 
         if(editCategory)
         {
           return h.response({message:"Edit Successfully"}).code(200)
         }
      }
      if(request.payload.categoryName)
      {
        var already = await db.activityCategory.findOne({where:{categoryName:request.payload.categoryName}})
        if(already)
        {
          return h.response({message:"Category already Exist"}).code(400)
        }
      }
       var category= await db.activityCategory.create({
         categoryName: request.payload.categoryName,
         attachment_id:request.payload.attachment_id,
         isDeleted:false
       })
    }
    if(request.payload.type=='shops')
    {
      if(request.payload.id)
      {
       const editCategory = await db.salonCategory.update(
         {
           categoryName: request.payload.categoryName,
           attachment_id:request.payload.attachment_id
         },
         {
           where: {
             id: request.payload.id,
           },
         })
 
         if(editCategory)
         {
           return h.response({message:"Edit Successfully"}).code(200)
         }
      }
      if(request.payload.categoryName)
      {
        var already = await db.salonCategory.findOne({where:{categoryName:request.payload.categoryName}})
        if(already)
        {
          return h.response({message:"Category already Exist"}).code(400)
        }
      }
       var category= await db.salonCategory.create({
         categoryName: request.payload.categoryName,
         attachment_id:request.payload.attachment_id,
         isDeleted:false
       })
    }
    if(request.payload.type=='club')
    {
      if(request.payload.id)
      {
       const editCategory = await db.clubCategory.update(
         {
           categoryName: request.payload.categoryName,
           attachment_id:request.payload.attachment_id
         },
         {
           where: {
             id: request.payload.id,
           },
         })
 
         if(editCategory)
         {
           return h.response({message:"Edit Successfully"}).code(200)
         }
      }
      if(request.payload.categoryName)
      {
        var already = await db.clubCategory.findOne({where:{categoryName:request.payload.categoryName}})
        if(already)
        {
          return h.response({message:"Category already Exist"}).code(400)
        }
      }
       var category= await db.clubCategory.create({
         categoryName: request.payload.categoryName,
         attachment_id:request.payload.attachment_id,
         isDeleted:false
       })
    }
    if(request.payload.type=='restaurant')
    {
      if(request.payload.id)
      {
       const editCategory = await db.restaurantCategory.update(
         {
           categoryName: request.payload.categoryName,
           attachment_id:request.payload.attachment_id
         },
         {
           where: {
             id: request.payload.id,
           },
         })
 
         if(editCategory)
         {
           return h.response({message:"Edit Successfully"}).code(200)
         }
      }
      if(request.payload.categoryName)
      {
        var already = await db.restaurantCategory.findOne({where:{categoryName:request.payload.categoryName}})
        if(already)
        {
          return h.response({message:"Category already Exist"}).code(400)
        }
      }
       var category= await db.restaurantCategory.create({
         categoryName: request.payload.categoryName,
         attachment_id:request.payload.attachment_id,
         isDeleted:false
       })
    }
      if(category)
      {
        return h.response({
          responseData:{
            category
          }
        })
      }
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  getbusinessCategory = async (request,h) => {
    try {
          var authToken = request.auth.credentials.userData
          var data={}
          if(request.query.type=='event')
          {
           data =await db.eventCategory.findOne({ include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: db.attachments,
            },
          ],where:{id:request.query.id}})
          }
          if(request.query.type=='activity')
          {
           data =await db.activityCategory.findOne({
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ],where:{id:request.query.id}})
          }
          if(request.query.type=='club')
          {
           data =await db.clubCategory.findOne({
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ],where:{id:request.query.id}})
          }
          if(request.query.type=='restaurant')
          {
           data =await db.restaurantCategory.findOne({
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ],where:{id:request.query.id}})
          }
          if(request.query.type=='shops')
          {
           data =await db.salonCategory.findOne({
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ],where:{id:request.query.id}})
          }

          var type=request.query.type
          console.log('SSSSSss',type,"ddddddd",data)
      
          data.dataValues.type=type

          console.log('FFFFFFFFF',data)

          return h.response({
            responseData:{
              data
            }
          })
    } catch (e) {
      console.log("###edit####", e);
    }
  };

  deleteCategory = async (request) => {
    try {
      var authToken = request.auth.credentials.userData
      if(request.query.type=='event')
      {
      
      //check this category associated or not
      let associatedData  = await db.event.findAndCountAll({
        attributes:["id"],
        where:{category_id:request.query.id}
      })

      if(associatedData.count){
        return Boom.badRequest("Category already associated with someone");
      }

      const delCategory = await db.eventCategory.update(
        {
        isDeleted:true
        },
        {
          where:{id:request.query.id}
        }
      );
      }
      if(request.query.type=='activity')
      {
        //check this category associated or not
        let associatedData  = await db.activity.findAndCountAll({
          attributes:["id"],
          where:{category_id:request.query.id}
        })

        if(associatedData.count){
          return Boom.badRequest("Category already associated with someone");
        }

      const delCategory = await db.activityCategory.update(
        {
        isDeleted:true
        },
        {
          where:{id:request.query.id}
        }
      );
      }
      if(request.query.type=='club')
      {
        //check this category associated or not
        let associatedData  = await db.clubs.findAndCountAll({
          attributes:["id"],
          where:{category_id:request.query.id}
        })

        if(associatedData.count){
          return Boom.badRequest("Category already associated with someone");
        }
        
      const delCategory = await db.clubCategory.update(
        {
        isDeleted:true
        },
        {
          where:{id:request.query.id}
        }
      );
      }
      if(request.query.type=='shops')
      {
        //check this category associated or not
        let associatedData  = await db.salon.findAndCountAll({
          attributes:["id"],
          where:{category_id:request.query.id}
        })

        if(associatedData.count){
          return Boom.badRequest("Category already associated with someone");
        }
      const delCategory = await db.salonCategory.update(
        {
        isDeleted:true
        },
        {
          where:{id:request.query.id}
        }
      );
      }
      if(request.query.type=='restaurant')
      {
      const delCategory = await db.restaurantCategory.update(
        {
        isDeleted:true
        },
        {
          where:{id:request.query.id}
        }
      );
      }
      return "Deleted Successfully";
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  };

  admingetCategory=async(request,h)=>{
    try{
      var authToken= request.auth.credentials.userData
      if(request.query.type=='event')
      {
        var category = await db.eventCategory.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: db.attachments,
            },
          ], 
          where:{isDeleted:false}});
      }
      if(request.query.type=='activity')
      {
        var category = await db.activityCategory.findAll({   include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`attachment`.`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`attachment`.`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],
              "id",
              "originalName",
              "fileName",
            ],
            model: db.attachments,
          },
        ], 
        where:{isDeleted:false}});
      }
      if(request.query.type=='club')
      {
        var category = await db.clubCategory.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: db.attachments,
            },
          ], 
          where:{isDeleted:false}});
      }
      if(request.query.type=='shops')
      {
        var category = await db.salonCategory.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: db.attachments,
            },
          ], where:{isDeleted:false}});
      }
      if(request.query.type=='restaurant')
      {
        var category = await db.restaurantCategory.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: db.attachments,
            },
          ], where:{isDeleted:false}});
      }

      return h.response({
        responseData:{
          category,
          type:request.query.type
        }
      })
    }
    catch(e)
    {
      console.log('SSSSSSSs',e)
    }
  }
}

module.exports = new eventCategory();
