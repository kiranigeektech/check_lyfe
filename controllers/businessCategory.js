const db = require("../models/index");
const sequelize = require('sequelize');
const constant = require('../config/constant')


class businessCategory {
  getDashboard = async (request,h) => {
    try { 
        var authToken=null;
       authToken= request.auth.credentials && request.auth.credentials.userData 
      if(request.query.lat=='' && request.query.long=='')
      {   
            return h.response({message:'enter location'})
       }

       //for event
        var location = await Models.sequelize.query(`select id from events where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((events.long),(events.lat)) ) < 50000 `)
        var locationArr = [];
        for(let eachLocation of location[0]){
          locationArr.push(eachLocation.id)
        }
        
        //for club
        var clublocation = await Models.sequelize.query(`select id from clubs where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((clubs.long),(clubs.lat)) ) < 50000`)
        var locationclubArr = [];
        for(let eachLocation of clublocation[0]){
          locationclubArr.push(eachLocation.id)
        }
        
        //for restaurant
        var reslocation = await Models.sequelize.query(`select id from restaurant where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((restaurant.long),(restaurant.lat)) ) < 50000 and status=1 limit 20`)
        var locationresArr = [];
        for(let eachLocation of reslocation[0]){
          locationresArr.push(eachLocation.id)
        }
      
        //for activity
        var activitylocation = await Models.sequelize.query(`select id from activity where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((activity.long),(activity.lat)) ) < 50000`)
        var locationactivityArr = [];
        for(let eachLocation of activitylocation[0]){
          locationactivityArr.push(eachLocation.id)
        }
    
        //for shop
        var salonlocation = await Models.sequelize.query(`select id from salon where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((salon.long),(salon.lat)) ) < 50000 and status=1 limit 20`)
        var locationsalonArr = [];
        for(let eachLocation of salonlocation[0]){
          locationsalonArr.push(eachLocation.id)
        }
       
       
      if(authToken!=null)
      {
      var bookmarkData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"event"}
      })

