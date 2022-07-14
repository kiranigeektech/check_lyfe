const db = require("../models/index");
const constant = require('../config/constant');
var UniversalFunctions = require("../universalFunctions/lib");



class blog {
  getCategory = async (request,h) => {
    try {
      const category = await db.blogCategory.findAll({
        where:{isDeleted:false}
      });
      return h.response({
        responseData:{
          category
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  addCategory = async (request,h) => {
    try {
        
      let checkAlreadyExist = await db.blogCategory.findOne({
          where: {
            categoryName: request.payload.categoryName,
          },
        });
        if(checkAlreadyExist)
        {
          return h.response({message:'category already exist'})
        }
        if(request.payload.id)
        {
          const editCategory = await db.blogCategory.update(
            {
              categoryName: request.payload.categoryName,

            },
            {
              where: {
                id: request.payload.id,
              },
            }
          );
          return h.response({message:'Edit Successfully'})
        }

      const add = await db.blogCategory.create({
        categoryName:request.payload.categoryName,
        isDeleted:false
      }

        );
      console.log("SSSSSSSSSSSSSS@@@@", add);
      return h.response({
          add,
          message:'created Successfuly'
      })
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  editCategory = async (request) => {
    try {
      const editCategory = await db.blogCategory.update(
        {
          categoryName: request.payload.categoryName,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return h.response({
        responseData:{
          message:'Edit Successfully'
        }
      });
    } catch (e) {
      console.log("###edit####", e);
    }
  };

  deleteCategory = async (request,h) => {
    try {
      var deleteB = await db.blogCategory.update({
        isDeleted:true,
      },{
          where:{id:request.query.id}
      })
      console.log('SSSSSS',deleteB)
    
      return h.response({
        responseData:{
          message:'Deleted Successfully'
        }
      });
    
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  };

  addBlog = async(request,h)=>{
     try{
      var authToken=request.auth.credentials.userData

         var data = request.payload
         var date = new Date()
         if(data.attachmentId=='' || data.attachmentId==0 && data.categoryId=='' || data.categorytId==0)
         {
             return h.response({message:'Enter All the feilds'})
         }
         if(data.id)
         {
            var blog = await db.blog.update({
                title:data.title,
                description:data.description,
                category_id:data.category_id,
                content:data.content,
                attachment_id:data.attachment_id,
                status:constant.BLOG_STATUS.PUBLISH,
                isDeleted:false,
                authorId: authToken.userId
            },{
                where:{id:data.id}
            })  
            if(data.title)
            {
                data.title = data.title.replace(/^\s+|\s+$/g, ''); // trim
                data.title = data.title.toLowerCase();
                // remove accents, swap ñ for n, etc
                var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
                var to = "aaaaeeeeiiiioooouuuunc------";
                for (var i = 0, l = from.length; i < l; i++) {
                  data.title = data.title.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                }
                data.title = data.title.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                  .replace(/\s+/g, '-') // collapse whitespace and replace by -
                  .replace(/-+/g, '-');

                  var slugValue = (data.title + "-" + data.id)
                  const slug = db.blog.update({
                      Slug:slugValue
                  },{
                      where:{id:data.id}
                  })
            }

            return h.response({
                message:'edit Successfully'
            })

         }
         var blog = await db.blog.create({
                title:data.title,
                description:data.description,
                category_id:data.category_id,
                content:data.content,
                attachment_id:data.attachment_id,
                status:constant.BLOG_STATUS.PUBLISH,
                publishedDate:date,
                isDeleted:false,
                authorId: authToken.userId
            })  
         if(blog)
            {
                data.title = data.title.replace(/^\s+|\s+$/g, ''); // trim
                data.title = data.title.toLowerCase();
                // remove accents, swap ñ for n, etc
                var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
                var to = "aaaaeeeeiiiioooouuuunc------";
                for (var i = 0, l = from.length; i < l; i++) {
                  data.title = data.title.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
                }
                data.title = data.title.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                  .replace(/\s+/g, '-') // collapse whitespace and replace by -
                  .replace(/-+/g, '-');

                  var slugValue = (data.title + "-" + blog.dataValues.id)
                  const slug = db.blog.update({
                      Slug:slugValue
                  },{
                      where:{id:blog.dataValues.id}
                  })
            }
            return h.response({
                blog,
                message:"Successfully Created"
            })

     }
     catch(e)
     {
         console.log('SSSSSSSSSaddblog',e)
     }
  }

  getBlog = async(request,h)=>{
      try{
        const query = request.query;
        const page = query.page ? query.page : 1;
            const blogData = await db.blog.findAndCountAll({
                include:[
                    {
                        
                          attributes:["categoryName"],
                              model:Models.blogCategory ,
                              required:true,
                              where:{isDeleted:false}          
                            
                    }
                ],
                offset: (parseInt(page) - 1) * 10,
                distinct: true,
                /* order: [["id", "desc"]], */
                limit: 10,
                where:{isDeleted:false}

            })
            var totalPages = await UniversalFunctions.getTotalPages(blogData.count, 10)

            return h.response({
                responseData:{
                    blog:blogData.rows,
                    totalRecords: blogData.count,
                    page: page,
                    nextPage: page + 1,
                    totalPages: totalPages,
                    perPage: 10,
                    loadMoreFlag: blogData.rows.length < 10 ? 0 : 1,
                }
            })
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
  }

  updateStatus = async(request,h)=>{
      try{
        var date = new Date()
          const checkBlog = await db.blog.findOne({ where:{id:request.payload.id}})
          console.log('SSSSSS',checkBlog)
          if(!checkBlog)
          {
              return h.response({message:"Enter Valid Blog Id"}).code(400)
          }


            var status = await db.blog.update({
                status:request.payload.status,
            },{
                where:{id:request.payload.id}
            })

            if(status)
            {
               if(request.payload.status==constant.BLOG_STATUS.PUBLISH)
               {
                    var status = await db.blog.update({
                      status:request.payload.status,
                      publishedDate:date
                  },{
                      where:{id:request.payload.id}
                  })
               }
            }

            return h.response({message:"Status Changed"})
      }
      catch(e)
      {
          console.log('SSSSSSSSstatusBlog',e)
      }
  }

  getblogcategorybyId = async (request,h) => {
    try {
      const category = await db.blogCategory.findOne({
        where:{id:request.query.id}
      });
      if(!category)
      {
        return h.response({message:'No category Found'})
      }
      return h.response({
        responseData:{
          category
        }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  getblogbyId=async(request,h)=>{
    try{
      const blogData = await db.blog.findOne({
        include:[
            {
                
             attributes:["categoryName"],
                      model:Models.blogCategory ,
                      required:false          
                    
            },
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
            model: Models.attachments,
          }, 
        ],
    
       
        /* order: [["id", "desc"]], */
      
        where:{id:request.query.id}
    })
    if(!blogData)
    {
      return h.response({message:'no blog found'})
    }
    return h.response({
      responseData:{
        blogData
      } 
    })
  }
    catch(e)
    {
      console.log('ssssssssssblogbyid',e)
    }
  }

  deleteBlog=async(request,h)=>{
    try{
      var deleteB = await db.blog.update({
        isDeleted:true,
    },{
        where:{id:request.query.id}
    })
      return h.response({
        responseData:{
          message:'Deleted Successfully'
        }
      });;
    }
    catch(e)
    {
      console.log('SSSSSSSS',e)
    }
  }

}

module.exports = new blog();