      var bookmarkClubData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"club"}
      })

      var bookmarkAcitivityData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"activity"}
      })

      var bookmarkblogData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"blog"}
      }) 

      var bookmarkRestaurantData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"restaurant"}
      })

      var bookmarkShopData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:"shop"}
      })

      console.log('SSSSSSS',bookmarkAcitivityData)
    }
    var bannerData=[]
    var now = Moment().format('YYYY-MM-DD');

     var eventbannerData = await db.event.findAndCountAll({
         attributes:[   
         "id",
         "title",
         "startDate",
         "startTime",
         "endDate",
          "type"],
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
              model: Models.attachments,
            },
            {
              attributes:["categoryName"],
                model:Models.eventCategory ,
                as:'businessCategory',
                required:false          
              },
          ],
         limit:1,
         order: [["startDate", "DESC"]],
         where:{id:locationArr ,featured:1,status:constant.BUSINESS_STATUS.ACCEPT,endDate:{[Op.gt]:now},}
     })
     var activitybannerData = await db.activity.findAndCountAll({
      attributes:[   
      "id",
      "title",
       "type"],
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
           model: Models.attachments,
         },
         {
           attributes:["categoryName"],
             model:Models.activityCategory ,
             as:'businessCategory',
             required:false          
           },
       ],
      limit:1,
      where:{id:locationactivityArr,featured:1,status:constant.BUSINESS_STATUS.ACCEPT}
     })
    var clubbannerData = await db.clubs.findAndCountAll({
    attributes:[   
    "id",
    "title",
     "type"],
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
         model: Models.attachments,
       },
       {
         attributes:["categoryName"],
           model:Models.clubCategory ,
           as:'businessCategory',
           required:false          
         },
     ],
    limit:1,
    where:{id:locationclubArr,featured:1,status:constant.BUSINESS_STATUS.ACCEPT}
     })
     var restaurantbannerData = await db.restaurant.findAndCountAll({
      attributes:[   
      "id",
      "title",
       "type"],
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
           model: Models.attachments,
         },
         {
           attributes:["categoryName"],
             model:Models.restaurantCategory ,
             as:'businessCategory',
             required:false          
           },
       ],
      limit:1,
      order: [["id", "DESC"]],
      where:{id:locationresArr,featured:1,status:constant.BUSINESS_STATUS.ACCEPT}
    })
    var salonbannerData = await db.salon.findAndCountAll({
      attributes:[   
      "id",
      "title",
       "type"],
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
           model: Models.attachments,
         },
         {
           attributes:["categoryName"],
             model:Models.salonCategory ,
             as:'businessCategory',
             required:false          
           },
       ],
      limit:1,
      order: [["id", "DESC"]],
      where:{id:locationsalonArr,featured:1,status:constant.BUSINESS_STATUS.ACCEPT}
  })
  bannerData=eventbannerData.rows.concat(activitybannerData.rows).concat(clubbannerData.rows).concat(restaurantbannerData.rows).concat(salonbannerData.rows)
  


     var discover = await db.businessCategory.findAndCountAll({
         attributes:["id","title","type"]
     })


     var event = await db.event.findAndCountAll({
        attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "startTime",
            "rating",
            "ratingCount",
            "lat",
            "long",
            "showAddress"
          ],
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
              model: Models.attachments,
            },
          ],
          limit:5,
          order: [["startDate", "DESC"]], 
          where:{id:locationArr ,status:1 ,active:true,endDate:{[Op.gt]:now}} 
     })
      var hasNextEvent= event.count > 5 ? true :false
      var eventData =[]
    if(event)
    {
    if(bookmarkData)
    {
     for(let i=0 ;i<event.rows.length;i++){
       let flag =0
       for(let j=0;j<bookmarkData.rows.length;j++){
         if( event.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
         {
            eventData.push({
                id:event.rows[i].dataValues.id,
                bookmarked:true,
                title:event.rows[i].dataValues.title,
                description:event.rows[i].dataValues.description,
                address:event.rows[i].dataValues.address,
                startDate:event.rows[i].dataValues.startDate,
                endDate:event.rows[i].dataValues.endDate,
                startTime:event.rows[i].dataValues.startTime,
                rating:event.rows[i].dataValues.rating,
                showAddress:event.rows[i].dataValues.showAddress,
                ratingCount:event.rows[i].dataValues.ratingCount,
               attachment:{
                  filePath : event.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : event.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : event.rows[i].dataValues.attachment.dataValues.id,
                  originalName : event.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : event.rows[i].dataValues.attachment.dataValues.fileName
                } 
            })
            flag = 1;
            break;
         }
       }
       if(flag == 0){
       eventData.push({
         id: event.rows[i] && event.rows[i].dataValues.id,
         bookmarked:false,
         title:event.rows[i].dataValues.title,
                description:event.rows[i].dataValues.description,
                address:event.rows[i].dataValues.address,
                startDate:event.rows[i].dataValues.startDate,
                endDate:event.rows[i].dataValues.endDate,
                startTime:event.rows[i].dataValues.startTime,
                rating:event.rows[i].dataValues.rating,
                showAddress:event.rows[i].dataValues.showAddress,
                ratingCount:event.rows[i].dataValues.ratingCount,
               attachment:{
                  filePath : event.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : event.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : event.rows[i].dataValues.attachment.dataValues.id,
                  originalName : event.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : event.rows[i].dataValues.attachment.dataValues.fileName
                } 
       })
    }
     }
    }
  }
     
     var club = await db.clubs.findAndCountAll({
        attributes: [
            "id",
            "title",
            "description",
            "address",
            "rating",
            "ratingCount",
            "lat",
            "long"
          ],
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
          limit:5,
          where:{id:locationclubArr ,status:constant.BUSINESS_STATUS.ACCEPT,active:true} 
     })
      var hasNextClub= club.count > 5 ? true :false
      var clubData=[]
      if(club)
     {
     if(bookmarkClubData)
     {
     for(let i=0 ;i<club.rows.length;i++){
      let flag =0
      for(let j=0;j<bookmarkClubData.rows.length;j++){
       
        if( club.rows[i].dataValues.id ==bookmarkClubData.rows[j].dataValues.savedId)
        {
           clubData.push({
               id:club.rows[i].dataValues.id,
               bookmarked:true,
               title:club.rows[i].dataValues.title,
               description:club.rows[i].dataValues.description,
               address:club.rows[i].dataValues.address,
               rating:club.rows[i].dataValues.rating,
               ratingCount:club.rows[i].dataValues.ratingCount,
              attachment:{
                 filePath : club.rows[i].dataValues.attachment.dataValues.filePath,
                 thumbnailPath : club.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                 id : club.rows[i].dataValues.attachment.dataValues.id,
                 originalName : club.rows[i].dataValues.attachment.dataValues.originalName,
                 fileName : club.rows[i].dataValues.attachment.dataValues.fileName
               } 
           })
           flag = 1;
           break;
        }
      }
      if(flag == 0){
      clubData.push({
        id: club.rows[i] && club.rows[i].dataValues.id,
        bookmarked:false,
        title:club.rows[i].dataValues.title,
               description:club.rows[i].dataValues.description,
               address:club.rows[i].dataValues.address,
               rating:club.rows[i].dataValues.rating,
               ratingCount:club.rows[i].dataValues.ratingCount,
              attachment:{
                 filePath : club.rows[i].dataValues.attachment.dataValues.filePath,
                 thumbnailPath : club.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                 id : club.rows[i].dataValues.attachment.dataValues.id,
                 originalName : club.rows[i].dataValues.attachment.dataValues.originalName,
                 fileName : club.rows[i].dataValues.attachment.dataValues.fileName
               } 
      })
   }
    }
  }
}

     var activity = await db.activity.findAndCountAll({
         attributes:[
            "id",
            "title",
            "description",
            "address",
            "rating",
            "ratingCount",
            "lat",
            "long"
         ],
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
         limit:5,
       where:{id:locationactivityArr ,status:constant.BUSINESS_STATUS.ACCEPT,active:true} 
     })
      var hasNextActivity= activity.count > 5 ? true :false
      var activityData=[]
     if(activity)
     {
     if(bookmarkAcitivityData)
     {
       console.log('SSSSSSSSSSS',bookmarkAcitivityData.rows.length)
      for(let i=0 ;i<activity.rows.length;i++){
        let flag =0
        for(let j=0;j<bookmarkAcitivityData.rows.length;j++){
         
          if( activity.rows[i].dataValues.id ==bookmarkAcitivityData.rows[j].dataValues.savedId)
          {
             activityData.push({
                 id:activity.rows[i].dataValues.id,
                 bookmarked:true,
                 title:activity.rows[i].dataValues.title,
                 description:activity.rows[i].dataValues.description,
                 address:activity.rows[i].dataValues.address,
                 rating:activity.rows[i].dataValues.rating,
                 ratingCount:activity.rows[i].dataValues.ratingCount,
                attachment:{
                   filePath : activity.rows[i].dataValues.attachment.dataValues.filePath,
                   thumbnailPath : activity.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                   id : activity.rows[i].dataValues.attachment.dataValues.id,
                   originalName : activity.rows[i].dataValues.attachment.dataValues.originalName,
                   fileName : activity.rows[i].dataValues.attachment.dataValues.fileName
                 } 
             })
             flag = 1;
             break;
          }
        }
        if(flag == 0){
        activityData.push({
          id: activity.rows[i] && activity.rows[i].dataValues.id,
          bookmarked:false,
          title:activity.rows[i].dataValues.title,
                 description:activity.rows[i].dataValues.description,
                 address:activity.rows[i].dataValues.address,
                 rating:activity.rows[i].dataValues.rating,
                 ratingCount:activity.rows[i].dataValues.ratingCount,
                attachment:{
                   filePath : activity.rows[i].dataValues.attachment.dataValues.filePath,
                   thumbnailPath : activity.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                   id : activity.rows[i].dataValues.attachment.dataValues.id,
                   originalName : activity.rows[i].dataValues.attachment.dataValues.originalName,
                   fileName : activity.rows[i].dataValues.attachment.dataValues.fileName
                 } 
        })
      }
    }
     }
    }


     var restaurant = await db.restaurant.findAndCountAll({
      attributes:[
         "id",
         "title",
         "description",
         "address",
         "rating",
         "ratingCount",
         "lat",
         "long",
         "serviceType"
      ],
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
      limit:5,
      where:{id:locationresArr,status:constant.BUSINESS_STATUS.ACCEPT,active:true} 
  })
      var hasNextRestaurant= restaurant.count > 5 ? true :false
        var restaurantData=[]
    if(restaurant)
    {
    if( bookmarkRestaurantData)
    {
      console.log('SSSSSSSSSSS',bookmarkRestaurantData.rows.length)
    for(let i=0 ;i<restaurant.rows.length;i++){
      let flag =0
      for(let j=0;j<bookmarkRestaurantData.rows.length;j++){
        
        if( restaurant.rows[i].dataValues.id ==bookmarkRestaurantData.rows[j].dataValues.savedId)
        {
            restaurantData.push({
                id:restaurant.rows[i].dataValues.id,
                bookmarked:true,
                title:restaurant.rows[i].dataValues.title,
                description:restaurant.rows[i].dataValues.description,
                address:restaurant.rows[i].dataValues.address,
                rating:restaurant.rows[i].dataValues.rating,
                ratingCount:restaurant.rows[i].dataValues.ratingCount,
              attachment:{
                  filePath : restaurant.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : restaurant.rows[i].dataValues.attachment.dataValues.id,
                  originalName : restaurant.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : restaurant.rows[i].dataValues.attachment.dataValues.fileName
                } 
            })
            flag = 1;
            break;
        }
      }
      if(flag == 0){
      restaurantData.push({
        id: restaurant.rows[i] && restaurant.rows[i].dataValues.id,
        bookmarked:false,
        title:restaurant.rows[i].dataValues.title,
                description:restaurant.rows[i].dataValues.description,
                address:restaurant.rows[i].dataValues.address,
                rating:restaurant.rows[i].dataValues.rating,
                ratingCount:restaurant.rows[i].dataValues.ratingCount,
              attachment:{
                  filePath : restaurant.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : restaurant.rows[i].dataValues.attachment.dataValues.id,
                  originalName : restaurant.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : restaurant.rows[i].dataValues.attachment.dataValues.fileName
                } 
      })
    }
  }
    } 
    }
    
    var shop = await db.salon.findAndCountAll({
      attributes:[
         "id",
         "title",
         "description",
         "address",
         "rating",
         "ratingCount",
         "lat",
         "long"
      ],
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
      limit:5,
      where:{id:locationresArr,status:constant.BUSINESS_STATUS.ACCEPT,active:true} 
  })
      var hasNextShop= restaurant.count > 5 ? true :false
        var shopData=[]
    if(shop)
    {
    if( bookmarkShopData)
    {
      console.log('SSSSSSSSSSS',bookmarkShopData.rows.length)
    for(let i=0 ;i<shop.rows.length;i++){
      let flag =0
      for(let j=0;j<bookmarkShopData.rows.length;j++){
        
        if( shop.rows[i].dataValues.id ==bookmarkShopData.rows[j].dataValues.savedId)
        {
            shopData.push({
                id:restaurant.rows[i].dataValues.id,
                bookmarked:true,
                title:restaurant.rows[i].dataValues.title,
                description:restaurant.rows[i].dataValues.description,
                address:restaurant.rows[i].dataValues.address,
                rating:restaurant.rows[i].dataValues.rating,
                ratingCount:restaurant.rows[i].dataValues.ratingCount,
              attachment:{
                  filePath : restaurant.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : restaurant.rows[i].dataValues.attachment.dataValues.id,
                  originalName : restaurant.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : restaurant.rows[i].dataValues.attachment.dataValues.fileName
                } 
            })
            flag = 1;
            break;
        }
      }
      if(flag == 0){
      shopData.push({
        id: restaurant.rows[i] && restaurant.rows[i].dataValues.id,
        bookmarked:false,
        title:restaurant.rows[i].dataValues.title,
                description:restaurant.rows[i].dataValues.description,
                address:restaurant.rows[i].dataValues.address,
                rating:restaurant.rows[i].dataValues.rating,
                ratingCount:restaurant.rows[i].dataValues.ratingCount,
              attachment:{
                  filePath : restaurant.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : restaurant.rows[i].dataValues.attachment.dataValues.id,
                  originalName : restaurant.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : restaurant.rows[i].dataValues.attachment.dataValues.fileName
                } 
      })
    }
  }
    } 
    }

    var blog = await db.blog.findAndCountAll({
      attributes:["id","title","description","Slug","publishedDate"],
      include:[
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
        {
          attributes:['id'],
          required:true,
          model:Models.users,
          include: {
            attributes: [
              "firstName"
            ],
            required: true,
            model: Models.userProfiles,
            include:{
              attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`user->userProfile->attachment`.`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],
              "id",
              "originalName",
              "fileName",
            ],
            model: Models.attachments,
          },  
          },
        }      
      ],
     
      distinct: true,
      /* order: [["id", "desc"]], */
      limit: 5,
       where:{isDeleted:false,status:1} 
  })
   var hasNextBlog= blog.count > 5 ? true :false
   var blogData=[];
   if(blog)
   {
    console.log("bookmarkblogData",bookmarkblogData)
    if(bookmarkblogData)
    {
      console.log('SSSSSSSSSS0S',bookmarkblogData.rows.length)
    for(let i=0 ;i<blog.rows.length;i++){
      let flag =0
      for(let j=0;j<bookmarkblogData.rows.length;j++){  
        if( blog.rows[i].dataValues.id ==bookmarkblogData.rows[j].dataValues.savedId)
        {
            blogData.push({
                id:blog.rows[i].dataValues.id,
                bookmarked:true,
                title:blog.rows[i].dataValues.title,
                description:blog.rows[i].dataValues.description,
                publishedDate:blog.rows[i].dataValues.publishedDate,
                
              attachment:{
                  filePath : blog.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : blog.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : blog.rows[i].dataValues.attachment.dataValues.id,
                  originalName : blog.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : blog.rows[i].dataValues.attachment.dataValues.fileName
              },
              user:blog.rows[i].dataValues.user

            })
            flag = 1;
            break;
        }
      }
      if(flag == 0){
      blogData.push({
        id: blog.rows[i] && blog.rows[i].dataValues.id,
        bookmarked:false,
        title:blog.rows[i].dataValues.title,
                description:blog.rows[i].dataValues.description,
                publishedDate:blog.rows[i].dataValues.publishedDate,
              attachment:{
                  filePath : blog.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : blog.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : blog.rows[i].dataValues.attachment.dataValues.id,
                  originalName : blog.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : blog.rows[i].dataValues.attachment.dataValues.fileName
                }, 
                user:blog.rows[i].dataValues.user
      })
    }
  }
    } 
   }
     
     
     var dashboard= [
     {type:'banner',banner:bannerData.slice(0,5)},
     {title:"DISCOVER",type:"discover",discover:discover.rows},
     {title:"EVENTS",type:"event",event: bookmarkData ? eventData:event.rows,hasNext:hasNextEvent},
     {title:"RESTAURANTS",type:"restaurant",restaurant:bookmarkRestaurantData ? restaurantData:restaurant.rows,hasNext:hasNextRestaurant},
     {title:"SHOPS",type:"shops",shop:bookmarkShopData ? shopData:shop.rows,hasNext:hasNextShop},
     {title:'NIGHTLIFE',type:"club",club: bookmarkClubData ? clubData:club.rows,hasNext:hasNextClub},
     {title:'ACTIVITIES',type:"activity",activity: bookmarkAcitivityData ? activityData:activity.rows,hasNext:hasNextActivity},
     {title:"BLOGS",type:"blog",blog:bookmarkblogData ? blogData:blog.rows,hasNext:hasNextBlog},
    ]

     return h.response({
         responseData:{
         dashboard
         },
         message:"successfull"
     }) 
    
    } catch (e) {
      console.log("ss", e);
    }
  };

  getCategoryPage=async(request,h)=>{
    try{

      var discover = await db.businessCategory.findAndCountAll({
        attributes:["id","title","type"]
      })

      var eventcategory = await db.eventCategory.findAndCountAll({
        attributes:["id","categoryName"],
        include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],

              "originalName",
              "fileName",
            ],

            model: Models.attachments,
          },
        ],
        where:{isDeleted:false}
      });
      var sendeventCategory = [];
      for (let i = 0; i < eventcategory.rows.length; i++) {
        if (eventcategory.rows[i].dataValues) {
          sendeventCategory.push({
            categoryId: eventcategory.rows[i].dataValues.id,
            categoryName: eventcategory.rows[i].dataValues.categoryName,
            filePath:
            eventcategory.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
            eventcategory.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: eventcategory.rows[i].dataValues.attachment.dataValues.id,
            originalName:
            eventcategory.rows[i].dataValues.attachment.dataValues.originalName,
            fileName:
            eventcategory.rows[i].dataValues.attachment.dataValues.fileName,
              
          });
        }
      }

      var clubcategory = await db.clubCategory.findAndCountAll({
        attributes:["id","categoryName"],
        include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],

              "originalName",
              "fileName",
            ],
            model: Models.attachments,
          },
        ],
        where:{isDeleted:false}
      });
      var sendclubCategory = [];
      for (let i = 0; i < clubcategory.rows.length; i++) {
        if (clubcategory.rows[i].dataValues) {
          sendclubCategory.push({
            categoryId: clubcategory.rows[i].dataValues.id,
            categoryName: clubcategory.rows[i].dataValues.categoryName,
            filePath:
            clubcategory.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
            clubcategory.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: clubcategory.rows[i].dataValues.attachment.dataValues.id,
            originalName:
            clubcategory.rows[i].dataValues.attachment.dataValues.originalName,
            fileName:
            clubcategory.rows[i].dataValues.attachment.dataValues.fileName,
              
          });
        }
      }

      var activitycategory = await db.activityCategory.findAndCountAll({
        attributes:["id","categoryName"],
        include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],

              "originalName",
              "fileName",
            ],
            model: Models.attachments,
          },
        ],
        where:{isDeleted:false}
      });
      var sendactivityCategory = [];
      for (let i = 0; i < activitycategory.rows.length; i++) {
        if (activitycategory.rows[i].dataValues) {
          sendactivityCategory.push({
            categoryId: activitycategory.rows[i].dataValues.id,
            categoryName: activitycategory.rows[i].dataValues.categoryName,
            filePath:
            activitycategory.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
            activitycategory.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: activitycategory.rows[i].dataValues.attachment.dataValues.id,
            originalName:
            activitycategory.rows[i].dataValues.attachment.dataValues.originalName,
            fileName:
            activitycategory.rows[i].dataValues.attachment.dataValues.fileName,
              
          });
        }
      }

      var shopscategory = await db.salonCategory.findAndCountAll({
        attributes:["id","categoryName"],
        include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],

              "originalName",
              "fileName",
            ],
            model: Models.attachments,
          },
        ],
        where:{isDeleted:false}
      });
      var sendshopsCategory = [];
      for (let i = 0; i < shopscategory.rows.length; i++) {
        if (shopscategory.rows[i].dataValues) {
          sendshopsCategory.push({
            categoryId: shopscategory.rows[i].dataValues.id,
            categoryName: shopscategory.rows[i].dataValues.categoryName,
            filePath:
            shopscategory.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
            shopscategory.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: shopscategory.rows[i].dataValues.attachment.dataValues.id,
            originalName:
            shopscategory.rows[i].dataValues.attachment.dataValues.originalName,
            fileName:
            shopscategory.rows[i].dataValues.attachment.dataValues.fileName,
              
          });
        }
      }

      var restaurantcategory = await db.restaurantCategory.findAndCountAll({
        attributes:["id","categoryName"],
        include: [
          {
            attributes: [
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`filePath`)"
                ),
                "filePath",
              ],
              [
                Sequelize.literal(
                  "CONCAT('" +
                    process.env.NODE_SERVER_API_HOST +
                    "','/',`thumbnailPath`)"
                ),
                "thumbnailPath",
              ],

              "originalName",
              "fileName",
            ],
            model: Models.attachments,
          },
        ],
        where:{isDeleted:false}
      });
      var sendrestaurantCategory = [];
      for (let i = 0; i < restaurantcategory.rows.length; i++) {
        if (restaurantcategory.rows[i].dataValues) {
          sendrestaurantCategory.push({
            categoryId: restaurantcategory.rows[i].dataValues.id,
            categoryName: restaurantcategory.rows[i].dataValues.categoryName,
            filePath:
            restaurantcategory.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
            restaurantcategory.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: restaurantcategory.rows[i].dataValues.attachment.dataValues.id,
            originalName:
            restaurantcategory.rows[i].dataValues.attachment.dataValues.originalName,
            fileName:
            restaurantcategory.rows[i].dataValues.attachment.dataValues.fileName,
              
          });
        }
      }

      var categoryPage=[
        {discover:discover.rows,type:"discover"},
        {event:sendeventCategory,type:'event'},
        {club:sendclubCategory,type:'club'},
        {activity:sendactivityCategory,type:'activity'},
        {shops:sendshopsCategory,type:'shops'},
        {restaurant:sendrestaurantCategory,type:'restaurant'},
      ]

      return h.response({
        responseData:{
          categoryPage
        }
      })

    }
    catch(e)
    {
      console.log('SSSSSSSuserCategory',e)
    }
  }

  getGeneralInfo=async(request,h)=>{
    try{
            const data = request.query
            
            console.log('ssssssssssss',request.headers)

          
            if(request.headers.devicetype == 'IOS')
            {
              const  responseData = await db.generalInfo.findOne({
                attributes:["iosappVersion",'privacyPolicy','aboutUs','termUrl','supportEmail','supportNumber','iosappLink','criticaliosappVersion']
              })

               return h.response({
                 responseData
                  
               })
              
            } 
            if(request.headers.devicetype == 'ANDROID')
            {
              const  responseData = await db.generalInfo.findOne({
                attributes:["androidappVersion",'privacyPolicy','aboutUs','termUrl','supportEmail','supportNumber','androidappLink','criticalandroidappVersion']
              })
               return h.response({
                 responseData
                   
               })
              
            }  
            if(request.headers.devicetype=='web')
            {
              return 'no data'
            }
    }
    catch(e)
    {
        console.log('SSSSSSSSSS',e)
    }
  }

  updateGeneralInfo=async(request,h)=>{
    try{
          const data = request.payload
          if(data.id)
          {
              const update = await db.generalInfo.update({
                iosappVersion:data.iosappVersion,
                androidappVersion:data.androidappVersion,
                iosappLink:data.iosappLink,
                androidappLink:data.androidappLink,
                privacyPolicy:data.privacyPolicy,
                aboutUs:data.aboutUs,
                termUrl:data.termUrl,
                supportEmail:data.supportEmail,
                supportNumber:data.supportNumber,
              },{
                where:{id:data.id}
              })

              return h.response({message:"Edit Successfully"}).code(200)
          }

          const createInfo = await db.generalInfo.create({
            iosappVersion:data.iosappVersion,
            androidappVersion:data.androidappVersion,
            iosappLink:data.iosappLink,
            androidappLink:data.androidappLink,
            privacyPolicy:data.privacyPolicy,
            aboutUs:data.aboutUs,
            termUrl:data.termUrl,
            supportEmail:data.supportEmail,
            supportNumber:data.supportNumber,
          })

          return h.response({
            responseData:{
              createInfo
            }
          })
    }
    catch(e)
    {
        console.log('SSSSSSSSS',e)
    }
  }

  updateVendorGeneralInfo = async(request,h)=>{
    try{
      const data = request.payload
      if(data.id)
      {
          const update = await db.vendorappGeneral.update({
            iosappVersion:data.iosappVersion,
            androidappVersion:data.androidappVersion,
            iosappLink:data.iosappLink,
            androidappLink:data.androidappLink,
            privacyPolicy:data.privacyPolicy,
            aboutUs:data.aboutUs,
            termUrl:data.termUrl,
            supportEmail:data.supportEmail,
            supportNumber:data.supportNumber,
          },{
            where:{id:data.id}
          })

          return h.response({message:"Edit Successfully"}).code(200)
      }

      const createInfo = await db.vendorappGeneral.create({
        iosappVersion:data.iosappVersion,
        androidappVersion:data.androidappVersion,
        iosappLink:data.iosappLink,
        androidappLink:data.androidappLink,
        privacyPolicy:data.privacyPolicy,
        aboutUs:data.aboutUs,
        termUrl:data.termUrl,
        supportEmail:data.supportEmail,
        supportNumber:data.supportNumber,
      })

      return h.response({
        responseData:{
          createInfo
        }
      })
    }
    catch(e)
    {
        console.log('ssss',e)
    }
  }

  getVendorGeneral=async(request,h)=>{
    try{
      const data = request.query
            
      console.log('ssssssssssss',request.headers)

    
      if(request.headers.devicetype == 'IOS')
      {
        const  responseData = await db.vendorappGeneral.findOne({
          attributes:["iosappVersion",'privacyPolicy','aboutUs','termUrl','supportEmail','supportNumber','iosappLink','criticaliosappVersion',"dashboardLink"]
        })

         return h.response({
           responseData
            
         })
        
      } 
      if(request.headers.devicetype == 'ANDROID')
      {
        const  responseData = await db.vendorappGeneral.findOne({
          attributes:["androidappVersion",'privacyPolicy','aboutUs','termUrl','supportEmail','supportNumber','androidappLink','criticalandroidappVersion',"dashboardLink"]
        })
         return h.response({
           responseData
             
         })
        
      }  
      if(request.headers.devicetype=='web')
      {
        return 'no data'
      }
    }
    catch(e)
    {
      console.log('SSSSS',e)
    }
  }

  updateFCM = async(request,h)=>{
    try{
            var authToken = request.auth.credentials.userData
          
          
            const updateFcm = await db.userAccesses.update({
                fcmToken:request.payload.fcmToken
            },{
              where:{user_id:authToken.userId}
            }) 
            if(updateFcm)
            {
              return h.response({message:'Successfull'})
            }
    }
    catch(e)
    {
      console.log('SSSSSSSSSSS',e)
    }
  }

 paginate=(data,page) =>
     {
      
        var result = data.slice((page - 1) * 10,page*10);
        
        return result
      
      }

  globalSearch=async(req,h)=>{
    try{
      var authToken= req.auth.credentials ? req.auth.credentials.userData :null
      const query = req.query;
      const page = query.page ? query.page : 1;
      var now = new Date();
      let whereSearch = {};
      let whereeventSearch={}
      if (typeof query.search != "undefined" && query.search) {
        let append = { title: { [Op.like]: "%" + query.search + "%" } };
        _.assign(whereSearch, append);
        _.assign(whereeventSearch, append);
      }
      whereSearch.status=constant.BUSINESS_STATUS.ACCEPT
      whereSearch.active=true
      whereeventSearch.status=constant.BUSINESS_STATUS.ACCEPT
      whereeventSearch.active=true
      whereeventSearch.endDate={[Op.gt]:now}
      var data
      var data=[]
      var eventData=[]
      var clubData=[]
      var activityData=[]
      var restaurantData=[]
      var salonData=[]
      if(authToken!==null)
      {
        var bookmark = await db.saved.findAndCountAll({
           where:{user_id:authToken.userId}
         })
       }
       console.log('SSSSSSSSSSSs',query.types)

       if(query.types && query.types.length!==0)
       {
        
        if(query.types.includes('activity'))
        {
          console.log('SSSSSSres')
          var activity = await db.activity.findAndCountAll({
            attributes:[
              "id",
              "title",
              "description",
              "address",
              "rating",
              "ratingCount",
              "lat",
              "long"
            ],
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
            limit:15,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            /* order: [["id", "desc"]], */
            where:whereSearch
          })
          for(let i=0;i<activity.rows.length;i++)
          {
            activityData.push({
              id:activity.rows[i].dataValues.id,
              type:'activity',
              title:activity.rows[i].dataValues.title,
              description:activity.rows[i].dataValues.description,
              address:activity.rows[i].dataValues.address,
              startDate:activity.rows[i].dataValues.startDate,
              endDate:activity.rows[i].dataValues.endDate,
              startTime:activity.rows[i].dataValues.startTime,
              rating:activity.rows[i].dataValues.rating,
              ratingCount:activity.rows[i].dataValues.ratingCount,
            attachment:{
                filePath : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.filePath,
                thumbnailPath : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                id : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.id,
                originalName : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.originalName,
                fileName : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.fileName
              } 
            })
          }
          if(authToken!==null)
          {
          for(let i=0;i<activityData.length;i++)
          {
            var flag=0;
            for(let j=0;j<bookmark.rows.length;j++)
              {
                  if(activityData[i].type===bookmark.rows[j].dataValues.type && activityData[i].id===bookmark.rows[j].dataValues.savedId)
                {
                
                    console.log('____________true')
                    activityData[i].bookmarked=true
                    flag=1;
                    break; 
                }
              } 
              if(flag===0)
              {
                activityData[i].bookmarked=false
              }
                
          }
        }
        var totalPages = await UniversalFunctions.getTotalPages(activityData.length, 10);

          data=data.concat(activityData)
          console.log(data)
          /* return h.response({
            responseData:{
              result:activityData,
              totalRecords:activityData.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 10,
              loadMoreFlag: activityData.length < 10 ? 0 : 1,
            }
          }) */
          
        }

        if(query.types.includes('restaurant'))
        {
          var restaurant = await db.restaurant.findAndCountAll({
            attributes:[
               "id",
               "title",
               "description",
               "address",
               "rating",
               "ratingCount",
               "lat",
               "long",
               "serviceType"
            ],
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
            limit:15,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            where:whereSearch
            })

            for(let i=0;i<restaurant.rows.length;i++)
            {
              restaurantData.push({
                id:restaurant.rows[i].dataValues.id,
                type:'restaurant',
                title:restaurant.rows[i].dataValues.title,
                description:restaurant.rows[i].dataValues.description,
                address:restaurant.rows[i].dataValues.address,
                startDate:restaurant.rows[i].dataValues.startDate,
                endDate:restaurant.rows[i].dataValues.endDate,
                startTime:restaurant.rows[i].dataValues.startTime,
                rating:restaurant.rows[i].dataValues.rating,
                serviceType:restaurant.rows[i].dataValues.serviceType,
                ratingCount:restaurant.rows[i].dataValues.ratingCount,
              attachment:{
                  filePath : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.filePath,
                  thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                  id : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.id,
                  originalName : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.originalName,
                  fileName : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.fileName
                } 
              })
            }
            if(authToken!==null)
            {
            for(let i=0;i<restaurantData.length;i++)
            {
              var flag=0;
              for(let j=0;j<bookmark.rows.length;j++)
                {
                    if(restaurantData[i].type===bookmark.rows[j].dataValues.type && restaurantData[i].id===bookmark.rows[j].dataValues.savedId)
                  {
                  
                      console.log('____________true')
                      restaurantData[i].bookmarked=true
                      flag=1;
                      break; 
                  }
                } 
                if(flag===0)
                {
                  restaurantData[i].bookmarked=false
                }
                  
            }
          }
          var totalPages = await UniversalFunctions.getTotalPages(restaurantData.length, 10);
         data = data.concat(restaurantData)
           /*  return h.response({
              responseData:{
                result:restaurantData,
                totalRecords:restaurantData.length,
                page: page,
                nextPage: page + 1,
                totalPages: totalPages,
                perPage: 10,
                loadMoreFlag: restaurantData.length < 10 ? 0 : 1,
              }
            }) */
            
        }

        if(query.types.includes('event'))
        {
          var event = await db.event.findAndCountAll({
            attributes: [
                "id",
                "title",
                "description",
                "address",
                "startDate",
                "endDate",
                "startTime",
                "rating",
                "ratingCount",
                "lat",
                "long",
              ],
              where:whereeventSearch,
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
                  model: Models.attachments,
                },
              ],
              offset: (parseInt(page) - 1) * 10,
            distinct: true,
            limit:15,
              order: [["startDate", "DESC"]], 
              
          })
          for(let i=0;i<event.rows.length;i++)
          {
            eventData.push({
              id:event.rows[i].dataValues.id,
              type:'event',
              title:event.rows[i].dataValues.title,
              description:event.rows[i].dataValues.description,
              address:event.rows[i].dataValues.address,
              startDate:event.rows[i].dataValues.startDate,
              endDate:event.rows[i].dataValues.endDate,
              startTime:event.rows[i].dataValues.startTime,
              rating:event.rows[i].dataValues.rating,
              ratingCount:event.rows[i].dataValues.ratingCount,
             attachment:{
                filePath : event.rows[i].dataValues.attachment.dataValues &&  event.rows[i].dataValues.attachment.dataValues.filePath,
                thumbnailPath : event.rows[i].dataValues.attachment.dataValues &&  event.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                id : event.rows[i].dataValues.attachment.dataValues &&  event.rows[i].dataValues.attachment.dataValues.id,
                originalName : event.rows[i].dataValues.attachment.dataValues &&  event.rows[i].dataValues.attachment.dataValues.originalName,
                fileName : event.rows[i].dataValues.attachment.dataValues &&  event.rows[i].dataValues.attachment.dataValues.fileName
              } 
          })
          }

          if(authToken!==null)
          {
            for(let i=0;i<eventData.length;i++)
            {
              var flag=0;
              for(let j=0;j<bookmark.rows.length;j++)
                {
                    if(eventData[i].type===bookmark.rows[j].dataValues.type && eventData[i].id===bookmark.rows[j].dataValues.savedId)
                  {
                  
                      console.log('____________true')
                      eventData[i].bookmarked=true
                      flag=1;
                      break; 
                  }
                } 
                if(flag===0)
                {
                  eventData[i].bookmarked=false
                }
                  
            }
          }
          var totalPages = await UniversalFunctions.getTotalPages(eventData.length, 10);
          data = data.concat(eventData)
        /*   return h.response({
            responseData:{
              result:eventData,
              totalRecords:eventData.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 10,
              loadMoreFlag: eventData.length <= 10 ? 0 : 1,
            }
          }) */
        }

        if(query.types.includes('club'))
        {
          var club = await db.clubs.findAndCountAll({
            attributes: [
                "id",
                "title",
                "description",
                "address",
                "rating",
                "ratingCount",
                "lat",
                "long"
              ],
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
              limit:15,
              offset: (parseInt(page) - 1) * 10,
              distinct: true,
              where:whereSearch 
        })
        for(let i=0;i<club.rows.length;i++)
        {
          clubData.push({
            id:club.rows[i].dataValues.id,
            type:'club',
            title:club.rows[i].dataValues.title,
            description:club.rows[i].dataValues.description,
            address:club.rows[i].dataValues.address,
            startDate:club.rows[i].dataValues.startDate,
            endDate:club.rows[i].dataValues.endDate,
            startTime:club.rows[i].dataValues.startTime,
            rating:club.rows[i].dataValues.rating,
            ratingCount:club.rows[i].dataValues.ratingCount,
           attachment:{
              filePath : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.id,
              originalName : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.originalName,
              fileName : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.fileName
            } 
        })
        }
        if(authToken!==null)
        {
          for(let i=0;i<clubData.length;i++)
          {
            var flag=0;
            for(let j=0;j<bookmark.rows.length;j++)
              {
                  if(clubData[i].type===bookmark.rows[j].dataValues.type && clubData[i].id===bookmark.rows[j].dataValues.savedId)
                {
                
                    console.log('____________true')
                    clubData[i].bookmarked=true
                    flag=1;
                    break; 
                }
              } 
              if(flag===0)
              {
                clubData[i].bookmarked=false
              }
                
          }
        }
        var totalPages = await UniversalFunctions.getTotalPages(clubData.length, 10);
        data = data.concat(clubData)
        /* return h.response({
          responseData:{
            result:clubData,
            totalRecords:clubData.length,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 10,
            loadMoreFlag: clubData.length < 10 ? 0 : 1,
          }
        }) */
        }

        if(query.types.includes('shops'))
        {
          var salon = await db.salon.findAndCountAll({
            attributes: [
              "id",
              "title",
              "address",
              "description",
              
              "rating",
              "ratingCount",
            ],
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
            /* order: [["id", "desc"]], */
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            limit: 15,
            where:whereSearch,
          });
          for(let i=0;i<salon.rows.length;i++)
          {
            salonData.push({
              id:salon.rows[i].dataValues.id,
              type:'shops',
              title:salon.rows[i].dataValues.title,
              description:salon.rows[i].dataValues.description,
              address:salon.rows[i].dataValues.address,
              startDate:salon.rows[i].dataValues.startDate,
              endDate:salon.rows[i].dataValues.endDate,
              startTime:salon.rows[i].dataValues.startTime,
              rating:salon.rows[i].dataValues.rating,
              ratingCount:salon.rows[i].dataValues.ratingCount,
             attachment:{
                filePath :salon.rows[i].dataValues.attachment.dataValues &&  salon.rows[i].dataValues.attachment.dataValues.filePath,
                thumbnailPath : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                id : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.id,
                originalName : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.originalName,
                fileName : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.fileName
              } 
          })
          }

          if(authToken!==null)
          {
            for(let i=0;i<salonData.length;i++)
            {
              var flag=0;
              for(let j=0;j<bookmark.rows.length;j++)
                {
                    if(salonData[i].type===bookmark.rows[j].dataValues.type && salonData[i].id===bookmark.rows[j].dataValues.savedId)
                  {
                  
                      console.log('____________true')
                      salonData[i].bookmarked=true
                      flag=1;
                      break; 
                  }
                } 
                if(flag===0)
                {
                  salonData[i].bookmarked=false
                }
                  
            }
          }
          var totalPages = await UniversalFunctions.getTotalPages(salonData.length, 10);
           data= data.concat(salonData)
         /*  return h.response({
            responseData:{
              result:salonData,
              totalRecords:salonData.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 10,
              loadMoreFlag: salonData.length < 10 ? 0 : 1,
            }
          }) */
        }
        console.log('ssssss',data)
        return h.response({
          responseData:{
            result:data,
            totalRecords:data.length,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 10,
            loadMoreFlag: data.length <= 10 ? 0 : 1,
          }
        })
       }
      var event = await db.event.findAndCountAll({
        attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "startTime",
            "rating",
            "ratingCount",
            "lat",
            "long",
          ],
          where:whereeventSearch,
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
              model: Models.attachments,
            },
          ],
          limit:10,
          order: [["startDate", "DESC"]], 
          
      })
      for(let i=0;i<event.rows.length;i++)
      {
        eventData.push({
          id:event.rows[i].dataValues.id,
          type:'event',
          title:event.rows[i].dataValues.title,
          description:event.rows[i].dataValues.description,
          address:event.rows[i].dataValues.address,
          startDate:event.rows[i].dataValues.startDate,
          endDate:event.rows[i].dataValues.endDate,
          startTime:event.rows[i].dataValues.startTime,
          rating:event.rows[i].dataValues.rating,
          ratingCount:event.rows[i].dataValues.ratingCount,
         attachment:{
            filePath : event.rows[i].dataValues.attachment.dataValues && event.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : event.rows[i].dataValues.attachment.dataValues && event.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : event.rows[i].dataValues.attachment.dataValues && event.rows[i].dataValues.attachment.dataValues.id,
            originalName : event.rows[i].dataValues.attachment.dataValues && event.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : event.rows[i].dataValues.attachment.dataValues && event.rows[i].dataValues.attachment.dataValues.fileName
          } 
      })
      }

      var club = await db.clubs.findAndCountAll({
          attributes: [
              "id",
              "title",
              "description",
              "address",
              "rating",
              "ratingCount",
              "lat",
              "long"
            ],
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
            limit:10,
            where:whereSearch 
      })
      for(let i=0;i<club.rows.length;i++)
      {
        clubData.push({
          id:club.rows[i].dataValues.id,
          type:'club',
          title:club.rows[i].dataValues.title,
          description:club.rows[i].dataValues.description,
          address:club.rows[i].dataValues.address,
          startDate:club.rows[i].dataValues.startDate,
          endDate:club.rows[i].dataValues.endDate,
          startTime:club.rows[i].dataValues.startTime,
          rating:club.rows[i].dataValues.rating,
          ratingCount:club.rows[i].dataValues.ratingCount,
         attachment:{
            filePath : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.id,
            originalName : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : club.rows[i].dataValues.attachment.dataValues && club.rows[i].dataValues.attachment.dataValues.fileName
          } 
      })
      }
      var activity = await db.activity.findAndCountAll({
        attributes:[
           "id",
           "title",
           "description",
           "address",
           "rating",
           "ratingCount",
           "lat",
           "long"
        ],
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
        limit:10,
      where:whereSearch
      })
      for(let i=0;i<activity.rows.length;i++)
      {
        activityData.push({
          id:activity.rows[i].dataValues.id,
          type:'activity',
          title:activity.rows[i].dataValues.title,
          description:activity.rows[i].dataValues.description,
          address:activity.rows[i].dataValues.address,
          startDate:activity.rows[i].dataValues.startDate,
          endDate:activity.rows[i].dataValues.endDate,
          startTime:activity.rows[i].dataValues.startTime,
          rating:activity.rows[i].dataValues.rating,
          ratingCount:activity.rows[i].dataValues.ratingCount,
         attachment:{
            filePath : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.id,
            originalName : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : activity.rows[i].dataValues.attachment.dataValues && activity.rows[i].dataValues.attachment.dataValues.fileName
          } 
      })
      }
      var restaurant = await db.restaurant.findAndCountAll({
      attributes:[
         "id",
         "title",
         "description",
         "address",
         "rating",
         "ratingCount",
         "lat",
         "long",
         "serviceType"
      ],
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
      limit:10,
      where:whereSearch
      })
      for(let i=0;i<restaurant.rows.length;i++)
      {
        restaurantData.push({
          id:restaurant.rows[i].dataValues.id,
          type:'restaurant',
          title:restaurant.rows[i].dataValues.title,
          description:restaurant.rows[i].dataValues.description,
          address:restaurant.rows[i].dataValues.address,
          startDate:restaurant.rows[i].dataValues.startDate,
          endDate:restaurant.rows[i].dataValues.endDate,
          startTime:restaurant.rows[i].dataValues.startTime,
          rating:restaurant.rows[i].dataValues.rating,
          ratingCount:restaurant.rows[i].dataValues.ratingCount,
         attachment:{
            filePath : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.id,
            originalName : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : restaurant.rows[i].dataValues.attachment.dataValues && restaurant.rows[i].dataValues.attachment.dataValues.fileName
          } 
      })
      }
      var salon = await db.salon.findAndCountAll({
        attributes: [
          "id",
          "title",
          "address",
          "description",
          
          "rating",
          "ratingCount",
        ],
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
        /* order: [["id", "desc"]], */
        limit: 10,
        where:whereSearch,
      });
      for(let i=0;i<salon.rows.length;i++)
      {
        salonData.push({
          id:salon.rows[i].dataValues.id,
          type:'shops',
          title:salon.rows[i].dataValues.title,
          description:salon.rows[i].dataValues.description,
          address:salon.rows[i].dataValues.address,
          startDate:salon.rows[i].dataValues.startDate,
          endDate:salon.rows[i].dataValues.endDate,
          startTime:salon.rows[i].dataValues.startTime,
          rating:salon.rows[i].dataValues.rating,
          ratingCount:salon.rows[i].dataValues.ratingCount,
         attachment:{
            filePath : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.id,
            originalName : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : salon.rows[i].dataValues.attachment.dataValues && salon.rows[i].dataValues.attachment.dataValues.fileName
          } 
      })
      }
      data=eventData.concat(clubData).concat(activityData).concat(restaurantData).concat(salonData)

      var totalPages = await UniversalFunctions.getTotalPages(data.length, 10);

      
  
     
if(authToken!==null)
{
    for(let i=0;i<data.length;i++)
    {
      var flag=0;
      for(let j=0;j<bookmark.rows.length;j++)
        {
            if(data[i].type===bookmark.rows[j].dataValues.type && data[i].id===bookmark.rows[j].dataValues.savedId)
          {
          
              console.log('____________true')
              data[i].bookmarked=true
              flag=1;
              break; 
          }
        } 
        if(flag===0)
        {
          data[i].bookmarked=false
        }
         
    }
  }
  

    let result = await this.paginate(data,page)

     return h.response({
        responseData:{
          result, 
          totalRecords:data.length,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: result.length < 10 ? 0 : 1,
       }
     })
    }
    catch(e)
    {
        console.log('SSSSSSSS',e)
    }
  }

  getNotification=async(request,h)=>{
    try{
      const query = request.query;
      const page = query.page ? query.page : 1;
      var authToken=request.auth.credentials.userData
      console.log(authToken)
      let notificationTo
      if(authToken.scope[0] == 'user'){
        notificationTo = constant.NOTIFICATION_TO.USER
      }
      else if(authToken.scope[0] == 'vendor'){
        notificationTo = constant.NOTIFICATION_TO.VENDOR
      }
      else{
        notificationTo = constant.NOTIFICATION_TO.ADMIN
      }

      const data = await db.notifications.findAndCountAll({
        attributes:["id","title","body","type","order_id","booking_id","createdAt","readStatus","notificationType"],
        order: [["createdAt", "DESC"]], 
        where:{user_id:authToken.userId,notificationTo}
      })
      var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      const count = await db.notifications.count({
        where:{
          readStatus:false,
          user_id:authToken.userId,
          notificationTo
        }}
      )

      return h.response({
        responseData:{
          data:data.rows,
          totalRecords:data.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: data.rows.length < 10 ? 0 : 1,
          unreadCount:count
        }
      })
    }
    catch(e)
    {
        console.log('SSSSSSSSS',e)
    }
  }

  readNotification=async(request,h)=>{
    try{
      var authToken=request.auth.credentials.userData

      const read = await db.notifications.update({
          readStatus:true
      },{
        where:{id:request.payload.id,user_id:authToken.userId,notificationTo:constant.NOTIFICATION_TO.USER}
      })

      return h.response({message:'Read Successfully'})
    }
    catch(e)
    {
      console.log('SSSSSSSSS',e)
    }
  }

}

module.exports = new businessCategory();