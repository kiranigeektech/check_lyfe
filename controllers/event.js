const db = require("../models");
var UniversalFunctions = require("../universalFunctions/lib");
const moment = require("moment");
const constant = require('../config/constant')
const { Sequelize, sequelize } = require("../models");
const sendNotification = require("../notifications/notifications")


class event {
  createEvent = async (req, h) => {
    try {
      var authToken = req.auth.credentials.userData
      var data = req.payload;
      if (data.availabilities) {
        const newDate = new Date();
        const formatDate = moment(newDate).format("MM-DD-YYYY");
        for (var i = 0; i < data.availabilities.length; i++) {
          const startTime = moment(
            `${formatDate} ${data.availabilities[i].startTime}`
          ).format("HH:mm:ss");
          const endTime = moment(
            `${formatDate} ${data.availabilities[i].endTime}`
          ).format("HH:mm:ss");
          let dateUtc = moment(data.availabilities[i].startDate);
          let partstime = startTime.split(":");
          let totalSecondsTime =
            parseInt(partstime[0]) * 3600 +
            parseInt(partstime[1]) * 60 +
            parseInt(partstime[2]);
          dateUtc = moment(data.availabilities[i].startDate).add(
            totalSecondsTime,
            "seconds"
          );
          var d = moment.utc(dateUtc).format();
          console.log("sSSSSSSSSSSSSSS", d);

          available.push({
            startTime: startTime,
            endTime: endTime,
            startDate: data.availabilities[i].startDate,
            endDate: data.availabilities[i].endDate,
            ticketAvailable:data.capacity
          });
        }
      }

      if(data.id)
      {
        const edit = await db.event.update(
          {
            title: data.title,
            description: data.description,
            price: data.price,
            address: data.address,
            startDate: data.startDate,
            endDate: data.endDate,
            capacity: data.capacity,
            bookingUrl:data.bookingUrl,
            refundTime:data.refundTime,
            cancellationPolicy:data.cancellationPolicy,
            termsAndCondition:data.termsAndCondition,
            lat:data.lat,
            long:data.long,
            showAddress:data.showAddress,
            attachment_id: data.attachment_id,
            category_id: data.category_id,
            available: data.capacity,
          },
          {
            where: {
              id: data.id,
              user_id:authToken.userId
            },
          }
        );

        return h.response({message:'Edit Successfull'}).code(200)
      }
    


      const add = await db.event.create(
        {
          title: data.title,
          description: data.description,
          price: data.price,
          address: data.address,
          startDate: data.startDate,
          endDate: data.endDate,
          capacity: data.capacity,
          type:'event',
          active:true,
          featured: false,
          bookingUrl:data.bookingUrl,
          refundTime:data.refundTime,
          cancellationPolicy:data.cancellationPolicy,
          termsAndCondition:data.termsAndCondition,
          lat:data.lat,
          long:data.long,
          attachment_id: data.attachment_id,
          user_id: authToken.userId,
          category_id: data.category_id,
          available: data.capacity,
          showAddress:data.showAddress
        },
      );

      let adminData = await db.users.findOne({
        where: {
          role_id: constant.ROLES.ADMIN_ROLE,
        },
      });
      if(adminData){
        //send notification to admin
        const create = await db.notifications.create({
          title:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.title,
          body:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.body.replace('{name}',data.title),
          notificationType:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.type,
          user_id:adminData.dataValues.id,
          notificationTo:constant.NOTIFICATION_TO.ADMIN
        })
      }

      return h.response({
        data: add,
      });
    } catch (e) {
      console.log("#############addevent", e);
      return e;
    }
  };

  getEvent = async (request, h) => {
    try {
      var authToken =request.auth.credentials ? request.auth.credentials.userData:null
      const query = request.query;
      const page = query.page ? query.page : 1;
      var params = {};
      var Data=[]
      var bookmarkData
      var now = new Date()
      if(authToken!=null)
      {
      bookmarkData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:query.type},
      })
    }
      if (request.query.category_id) {
        params.category_id = request.query.category_id;
      }
      params.status=constant.BUSINESS_STATUS.ACCEPT
      params.active=true
       
      if (query.type == "event") { 
        var location = await Models.sequelize.query(`select id from events where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((events.long),(events.lat)) ) < 50000 `)
        var locationArr = [];
        for(let eachLocation of location[0]){
          locationArr.push(eachLocation.id)
        }
        params.id=locationArr
        let append = {endDate:{[Op.gt]:now}};
        _.assign(params, append);
       
     /*    if(!request.query.category_id)
        {
          params.id=locationArr
        } */
        
        var data = await db.event.findAndCountAll({
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          order: [["startDate", "DESC"]],
          /* order: [["id", "desc"]], */
          limit: 10,
          where: params,
        });

        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                    id:data.rows[i].dataValues.id,
                    bookmarked:true,
                    title:data.rows[i].dataValues.title,
                    description:data.rows[i].dataValues.description,
                    address:data.rows[i].dataValues.address,
                    startDate:data.rows[i].dataValues.startDate,
                    endDate:data.rows[i].dataValues.endDate,
                    startTime:data.rows[i].dataValues.startTime,
                    rating:data.rows[i].dataValues.rating,
                    ratingCount:data.rows[i].dataValues.ratingCount,
                    showAddress:data.rows[i].dataValues.showAddress,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
             id: data.rows[i] && data.rows[i].dataValues.id,
             bookmarked:false,
             title:data.rows[i].dataValues.title,
                    description:data.rows[i].dataValues.description,
                    address:data.rows[i].dataValues.address,
                    startDate:data.rows[i].dataValues.startDate,
                    endDate:data.rows[i].dataValues.endDate,
                    startTime:data.rows[i].dataValues.startTime,
                    rating:data.rows[i].dataValues.rating,
                    ratingCount:data.rows[i].dataValues.ratingCount,
                    showAddress:data.rows[i].dataValues.showAddress,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }

        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      }
      if (query.type == "club") {
        var clublocation = await Models.sequelize.query(`select id from clubs where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((clubs.long),(clubs.lat)) ) < 50000`)
        var locationclubArr = [];
        for(let eachLocation of clublocation[0]){
          locationclubArr.push(eachLocation.id)
        }
        params.id=locationclubArr
     /*    if(!request.query.category_id)
        {
          params.id=locationclubArr
        } */
        
        var data = await db.clubs.findAndCountAll({
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          /* order: [["id", "desc"]], */
          limit: 10,
          where: params,
        });
        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                  id:data.rows[i].dataValues.id,
                  bookmarked:true,
                  title:data.rows[i].dataValues.title,
                  description:data.rows[i].dataValues.description,
                  address:data.rows[i].dataValues.address,
                  rating:data.rows[i].dataValues.rating,
                  ratingCount:data.rows[i].dataValues.ratingCount,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
            id:data.rows[i].dataValues.id,
            bookmarked:false,
            title:data.rows[i].dataValues.title,
            description:data.rows[i].dataValues.description,
            address:data.rows[i].dataValues.address,
            rating:data.rows[i].dataValues.rating,
            ratingCount:data.rows[i].dataValues.ratingCount,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }
        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      }
      if(query.type=="activity")
      {
        var activitylocation = await Models.sequelize.query(`select id from activity where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((activity.long),(activity.lat)) ) < 50000`)
        var locationactivityArr = [];
        for(let eachLocation of activitylocation[0]){
          locationactivityArr.push(eachLocation.id)
        }
        params.id=locationactivityArr
      /*   if(!request.query.category_id)
        {
        params.id=locationactivityArr
        } */
        var data = await db.activity.findAndCountAll({
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          /* order: [["id", "desc"]], */
          limit: 10,
          where: params,
        });
        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                  id:data.rows[i].dataValues.id,
                  bookmarked:true,
                  title:data.rows[i].dataValues.title,
                  description:data.rows[i].dataValues.description,
                  address:data.rows[i].dataValues.address,
                  rating:data.rows[i].dataValues.rating,
                  ratingCount:data.rows[i].dataValues.ratingCount,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
            id:data.rows[i].dataValues.id,
            bookmarked:false,
            title:data.rows[i].dataValues.title,
            description:data.rows[i].dataValues.description,
            address:data.rows[i].dataValues.address,
            rating:data.rows[i].dataValues.rating,
            ratingCount:data.rows[i].dataValues.ratingCount,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }
        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      
      } 
      if(query.type=="shops")
      {
        var reslocation = await Models.sequelize.query(`select id from salon where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((salon.long),(salon.lat)) ) < 50000`)
        var locationsalonArr = [];
        for(let eachLocation of reslocation[0]){
          locationsalonArr.push(eachLocation.id)
        }
        params.id=locationsalonArr
    /*     if(!request.query.category_id)
        {
        params.id=locationsalonArr
        } */
        var data = await db.salon.findAndCountAll({
          attributes: [
            "id",
            "title",
            "address",
            "description",
            "showAddress",
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          /* order: [["id", "desc"]], */
          limit: 10,
          where: params,
        });
        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                  id:data.rows[i].dataValues.id,
                  bookmarked:true,
                  title:data.rows[i].dataValues.title,
                  description:data.rows[i].dataValues.description,
                  address:data.rows[i].dataValues.address,
                  rating:data.rows[i].dataValues.rating,
                  ratingCount:data.rows[i].dataValues.ratingCount,
                  showAddress:data.rows[i].dataValues.showAddress,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
            id:data.rows[i].dataValues.id,
            bookmarked:false,
            title:data.rows[i].dataValues.title,
            description:data.rows[i].dataValues.description,
            address:data.rows[i].dataValues.address,
            rating:data.rows[i].dataValues.rating,
            ratingCount:data.rows[i].dataValues.ratingCount,
            showAddress:data.rows[i].dataValues.showAddress,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }
        
        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      }
      if(query.type=='restaurant'){
        var reslocation = await Models.sequelize.query(`select id from restaurant where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((restaurant.long),(restaurant.lat)) ) < 50000`)
        var locationresArr = [];
        for(let eachLocation of reslocation[0]){
          locationresArr.push(eachLocation.id)
        }
        params.id=locationresArr
    /*     if(!request.query.category_id)
        {
        params.id=locationresArr
        } */
        var data = await db.restaurant.findAndCountAll({
          attributes: [
            "id",
            "title",
            "address",
            "description",
            "rating",
            "ratingCount",
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          /* order: [["id", "desc"]], */
          limit: 10,
          where: params,
        });
       
        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                  id:data.rows[i].dataValues.id,
                  bookmarked:true,
                  title:data.rows[i].dataValues.title,
                  description:data.rows[i].dataValues.description,
                  address:data.rows[i].dataValues.address,
                  rating:data.rows[i].dataValues.rating,
                  rating:data.rows[i].dataValues.rating,
                  serviceType:data.rows[i].dataValues.serviceType,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
            id:data.rows[i].dataValues.id,
            bookmarked:false,
            title:data.rows[i].dataValues.title,
            description:data.rows[i].dataValues.description,
            address:data.rows[i].dataValues.address,
            rating:data.rows[i].dataValues.rating,
            serviceType:data.rows[i].dataValues.serviceType,
            ratingCount:data.rows[i].dataValues.ratingCount,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }
        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      }
      if(query.type=='blog')
      {
        var data = await db.blog.findAndCountAll({
          attributes: [
            "id",
            "title",
            "description",
            "publishedDate"
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
            {
              attributes:['id'],
              required:true,
              model:Models.users,
              include: {
                required: true,
                model: Models.userProfiles,
                attributes: [
                  "firstName"
                ],
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          order: [["publishedDate", "DESC"]],
          /* order: [["id", "desc"]], */
          limit: 10,
          where: {status:constant.BLOG_STATUS.PUBLISH,isDeleted:false},
        });

        console.log(data)
        if(bookmarkData!=null)
        {
         for(let i=0 ;i<data.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            console.log('s',bookmarkData.rows[j].dataValues.savedId)
             if( data.rows[i].dataValues.id==bookmarkData.rows[j].dataValues.savedId)
             {
                Data.push({
                    id:data.rows[i].dataValues.id,
                    bookmarked:true,
                    title:data.rows[i].dataValues.title,
                    description:data.rows[i].dataValues.description,
                    publishedDate:data.rows[i].dataValues.publishedDate,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    },
                    user:data.rows[i].dataValues.user 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           Data.push({
             id: data.rows[i] && data.rows[i].dataValues.id,
             bookmarked:false,
             title:data.rows[i].dataValues.title,
              description:data.rows[i].dataValues.description,
              publishedDate:data.rows[i].dataValues.publishedDate,
                   attachment:{
                      filePath : data.rows[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : data.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : data.rows[i].dataValues.attachment.dataValues.id,
                      originalName : data.rows[i].dataValues.attachment.dataValues.originalName,
                      fileName : data.rows[i].dataValues.attachment.dataValues.fileName
                    },
                    user:data.rows[i].dataValues.user 
 
           })
        }
         }
        }

        var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
      }
      return h.response({
        responseData: {
          data: bookmarkData!=null ?  Data:data.rows,
          totalRecords: data.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: data.rows.length < 10 ? 0 : 1,
        },
        message: "Succesfull",
      });
    } catch (e) {
      console.log("%%%%%%%get", e);
      return e;
    }
  };

  groupBy = (collection, property) => {
    var i = 0,
      val,
      index,
      values = [],
      result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) result[index].push(collection[i]);
      else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  };

  getEventById = async (request, h) => {
    try {
      var authToken=request.auth.credentials ? request.auth.credentials.userData:null
      var bookmarkData=null;
      var isRating = false;
      if(authToken!==null){
        bookmarkData = await db.saved.findOne({
         where:{user_id:authToken.userId,savedId:request.params.id,type:request.query.type}
       })

      

     }
      if(request.query.type=="event")
      {
        var location = await Models.sequelize.query(`select id from events where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((events.long),(events.lat)) ) < 50000 `)
        var locationArr = [];
        for(let eachLocation of location[0]){
          locationArr.push(eachLocation.id)
        }
        var now = new Date();
        if(authToken!==null)
        {
        var previousBooking = await db.booking.findOne({
          include:[
            {
              required:true,
              model:Models.eventBookingTimings,
              where:{ status:{[Op.eq]:null}}, 
            },
          ],
          where:{user_id:authToken.userId}
         })
  
         if(previousBooking)
         {
            isRating=true
         }
        }
        
      const vendorId = await db.event.findOne({where:{id:request.params.id}})
      var subscription = await db.vendorsubscriptionplanBooking.findOne({
        order: [["createdAt", "DESC"]],
        where:{user_id:vendorId.dataValues.user_id,status:'success'}
      })
      
      //host data
      const user = await db.users.findOne({
        attributes:["mobile","countryCode"],
        where:{id:vendorId.dataValues.user_id},
      })

      console.log(subscription)
      await db.event.update({
        isOrder:true
      },{
        where:{id:request.params.id}
      })
      
      if(subscription)
      {
        var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
        if(currentDate >= expiryplan)
        {
          await db.event.update({
            isOrder:false
          },{
            where:{id:request.params.id}
          })
         
        }
        if(currentDate <= expiryplan)
        {
          await db.event.update({
            isOrder:true
          },{
            where:{id:request.params.id}
          })
        }

      }

        const eventDetails = await db.event.findOne({
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "startTime",
            "category",
            "rating",
            "ratingCount",
            "bookingUrl",
            "termsAndCondition",
            "cancellationPolicy",
            "category_id",
            "showAddress",
            "isOrder" 
          ],
          include: [
            {
              attributes: ["amenitiesItem"],
              required: false,
              model: Models.aminitiesList ,
              through: { attributes: [] },
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`aminitiesLists->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`aminitiesLists->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "filename",
                  ],
                  model: Models.attachments,
                },
              ],
            },
            {
              attributes: ["mobile","id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: [ "firstName", "lastName", "email","description"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
              ],
            },
          ],
          where: { id: request.params.id },
        });
        if(bookmarkData!==null)
        {
          eventDetails.bookmarked = true
        }
        if(bookmarkData==null)
        {
          eventDetails.bookmarked = false
        }
       
        //Event timings
        var dateRange = [];
        var timings = [];
        let availabilities = await db.availability.findAll({
          where: { event_id: request.params.id },
        });
        var n = availabilities.length;
        for (let i = 0; i < n; i++) {
          dateRange.push({
            startDate: JSON.stringify(availabilities[i].dataValues.startDate),
            endDate: JSON.stringify(availabilities[i].dataValues.endDate),
            startTime: availabilities[i].dataValues.startTime,
            endTime: availabilities[i].dataValues.endTime,
          });
        }
        var result = this.groupBy(dateRange, "startDate");
        let arrayToSend = [];
        for (let eachresult of result) {
          let obj = {
            startDate: eachresult[0].startDate.slice(1, 25),
            endDate: eachresult[0].endDate.slice(1, 25),
          };
          let timing = [];
          for (let eachSubresult of eachresult) {
            let obj = {
              startTime: eachSubresult.startTime,
              endTime: eachSubresult.endTime,
            };
            timing.push(obj);
          }
          obj.timings = timing;
          arrayToSend.push(obj);
        }
  
        //Event Gallery
        let gallery = await db.eventGallery.findAndCountAll({
          limit: 10,
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where: { event_id: request.params.id },
        });
        let sendGalleryEvent = [];
        for (let i = 0; i < gallery.rows.length; i++) {
          sendGalleryEvent.push({
            filePath: gallery.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath:
              gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id: gallery.rows[i].dataValues.attachment.dataValues.id,
            originalName:
              gallery.rows[i].dataValues.attachment.dataValues.originalName,
            fileName: gallery.rows[i].dataValues.attachment.dataValues.fileName,
          });
        }
  
        //Userreview
        var review = await db.eventRating.findAndCountAll({
          attributes:["review","rating","createdAt"],
          include:[
            {
              attributes:["id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: ["firstName", "lastName"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
               
              ],
            },
              {
                 attributes:["id"],
                required: false,
                model: Models.eventRatingGallery,
                as:'reviewAttachment',
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      /* ["id", "data"], */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          limit:2,
          distinct: true,
          order: [["id", "DESC"]], 
          where: { event_id:request.params.id ,status:constant.RATING_STATUS.SHOW},
        })
        var reviewCount = review.count

        //more events
        if(!authToken==null)
        {
        var bookmarkEvent = await db.saved.findAndCountAll({
          where:{user_id:authToken.userId,type:"event"}
        })
      }

   /*    if(locationArr.includes(request.params.id))
      {
        locationArr.indexOf(request.params.id)
      } */

      if(locationArr.includes(request.params.id))
      {
        var n = locationArr.indexOf(request.params.id)
        console.log(n)
        locationArr.splice(n,1)


        console.log('SSSSSSSSSSSSS',locationArr)
      }
        
        const moreEvent = await db.event.findAll({
          limit: 4,
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "startTime",
            "category",
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
          where:{id:locationArr/* {[Op.notIn]:[request.params.id]}  */,status:constant.BUSINESS_STATUS.ACCEPT, active: 1, category_id:eventDetails.dataValues.category_id,endDate:{[Op.gt]:now}}
        });

        var eventData =[]
        if(bookmarkEvent)
        {
         for(let i=0 ;i<moreEvent.length;i++){
           let flag =0
           for(let j=0;j<bookmarkEvent.rows.length;j++){
            
             if( moreEvent[i].dataValues.id ==bookmarkEvent.rows[j].dataValues.savedId)
             {
                eventData.push({
                    id:moreEvent[i].dataValues.id,
                    bookmarked:true,
                    title:moreEvent[i].dataValues.title,
                    description:moreEvent[i].dataValues.description,
                    address:moreEvent[i].dataValues.address,
                    startDate:moreEvent[i].dataValues.startDate,
                    endDate:moreEvent[i].dataValues.endDate,
                    startTime:moreEvent[i].dataValues.startTime,
                    rating:moreEvent[i].dataValues.rating,
                    ratingCount:moreEvent[i].dataValues.ratingCount,
                   attachment:{
                      filePath : moreEvent[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : moreEvent[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : moreEvent[i].dataValues.attachment.dataValues.id,
                      originalName : moreEvent[i].dataValues.attachment.dataValues.originalName,
                      fileName : moreEvent[i].dataValues.attachment.dataValues.fileName
                    } 
                })
                flag = 1;
                break;
             }
           }
           if(flag == 0){
           eventData.push({
             id: moreEvent[i] && moreEvent[i].dataValues.id,
             bookmarked:false,
             title:moreEvent[i].dataValues.title,
                    description:moreEvent[i].dataValues.description,
                    address:moreEvent[i].dataValues.address,
                    startDate:moreEvent[i].dataValues.startDate,
                    endDate:moreEvent[i].dataValues.endDate,
                    startTime:moreEvent[i].dataValues.startTime,
                    rating:moreEvent[i].dataValues.rating,
                    ratingCount:moreEvent[i].dataValues.ratingCount,
                   attachment:{
                      filePath : moreEvent[i].dataValues.attachment.dataValues.filePath,
                      thumbnailPath : moreEvent[i].dataValues.attachment.dataValues.thumbnailPath,
                      id : moreEvent[i].dataValues.attachment.dataValues.id,
                      originalName : moreEvent[i].dataValues.attachment.dataValues.originalName,
                      fileName : moreEvent[i].dataValues.attachment.dataValues.fileName
                    } 
           })
        }
         }
        }

        if(eventDetails)
        {
        return h.response({
          responseData: {
            data: eventDetails,
            user,
            isRating: isRating,
            moreReviews: reviewCount > 2 ? true :false,
            reviewCount:review.count,
            review:review.rows,
            dates: arrayToSend,
            gallery: sendGalleryEvent,
            galleryCount: gallery.count,
            moreData: bookmarkEvent ? eventData : moreEvent,
          },
          message: "Successfull",
        });
      }
      if(!eventDetails){
        return h.response({message:"Enter Valid Id"}).code(400)
      }
      }
      if(request.query.type=='club'){
       /*  if(authToken!==null)
        {
        bookmarkData = await db.saved.findOne({
          where:{user_id:authToken.userId,savedId:request.params.id,type:request.query.type}
        })
      } */
      var clublocation = await Models.sequelize.query(`select id from clubs where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((clubs.long),(clubs.lat)) ) < 50000`)
      var locationclubArr = [];
      for(let eachLocation of clublocation[0]){
        locationclubArr.push(eachLocation.id)
      }
      const vendorId = await db.clubs.findOne({where:{id:request.params.id}})

      //host data
      const user = await db.users.findOne({
        attributes:["mobile","countryCode"],
        where:{id:vendorId.dataValues.user_id},
      })
      var subscription = await db.vendorsubscriptionplanBooking.findOne({
        order: [["createdAt", "DESC"]],
        where:{user_id:vendorId.dataValues.user_id,status:'success'}
      })
      if(subscription)
      {
        var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
        console.log(currentDate, expiryplan)
        if(currentDate >= expiryplan)
        {
          const update = await db.clubs.update({
            isOrder:false
          },{
            where:{id:request.params.id}
          })
         
        }
        if(currentDate <= expiryplan)
        {
          const update = await db.clubs.update({
            isOrder:true
          },{
            where:{id:request.params.id}
          })
        }

      }
        const result = await db.clubs.findOne({
          attributes:[ "id","title", "address","description","rating","isOrder","ratingCount","termsAndCondition","category_id" ,
          "cancellationPolicy"],
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
           {
               attributes:["amenitiesItem"], 
              required: false,
              model: db.amenities,
              as:"aminitiesLists",
              through: {attributes: []},
              include:[
                {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      "id",
                      "originalName",
                      "filename",
                    ],
                    model: db.attachments,
                }
              ]
            }, 
       
           
          ],
         
          where: {
            id: request.params.id,
          },
        });

        if(bookmarkData!==null)
        {
          result.bookmarked = true
        }
        if(bookmarkData==null)
        {
          result.bookmarked = false
        }
        
  

        //club timings
        let possibleDaysArray = [{
          days : 0,
          startTime : null,
          endTime : null
      },
      {
          days : 1,
          startTime : null,
          endTime : null
      },
      {
          days : 2,
          startTime : null,
          endTime : null
      },
      {
          days : 3,
          startTime : null,
          endTime : null
      },
      {
          days : 4,
          startTime : null,
          endTime : null
      },
      {
          days : 5,
          startTime : null,
          endTime : null
      },
      {
          days : 6,
          startTime : null,
          endTime : null
      }
      ]
        let availabilities = await db.availables.findAll({
          order: [["days", "ASC"]], where: { availableId: request.params.id },
        });
        var n = availabilities.length;
        
let daysToSend = []
for(let eachDay of possibleDaysArray){
    let flag = 0
    for(let eachdata of availabilities){
        if(eachDay.days == eachdata.dataValues.days){
            daysToSend.push({
              days:eachdata.dataValues.days,
              startTime:eachdata.dataValues.startTime,
              endTime:eachdata.dataValues.endTime
            })
            flag = 1;
            break;
        }
    }

    if(flag == 0){
        daysToSend.push(eachDay)
    }
}

console.log("days", daysToSend)
      
     //gallery
        let gallery = await db.clubGallery.findAndCountAll({
          limit: 10,
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where: { club_id: request.params.id },
        });
  
        let sendGalleryEvent = []
        for(let i=0; i < gallery.rows.length ; i++){
          if(gallery.rows[i].dataValues)
          {
          sendGalleryEvent.push({
            filePath : gallery.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : gallery.rows[i].dataValues.attachment.dataValues.id,
            originalName : gallery.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : gallery.rows[i].dataValues.attachment.dataValues.fileName
          })
        }
        }
  
        //User Review
        var review = await db.clubRating.findAndCountAll({
          attributes:["review","rating","createdAt"],
          include:[
            {
              attributes:["id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: ["firstName", "lastName"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
               
              ],
            },
              {
                attributes:["id"],
                required: false,
                model: Models.clubRatingGallery,
                as:'reviewAttachment',
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      /* ["id", "data"],  */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          limit:2,
          distinct: true,
          order: [["id", "DESC"]], 
          where: { club_id:request.params.id ,status:constant.RATING_STATUS.SHOW },
        })
        var reviewCount = review.count
        console.log('SSSSSSSSSS0',review)
    
        
        var clubServices = await db.clubServices.findAndCountAll({
          attributes:["ticketName","description","price"],
          where:{club_id:request.params.id}
        })
        
  
        //more clubs
        if(result)
        {
          if(!authToken==null)
          {
          var bookmarkClubData = await db.saved.findAndCountAll({
            where:{user_id:authToken.userId,type:"club"}
          })
        }

        if(locationclubArr.includes(request.params.id))
        {
          var n = locationclubArr.indexOf(request.params.id)
          console.log(n)
          locationclubArr.splice(n,1)


          console.log('SSSSSSSSSSSSS',locationclubArr)
        }
    
        var moreClubs = await db.clubs.findAll({
          limit: 4,
          attributes: [
            "id",
            "title",
            "description",
            "address",
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
              model: Models.attachments,
            },
          ],
          where:{id:locationclubArr,/* {[Op.notIn]:[request.params.id]} */status:constant.BUSINESS_STATUS.ACCEPT ,category_id:result.dataValues.category_id, active: 1}
         
        });
        var clubData=[]
        if(bookmarkClubData)
        {
        for(let i=0 ;i<moreClubs.length;i++){
         let flag =0
         for(let j=0;j<bookmarkClubData.rows.length;j++){
          
           if( moreClubs[i].dataValues.id ==bookmarkClubData.rows[j].dataValues.savedId)
           {
              clubData.push({
                  id:moreClubs[i].dataValues.id,
                  bookmarked:true,
                  title:moreClubs[i].dataValues.title,
                  description:moreClubs[i].dataValues.description,
                  address:moreClubs[i].dataValues.address,
                  rating:moreClubs[i].dataValues.rating,
                  ratingCount:moreClubs[i].dataValues.ratingCount,
                 attachment:{
                    filePath : moreClubs[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : moreClubs[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : moreClubs[i].dataValues.attachment.dataValues.id,
                    originalName : moreClubs[i].dataValues.attachment.dataValues.originalName,
                    fileName : moreClubs[i].dataValues.attachment.dataValues.fileName
                  } 
              })
              flag = 1;
              break;
           }
         }
         if(flag == 0){
         clubData.push({
           id: moreClubs[i] && moreClubs[i].dataValues.id,
           bookmarked:false,
           title:moreClubs[i].dataValues.title,
                  description:moreClubs[i].dataValues.description,
                  address:moreClubs[i].dataValues.address,
                  rating:moreClubs[i].dataValues.rating,
                  ratingCount:moreClubs[i].dataValues.ratingCount,
                 attachment:{
                    filePath : moreClubs[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : moreClubs[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : moreClubs[i].dataValues.attachment.dataValues.id,
                    originalName : moreClubs[i].dataValues.attachment.dataValues.originalName,
                    fileName : moreClubs[i].dataValues.attachment.dataValues.fileName
                  } 
         })
      }
       }
     }
   
      }
      if(result){
      return h.response({
          responseData:{
            data:result ? result:{},
            user,
            moreReviews: reviewCount > 2 ? true :false,
            review:review.rows,
            reviewCount:review.count,
            dates:daysToSend,
            services:clubServices.rows,
            gallery:sendGalleryEvent,
            galleryCount:gallery.count ,
            moreData:bookmarkClubData ? clubData:moreClubs
          },
          message:"Successfull"
        });
      }
      if(!result){
        return h.response({message:"Enter Valid Id"}).code(400)
      }
      }
      if(request.query.type=='activity'){
      /*   if(authToken!==null)
        {
        bookmarkData = await db.saved.findOne({
          where:{user_id:authToken.userId,savedId:request.params.id,type:request.query.type}
        })
      } */
      var activitylocation = await Models.sequelize.query(`select id from activity where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((activity.long),(activity.lat)) ) < 50000`)
      var locationactivityArr = [];
      for(let eachLocation of activitylocation[0]){
        locationactivityArr.push(eachLocation.id)
      }
      if(authToken!==null)
      {
      var previousBooking = await db.activityBooking.findOne({
        include:[
          {
            required:true,
            model:Models.activityBookingTimings,
            where:{ status:{[Op.eq]:null}}, 
          },
        ],
        where:{user_id:authToken.userId}
       })

       if(previousBooking)
       {
          isRating=true
       }
      }
        
      const vendorId = await db.activity.findOne({where:{id:request.params.id}})
      //host data
      const user = await db.users.findOne({
        attributes:["mobile","countryCode"],
        where:{id:vendorId.dataValues.user_id},
      })
      var subscription = await db.vendorsubscriptionplanBooking.findOne({
        order: [["createdAt", "DESC"]],
        where:{user_id:vendorId.dataValues.user_id,status:'success'}
      })
      console.log(subscription)
      await db.activity.update({
        isOrder:true
      },{
        where:{id:request.params.id}
      })
      
      // if(subscription)
      // {
      //   var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      //   var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
      //   if(currentDate >= expiryplan)
      //   {
      //     await db.activity.update({
      //       isOrder:false
      //     },{
      //       where:{id:request.params.id}
      //     })
         
      //   }
      //   if(currentDate <= expiryplan)
      //   {
      //     await db.activity.update({
      //       isOrder:true
      //     },{
      //       where:{id:request.params.id}
      //     })
      //   }

      // }

      const result = await db.activity.findOne({
          attributes:[ "id","title", "address","description","rating","ratingCount", "bookingUrl","termsAndCondition","category_id","isOrder",
          "cancellationPolicy"],
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
           {
               attributes:["amenitiesItem"], 
              required: false,
              model: db.activityAmenities,
              as:"aminitiesLists",
              through: {attributes: []},
              include:[
                {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      "id",
                      "originalName",
                      "filename",
                    ],
                    model: db.attachments,
                }
              ]
            }, 
          ],
          where: {
            id: request.params.id,
          },
        });
        if(bookmarkData!=null)
        {
          result.bookmarked = true
        }
        if(bookmarkData==null)
        {
          result.bookmarked = false
        }
        
        //event timings
        let possibleDaysArray = [{
          days : 0,
          startTime : null,
          endTime : null
      },
      {
          days : 1,
          startTime : null,
          endTime : null
      },
      {
          days : 2,
          startTime : null,
          endTime : null
      },
      {
          days : 3,
          startTime : null,
          endTime : null
      },
      {
          days : 4,
          startTime : null,
          endTime : null
      },
      {
          days : 5,
          startTime : null,
          endTime : null
      },
      {
          days : 6,
          startTime : null,
          endTime : null
      }
      ]
        let availabilities = await db.activityAvailability.findAll({
          order: [["days", "ASC"]], where: { activity_id: request.params.id },
        });
        var n = availabilities.length;
        
let daysToSend = []
for(let eachDay of possibleDaysArray){
    let flag = 0
    for(let eachdata of availabilities){
        if(eachDay.days == eachdata.dataValues.days){
            daysToSend.push({
              days:eachdata.dataValues.days,
              startTime:eachdata.dataValues.startTime,
              endTime:eachdata.dataValues.endTime
            })
            flag = 1;
            break;
        }
    }

    if(flag == 0){
        daysToSend.push(eachDay)
    }
}

console.log("days", daysToSend)
      
     //gallery
        let gallery = await db.activityGallery.findAndCountAll({
          limit: 10,
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where: { activity_id: request.params.id },
        });
  
        let sendGalleryEvent = []
        for(let i=0; i < gallery.rows.length ; i++){
          if(gallery.rows[i].dataValues)
          {
          sendGalleryEvent.push({
            filePath : gallery.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : gallery.rows[i].dataValues.attachment.dataValues.id,
            originalName : gallery.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : gallery.rows[i].dataValues.attachment.dataValues.fileName
          })
        }
        }
  
        //User Review
        var review = await db.activityRating.findAndCountAll({
          attributes:["review","rating","createdAt"],
          include:[
            {
              attributes:["id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: ["firstName", "lastName"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
               
              ],
            },
              {
                 attributes:["id"],
                required: false,
                model: Models.activityRatingGallery,
                as:'reviewAttachment',
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      /* ["id", "data"], */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          limit:2,
          distinct: true,
          order: [["id", "DESC"]], 
          where: { activity_id:request.params.id ,status:constant.RATING_STATUS.SHOW},
        })
        var reviewCount = review.count
        let reviews = [];
  
  
        //more clubs
        if(result)
        {
          if(!authToken==null)
          {
          var bookmarkAcitivityData = await db.saved.findAndCountAll({
            where:{user_id:authToken.userId,type:"activity"}
          })
        }
        if(locationactivityArr.includes(request.params.id))
        {
          var n = locationactivityArr.indexOf(request.params.id)
          console.log(n)
          locationactivityArr.splice(n,1)


          console.log('SSSSSSSSSSSSS',locationactivityArr)
        }
        
        var moreActivity = await db.activity.findAll({
          limit: 4,
          attributes: [
            "id",
            "title",
            "description",
            "address",
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
              model: Models.attachments,
            },
          ],
          where:{id:locationactivityArr,status:constant.BUSINESS_STATUS.ACCEPT /* {[Op.notIn]:[request.params.id]} */,category_id:result.dataValues.category_id, active:1}
        });
        var activityData=[]
    
      }
      if(result){
        return h.response({
          responseData:{
            data:result ? result:{},
            user,
            isRating: isRating,
            moreReviews: reviewCount > 2 ? true :false,
            review:review.rows,
            reviewCount:review.count,
            dates:daysToSend,
            gallery:sendGalleryEvent,
            galleryCount:gallery.count ,
            moreData:/* bookmarkAcitivityData ? activityData : */ moreActivity
          },
          message:"Successfull"
        });
      }
      if(!result){
        return h.response({message:"Enter valid id"}).code(400)
      }
    
      }
      if(request.query.type=='shops')
      {
        var reslocation = await Models.sequelize.query(`select id from salon where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((salon.long),(salon.lat)) ) < 50000`)
        var locationsalonArr = [];
        for(let eachLocation of reslocation[0]){
          locationsalonArr.push(eachLocation.id)
        }
        const vendorId = await db.salon.findOne({where:{id:request.params.id}})
        //host data
        const user = await db.users.findOne({
          attributes:["mobile","countryCode"],
          where:{id:vendorId.dataValues.user_id},
        })
        var subscription = await db.vendorsubscriptionplanBooking.findOne({
          order: [["createdAt", "DESC"]],
          where:{user_id:vendorId.dataValues.user_id,status:'success'}
        })
        
        if(subscription)
        {
          var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
          console.log('SSSSSSSSSSSS$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$%%%%%%%%%%%%%%%%%%%%%%(((((((((((((((((((((((')
          if(currentDate > expiryplan)
          {
            console.log('SSSSSSSSSSSS$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
            const update = await db.salon.update({
              isOrder:false
            },{
              where:{id:request.params.id}
            })
           
          }
          if(currentDate <= expiryplan)
          {
            console.log('SSSSSSSSSSSS$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$%%%%%%%%%%%%%%%%%%%%%%')
            const update = await db.salon.update({
              isOrder:true
            },{
              where:{id:request.params.id}
            })
          }
  
        }
        const result = await db.salon.findOne({
          attributes:[ "id","title", "address","description","rating","ratingCount","isOrder","serviceAvailableAtHome","serviceAvailableAtShop","termsAndCondition",
          "cancellationPolicy","category_id","showAddress"],
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
           {
               attributes:["amenitiesItem"], 
              required: false,
              model: db.salonAmenities,
              as:"aminitiesLists",
              through: {attributes: []},
              include:[
                {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      "id",
                      "originalName",
                      "filename",
                    ],
                    model: db.attachments,
                }
              ]
            }, 
          ],
          where: {
            id: request.params.id,
          },
        });

        if(bookmarkData!=null)
        {
          result.dataValues.bookmarked = true
        }
        if(bookmarkData==null)
        {
          result.dataValues.bookmarked = false
        }

        
        //event timings
        let possibleDaysArray = [{
          days : 0,
          startTime : null,
          endTime : null
      },
      {
          days : 1,
          startTime : null,
          endTime : null
      },
      {
          days : 2,
          startTime : null,
          endTime : null
      },
      {
          days : 3,
          startTime : null,
          endTime : null
      },
      {
          days : 4,
          startTime : null,
          endTime : null
      },
      {
          days : 5,
          startTime : null,
          endTime : null
      },
      {
          days : 6,
          startTime : null,
          endTime : null
      }
      ]
        let availabilities = await db.salonAvailability.findAll({
          order: [["days", "ASC"]], where: { salon_id: request.params.id },
        });
        var n = availabilities.length;
        
let daysToSend = []
for(let eachDay of possibleDaysArray){
    let flag = 0
    for(let eachdata of availabilities){
        if(eachDay.days == eachdata.dataValues.days){
            daysToSend.push({
              days:eachdata.dataValues.days,
              startTime:eachdata.dataValues.startTime,
              endTime:eachdata.dataValues.endTime
            })
            flag = 1;
            break;
        }
    }

    if(flag == 0){
        daysToSend.push(eachDay)
    }
}


     //gallery
        let gallery = await db.salonGallery.findAndCountAll({
          limit: 10,
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where: { salon_id: request.params.id },
        });
  
        let sendGalleryEvent = []
        for(let i=0; i < gallery.rows.length ; i++){
          if(gallery.rows[i].dataValues)
          {
          sendGalleryEvent.push({
            filePath : gallery.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : gallery.rows[i].dataValues.attachment.dataValues.id,
            originalName : gallery.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : gallery.rows[i].dataValues.attachment.dataValues.fileName
          })
        }
        }
  
        //User Review
        var review = await db.salonRating.findAndCountAll({
          attributes:["review","rating","createdAt"],
          include:[
            {
              attributes:["id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: ["firstName", "lastName"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
               
              ],
            },
              {
                 attributes:["id"],
                required: false,
                model: Models.salonRatingGallery,
                as:'reviewAttachment',
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      /* ["id", "data"], */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          limit:2,
          distinct: true,
          order: [["id", "DESC"]], 
          where: { salon_id:request.params.id ,status:constant.RATING_STATUS.SHOW},
        })
        var reviewCount = review.count
        let reviews = [];
  
        var salonServices = await db.salonServices.findAndCountAll({
          attributes:["ticketName","description","price"],
          where:{salon_id:request.params.id}
        })
        
        //more salon
        if(result)
        {
          if(!authToken==null)
          {
          var bookmarkAcitivityData = await db.saved.findAndCountAll({
            where:{user_id:authToken.userId,type:"salon"}
          })
        }
        if(locationsalonArr.includes(request.params.id))
        {
          var n = locationsalonArr.indexOf(request.params.id)
          console.log(n)
          locationsalonArr.splice(n,1)


          console.log('SSSSSSSSSSSSS',locationsalonArr)
        }
        var moresalon = await db.salon.findAll({
          limit: 4,
          attributes: [
            "id",
            "title",
            "description",
            "address",
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
              model: Models.attachments,
            },
          ],
          where:{id:locationsalonArr,status:constant.BUSINESS_STATUS.ACCEPT /* {[Op.notIn]:[request.params.id]} */,category_id:result.dataValues.category_id}
        });
        var salonData=[]
    
      }
      if(result){
        console.log('SSSSSS',result)
        return h.response({
          responseData:{
            data:result ? result:{},
            user,
            moreReviews: reviewCount > 2 ? true :false,
            review:review.rows,
            reviewCount:review.count,
            dates:daysToSend,
            services:salonServices.rows,
            gallery:sendGalleryEvent,
            galleryCount:gallery.count ,
            moreData:/* bookmarkAcitivityData ? salonData : */ moresalon
          },
          message:"Successfull"
        });
      }
      if(!result){
        return h.response({message:"Enter valid id"}).code(400)
      }
      }
      if(request.query.type=='restaurant'){
        var reslocation = await Models.sequelize.query(`select id from restaurant where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((restaurant.long),(restaurant.lat)) ) < 50000`)
        var locationresArr = [];
        for(let eachLocation of reslocation[0]){
          locationresArr.push(eachLocation.id)
        }

      const vendorId = await db.restaurant.findOne({where:{id:request.params.id}})
      //host data
      const user = await db.users.findOne({
      attributes:["mobile","countryCode"],
        where:{id:vendorId.dataValues.user_id},
      })
      var subscription = await db.vendorsubscriptionplanBooking.findOne({
        order: [["createdAt", "DESC"]],
        where:{user_id:vendorId.dataValues.user_id,status:'success'}
      })
      
      if(subscription)
      {
        var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
        console.log('SSSSSSSSSSSSEEEEEEEEEEEEEEEEE$$$$$$$$$$$$$$$$$$$$$$$$$@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        console.log('sssssssssssssss',currentDate)
        if(currentDate > expiryplan)
        {
          console.log('SSSSSSSSSSSSEEEEEEEEEEEEEEEEE$$$$$$$$$$$$$$$$$$$$$$$$$')
          const update = await db.restaurant.update({
            isOrder:false
          },{
            where:{id:request.params.id}
          })
         
        }
        if(currentDate <= expiryplan)
        {
          console.log('SSSSSSSSSSSSEEEEEEEEEEEEEEEEE#######################')
          const update = await db.restaurant.update({
            isOrder:true
          },{
            where:{id:request.params.id}
          })
        }

      }
        const result = await db.restaurant.findOne({
          attributes:[ "id","title", "address","description","rating","ratingCount","isOrder","termsAndCondition","category_id",
          "cancellationPolicy", "serviceType"],
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
           {
               attributes:["amenitiesItem"], 
              required: false,
              model: db.restaurantAmenities,
              as:"aminitiesLists",
              through: {attributes: []},
              include:[
                {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`aminitiesLists->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      "id",
                      "originalName",
                      "filename",
                    ],
                    model: db.attachments,
                }
              ]
            }, 
       
           
          ],
         
          where: {
            id: request.params.id,
          },
        });

        if(bookmarkData!==null)
        {
          result.bookmarked = true
        }
        if(bookmarkData==null)
        {
          console.log('SSSSSSSSSSSSSSSDDDDDDDDDDD')
          result.bookmarked = false
        }
        
  

        //club timings
        let possibleDaysArray = [{
          days : 0,
          startTime : null,
          endTime : null
      },
      {
          days : 1,
          startTime : null,
          endTime : null
      },
      {
          days : 2,
          startTime : null,
          endTime : null
      },
      {
          days : 3,
          startTime : null,
          endTime : null
      },
      {
          days : 4,
          startTime : null,
          endTime : null
      },
      {
          days : 5,
          startTime : null,
          endTime : null
      },
      {
          days : 6,
          startTime : null,
          endTime : null
      }
      ]
        let availabilities = await db.restaurantAvailability.findAll({
          order: [["days", "ASC"]], where: { restaurant_id: request.params.id },
        });
        var n = availabilities.length;
        
let daysToSend = []
for(let eachDay of possibleDaysArray){
    let flag = 0
    for(let eachdata of availabilities){
        if(eachDay.days == eachdata.dataValues.days){
            daysToSend.push({
              days:eachdata.dataValues.days,
              startTime:eachdata.dataValues.startTime,
              endTime:eachdata.dataValues.endTime
            })
            flag = 1;
            break;
        }
    }

    if(flag == 0){
        daysToSend.push(eachDay)
    }
}

console.log("days", daysToSend)
      
     //gallery
        let gallery = await db.restaurantGallery.findAndCountAll({
          limit: 10,
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where: { restaurant_id: request.params.id },
        });
  
        let sendGalleryEvent = []
        for(let i=0; i < gallery.rows.length ; i++){
          if(gallery.rows[i].dataValues)
          {
          sendGalleryEvent.push({
            filePath : gallery.rows[i].dataValues.attachment.dataValues.filePath,
            thumbnailPath : gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
            id : gallery.rows[i].dataValues.attachment.dataValues.id,
            originalName : gallery.rows[i].dataValues.attachment.dataValues.originalName,
            fileName : gallery.rows[i].dataValues.attachment.dataValues.fileName
          })
        }
        }
  
        //User Review
        var review = await db.restaurantRating.findAndCountAll({
          attributes:["review","rating","createdAt"],
          include:[
            {
              attributes:["id"],
              required: false,
              model: Models.users,
              include: [
                {
                  attributes: ["firstName", "lastName"],
                  required: false,
                  model: Models.userProfiles,
                  include: [
                    {
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
                        ["id", "data"],
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                },
               
              ],
            },
              {
                attributes:["id"],
                required: false,
                model: Models.restaurantRatingGallery,
                as:'reviewAttachment',
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      /* ["id", "data"],  */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          limit:2,
          distinct: true,
          order: [["id", "DESC"]], 
          where: { restaurant_id:request.params.id,status:constant.RATING_STATUS.SHOW },
        })
        var reviewCount = review.count
        console.log('SSSSSSSSSS0',review)
      
        
  
        //more clubs
        if(result)
        {
          if(!authToken==null)
          {
          var bookmarkRestaurantData = await db.saved.findAndCountAll({
            where:{user_id:authToken.userId,type:"restaurant"}
          })
        }
        console.log('SSDDDDDDDDDDDDDDD',locationresArr)

        if(locationresArr.includes(request.params.id))
        {
          var n = locationresArr.indexOf(request.params.id)
          console.log(n)
          locationresArr.splice(n,1)


          console.log('SSSSSSSSSSSSS',locationresArr)
        }
        console.log('SSDDDDDDDDDDDDDDD',locationresArr)
    
        var moreClubs = await db.restaurant.findAll({
          limit: 4,
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "rating",
            "ratingCount",
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
              model: Models.attachments,
            },
          ],
          where:{id:locationresArr,status:constant.BUSINESS_STATUS.ACCEPT /* {[Op.notIn]:[request.params.id]} */,category_id:result.dataValues.category_id}
         
        });
        var restaurantData=[]
        if(bookmarkRestaurantData)
        {
        for(let i=0 ;i<moreClubs.length;i++){
         let flag =0
         for(let j=0;j<bookmarkRestaurantData.rows.length;j++){
          
           if( moreClubs[i].dataValues.id ==bookmarkRestaurantData.rows[j].dataValues.savedId)
           {
              restaurantData.push({
                  id:mrestaurants[i].dataValues.id,
                  bookmarked:true,
                  title:moreClubs[i].dataValues.title,
                  description:moreClubs[i].dataValues.description,
                  address:moreClubs[i].dataValues.address,
                  rating:moreClubs[i].dataValues.rating,
                  ratingCount:moreClubs[i].dataValues.ratingCount,
                 attachment:{
                    filePath : moreClubs[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : moreClubs[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : moreClubs[i].dataValues.attachment.dataValues.id,
                    originalName : moreClubs[i].dataValues.attachment.dataValues.originalName,
                    fileName : moreClubs[i].dataValues.attachment.dataValues.fileName
                  } 
              })
              flag = 1;
              break;
           }
         }
         if(flag == 0){
         restaurantData.push({
           id: moreClubs[i] && moreClubs[i].dataValues.id,
           bookmarked:false,
           title:moreClubs[i].dataValues.title,
                  description:moreClubs[i].dataValues.description,
                  address:moreClubs[i].dataValues.address,
                  rating:moreClubs[i].dataValues.rating,
                  ratingCount:moreClubs[i].dataValues.ratingCount,
                 attachment:{
                    filePath : moreClubs[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : moreClubs[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : moreClubs[i].dataValues.attachment.dataValues.id,
                    originalName : moreClubs[i].dataValues.attachment.dataValues.originalName,
                    fileName : moreClubs[i].dataValues.attachment.dataValues.fileName
                  } 
         })
      }
       }
     }
   
      }
      if(result){
      return h.response({
          responseData:{
            data:result ? result:{},
            user,
            moreReviews: reviewCount > 2 ? true :false,
            review:review.rows,
            reviewCount:review.count,
            dates:daysToSend,
            gallery:sendGalleryEvent,
            galleryCount:gallery.count ,
            moreData:bookmarkRestaurantData ? restaurantData:moreClubs
          },
          message:"Successfull"
        });
      }
      if(!result){
        return h.response({message:"Enter Valid Id"}).code(400)
      }
      }
      if(request.query.type=='blog')
      {
        const blogDetails = await db.blog.findOne({
          attributes: [
            "id",
            "title",
            "description",
            "publishedDate",
            "content"
          ],
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
              required: true,
              model: Models.userProfiles,
              attributes: [
                "firstName"
              ],
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
          where: { id: request.params.id },
        });

        if(bookmarkData!==null)
        {
          blogDetails.dataValues.bookmarked = true
        }
        if(bookmarkData==null)
        {
          blogDetails.dataValues.bookmarked = false
        }
       

        if(blogDetails){
          return h.response({
              responseData:{
                data:blogDetails ? blogDetails:{},
              },
              message:"Successfull"
            });
          }

        
      }
    } catch (e) {
      console.log("%%%%%%%get", e);
      return e;
    }
  };

  deleteEvent = async (req) => {
    try {
      // put your delete Event Logic here
      const data = await db.event.destroy({
        where: { id: req.params.id },
      });
      return "succesfull";
    } catch (e) {
      return e;
    }
  };

  updateEvent = async (req, h) => {
    try {
      // put your update Blog Logic here
      var data = req.payload;
      const edit = await db.event.update(
        {
          title: data.title,
          description: data.description,
          price: data.price,
          address: data.address,
          startTime: data.startTime,
          endTime: data.endTime,
          capacity: data.capacity,
          category: data.category,
          availabile: data.available,
          featured: data.featured,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      return edit;
    } catch (e) {
      console.log("SSSSSSSSSSSSSSS", e);
      return e;
    }
  };

  savedEvent = async (request, h) => {
    try {
      var authToken = request.auth.credentials.userData
      if(request.payload.type=='event')
      {
        if(request.payload.bookmarked==true)
        { 
          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})
          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
      if(request.payload.type=='club'){
        if(request.payload.bookmarked==true)
        { 
          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})
          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
      if(request.payload.type=='activity'){
        if(request.payload.bookmarked==true)
        { 

          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})

      
          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
      if(request.payload.type=='shops'){
        if(request.payload.bookmarked==true)
        { 
          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})

          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
      if(request.payload.type=="restaurant")
      {
        if(request.payload.bookmarked==true)
        { 
          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})

       
          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
      if(request.payload.type=='blog')
      {
        if(request.payload.bookmarked==true)
        { 
          const already = await db.saved.findOne({
            where:{
              user_id:authToken.userId,
              savedId: request.payload.id,
              type:request.payload.type}
          })
          if(!already)
          {
          const saved = await db.saved.create({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          })
        }
          const saved = await db.saved.update({
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          },{where:{
            user_id:authToken.userId,
            savedId: request.payload.id,
            type:request.payload.type
          }})

       
          return h.response({ 
            message: "Saved Succesfully",
          });
        }
        if(request.payload.bookmarked==false){
          const unsaved =await db.saved.destroy({
            where:{savedId:request.payload.id}
          })
          return h.response({ 
            message: "Unsaved",
          });
        }
      }
     
    } catch (e) {
      console.log("SSSSSSSSSSSSSSS", e);
      return e;
    }
  };

  getsavedEvent = async (request, h) => {
    try {
      var authToken = request.auth.credentials.userData
      const query = request.query;
      const page = query.page ? query.page : 1;
      var data =[]
      if(request.query.type=='event'){
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "description",
              "address",
              "startTime",
              "endTime",
              "startDate",
              "endDate",
              "category"
          ],
              model:Models.event,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`event->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`event->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })

        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);

      for(let i=0;i<saved.length;i++)
        {
            data.push({
                id:saved[i].dataValues.event.dataValues.id,
                title:saved[i].dataValues.event.dataValues.title,
                bookmarked:true,
                description:saved[i].dataValues.event.dataValues.description,
                address:saved[i].dataValues.event.dataValues.address,
                startDate:saved[i].dataValues.event.dataValues.startDate,
                endDate:saved[i].dataValues.event.dataValues.endDate,
                startTime:saved[i].dataValues.event.dataValues.startTime,
                rating:saved[i].dataValues.event.dataValues.rating,
                ratingCount:saved[i].dataValues.event.dataValues.ratingCount,
                attachment:saved[i].dataValues.event.dataValues.attachment
            })
          }
      }
      if(request.query.type=='club')
      {
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
            ],
              model:Models.clubs,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`club->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`club->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })
        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);
        for(let i=0;i<saved.length;i++)
        {
            data.push({
                id:saved[i].dataValues.club.dataValues.id,
                bookmarked:true,
                title:saved[i].dataValues.club.dataValues.title,
                description:saved[i].dataValues.club.dataValues.description,
                address:saved[i].dataValues.club.dataValues.address,
                startDate:saved[i].dataValues.club.dataValues.startDate,
                endDate:saved[i].dataValues.club.dataValues.endDate,
                startTime:saved[i].dataValues.club.dataValues.startTime,
                rating:saved[i].dataValues.club.dataValues.rating,
                ratingCount:saved[i].dataValues.club.dataValues.ratingCount,
                attachment:saved[i].dataValues.club.dataValues.attachment
            })
          }
      }
      if(request.query.type=='restaurant')
      {
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
              "serviceType"
            ],
              model:Models.restaurant,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`restaurant->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`restaurant->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })
        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);
        for(let i=0;i<saved.length;i++)
        {
            data.push({
                id:saved[i].dataValues.restaurant.dataValues.id,
                bookmarked:true,
                title:saved[i].dataValues.restaurant.dataValues.title,
                description:saved[i].dataValues.restaurant.dataValues.description,
                address:saved[i].dataValues.restaurant.dataValues.address,
                startDate:saved[i].dataValues.restaurant.dataValues.startDate,
                endDate:saved[i].dataValues.restaurant.dataValues.endDate,
                startTime:saved[i].dataValues.restaurant.dataValues.startTime,
                rating:saved[i].dataValues.restaurant.dataValues.rating,
                serviceType:saved[i].dataValues.restaurant.dataValues.serviceType,
                ratingCount:saved[i].dataValues.restaurant.dataValues.ratingCount,
                attachment:saved[i].dataValues.restaurant.dataValues.attachment
            })
          }
      }
      if(request.query.type=="activity")
      {
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
            ],
              model:Models.activity,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`activity->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`activity->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })
        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);
        for(let i=0;i<saved.length;i++)
        {
            data.push({
                id:saved[i].dataValues.activity.dataValues.id,
                bookmarked:true,
                title:saved[i].dataValues.activity.dataValues.title,
                description:saved[i].dataValues.activity.dataValues.description,
                address:saved[i].dataValues.activity.dataValues.address,
                startDate:saved[i].dataValues.activity.dataValues.startDate,
                endDate:saved[i].dataValues.activity.dataValues.endDate,
                startTime:saved[i].dataValues.activity.dataValues.startTime,
                rating:saved[i].dataValues.activity.dataValues.rating,
                ratingCount:saved[i].dataValues.activity.dataValues.ratingCount,
                attachment:saved[i].dataValues.activity.dataValues.attachment
            })
          }
      }
      if(request.query.type=='shops')
      {
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
            ],
              model:Models.salon,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`salon->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`salon->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })
        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);
        console.log('SSSSSSSSSSS',saved)
        for(let i=0;i<saved.length;i++)
        {
          console.log('ssssss',saved[i].dataValues.salon)
            data.push({
                id:saved[i].dataValues.salon.dataValues.id,
                bookmarked:true,
                title:saved[i].dataValues.salon.dataValues.title,
                description:saved[i].dataValues.salon.dataValues.description,
                address:saved[i].dataValues.salon.dataValues.address,
                startDate:saved[i].dataValues.salon.dataValues.startDate,
                endDate:saved[i].dataValues.salon.dataValues.endDate,
                startTime:saved[i].dataValues.salon.dataValues.startTime,
                rating:saved[i].dataValues.salon.dataValues.rating,
                ratingCount:saved[i].dataValues.salon.dataValues.ratingCount,
                attachment:saved[i].dataValues.salon.dataValues.attachment
            })
          }

      }
      if(request.query.type=='blog')
      {
        var saved = await db.saved.findAll({
          include:[{
            attributes: [
              "id",
              "title",
              "description",
              "publishedDate",
            ],
              model:Models.blog,
              include:[{
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`blog->attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`blog->attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: Models.attachments,
                }], 
          }],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where:{type:request.query.type,user_id:authToken.userId}
        })
        var totalPages = await UniversalFunctions.getTotalPages(saved.length, 10);
        for(let i=0;i<saved.length;i++)
        {
            data.push({
                id:saved[i].dataValues.blog.dataValues.id,
                bookmarked:true,
                title:saved[i].dataValues.blog.dataValues.title,
                description:saved[i].dataValues.blog.dataValues.description,
                publishedDate:saved[i].dataValues.blog.dataValues.publishedDate,
                attachment:saved[i].dataValues.blog.dataValues.attachment
            })
          }
      }

      return h.response({
        responseData:{
          data,
          totalRecords: saved.length,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: saved.length < 10 ? 0 : 1,
        },
      });
    
    }
     catch (e) {
      console.log("SSSSSSSSSSSSbookmark", e);
    }
  }; 

  getGallery = async (request, h) => {
    try {
      var totalPages;
      let sendGalleryEvent = [];
      var gallery;
      const query = request.query;
      const page = query.page ? query.page : 1;
      if (query.type == "event") {
        gallery = await db.eventGallery.findAndCountAll({
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { event_id: query.id },
        });

        for (let i = 0; i < gallery.rows.length; i++) {
          console.log("$$$$$$$$$$$$$$$$$$", gallery.rows[i].dataValues);
          if (gallery.rows[i].dataValues) {
            sendGalleryEvent.push({
              filePath:
                gallery.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: gallery.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                gallery.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                gallery.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        totalPages = await UniversalFunctions.getTotalPages(gallery.count, 10);
      }
      if (query.type == "club") {
        gallery = await db.clubGallery.findAndCountAll({
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { club_id: query.id },
        });

        for (let i = 0; i < gallery.rows.length; i++) {
          console.log("$$$$$$$$$$$$$$$$$$", gallery.rows[i].dataValues);
          if (gallery.rows[i].dataValues) {
            sendGalleryEvent.push({
              filePath:
                gallery.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: gallery.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                gallery.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                gallery.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        totalPages = await UniversalFunctions.getTotalPages(gallery.count, 10);
      }
      if(query.type=='activity'){
        gallery = await db.activityGallery.findAndCountAll({
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { activity_id: query.id },
        });

        for (let i = 0; i < gallery.rows.length; i++) {
          if (gallery.rows[i].dataValues) {
            sendGalleryEvent.push({
              filePath:
                gallery.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: gallery.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                gallery.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                gallery.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        totalPages = await UniversalFunctions.getTotalPages(gallery.count, 10);
      }
      if(query.type=='shops'){
        gallery = await db.salonGallery.findAndCountAll({
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { salon_id: query.id },
        });

        for (let i = 0; i < gallery.rows.length; i++) {
          if (gallery.rows[i].dataValues) {
            sendGalleryEvent.push({
              filePath:
                gallery.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: gallery.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                gallery.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                gallery.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        totalPages = await UniversalFunctions.getTotalPages(gallery.count, 10);
      }
      if(query.type=='restaurant')
      {
        gallery = await db.restaurantGallery.findAndCountAll({
          attributes: [],
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
                "id",
                "originalName",
                "fileName",
              ],

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { restaurant_id: query.id },
        });

        for (let i = 0; i < gallery.rows.length; i++) {
          if (gallery.rows[i].dataValues) {
            sendGalleryEvent.push({
              filePath:
                gallery.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                gallery.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: gallery.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                gallery.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                gallery.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        totalPages = await UniversalFunctions.getTotalPages(gallery.count, 10);
      }
    
      return h.response({
        responseData: {
          data: sendGalleryEvent,
          totalRecords: gallery.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: gallery.rows.length < 10 ? 0 : 1,
        },
        message: "Successfull",
      });
    
   
    } catch (e) {
      console.log("SSSSSSSSS", e);
    }
  };

  getCategoryDetails = async (request, h) => {
    try {
      var data = request.query;
      var authToken=null;
      authToken= request.auth.credentials && request.auth.credentials.userData 
      if(authToken!=null)
      {
      var bookmarkData = await db.saved.findAndCountAll({
        where:{user_id:authToken.userId,type:data.type}
      })
    }
      var trending=[]
      var now = new Date()
      if (data.type == "event") {
        var location = await Models.sequelize.query(`select id from events where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((events.long),(events.lat)) ) < 50000 `)
        var locationArr = [];
        for(let eachLocation of location[0]){
          locationArr.push(eachLocation.id)
        }
        var featured = await db.event.findAndCountAll({
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "startTime",
            "endDate",
            "category",
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
            {
              attributes:["categoryName"],
                model:Models.eventCategory  ,
                as:'businessCategory',
                required:false          
              },
          ],
          where: {id:locationArr ,featured: 1 ,status:constant.BUSINESS_STATUS.ACCEPT ,active:true,endDate:{[Op.gt]:now}},
        });
        var category = await db.eventCategory.findAndCountAll({
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
        var sendCategory = [];
        for (let i = 0; i < category.rows.length; i++) {
          if (category.rows[i].dataValues) {
            sendCategory.push({
              categoryId: category.rows[i].dataValues.id,
              categoryName: category.rows[i].dataValues.categoryName,
              filePath:
                category.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                category.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: category.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                category.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                category.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        var event = await db.event.findAndCountAll({
          limit: 5,
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "startTime",
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
          where:{id:locationArr,isTrending: 1 ,status:constant.BUSINESS_STATUS.ACCEPT ,active:true,endDate:{[Op.gt]:now}}
        });
        if(event)
        {
        if(bookmarkData)
        {
         for(let i=0 ;i<event.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
             if( event.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
             {
                trending.push({
                    id:event.rows[i].dataValues.id,
                    bookmarked:true,
                    title:event.rows[i].dataValues.title,
                    description:event.rows[i].dataValues.description,
                    address:event.rows[i].dataValues.address,
                    startDate:event.rows[i].dataValues.startDate,
                    endDate:event.rows[i].dataValues.endDate,
                    startTime:event.rows[i].dataValues.startTime,
                    rating:event.rows[i].dataValues.rating,
                    ratingCount:event.rows[i].dataValues.ratingCount,
                    showAddress:event.rows[i].dataValues.showAddress,
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
           trending.push({
             id: event.rows[i] && event.rows[i].dataValues.id,
             bookmarked:false,
             title:event.rows[i].dataValues.title,
                    description:event.rows[i].dataValues.description,
                    address:event.rows[i].dataValues.address,
                    startDate:event.rows[i].dataValues.startDate,
                    endDate:event.rows[i].dataValues.endDate,
                    startTime:event.rows[i].dataValues.startTime,
                    rating:event.rows[i].dataValues.rating,
                    ratingCount:event.rows[i].dataValues.ratingCount,
                    showAddress:event.rows[i].dataValues.showAddress,
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
        if(!bookmarkData)
        {
          trending=event.rows
        }
        
      }

        
        
      }

      if (data.type == "club") {
        var clublocation = await Models.sequelize.query(`select id from clubs where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((clubs.long),(clubs.lat)) ) < 50000`)
        var locationclubArr = [];
        for(let eachLocation of clublocation[0]){
          locationclubArr.push(eachLocation.id)
        }
        var featured = await db.clubs.findAndCountAll({
          attributes: ["id", "title", "address", "description"],
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
                model:Models.clubCategory  ,
                as:'businessCategory',
                required:false          
              },
          ],
          where: { id:locationclubArr ,featured: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true},
        });

        var category = await db.clubCategory.findAndCountAll({
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

        var sendCategory = [];
        for (let i = 0; i < category.rows.length; i++) {
          if (category.rows[i].dataValues) {
            sendCategory.push({
              categoryId: category.rows[i].dataValues.id,
              categoryName: category.rows[i].dataValues.categoryName,
              filePath:
                category.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                category.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: category.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                category.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                category.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        var club = await db.clubs.findAndCountAll({
          limit: 10,
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
              model: Models.attachments,
            },
          ],
          where:{id:locationclubArr ,isTrending: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true}
        });

        if(club)
        {
        if(bookmarkData)
        {
        for(let i=0 ;i<club.rows.length;i++){
         let flag =0
         for(let j=0;j<bookmarkData.rows.length;j++){
          
           if( club.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
           {
              trending.push({
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
         trending.push({
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
        if(!bookmarkData)
        {
          trending=club.rows
        }
   }
      }

      if(data.type=="activity"){
        var activitylocation = await Models.sequelize.query(`select id from activity where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((activity.long),(activity.lat)) ) < 50000`)
        var locationactivityArr = [];
        for(let eachLocation of activitylocation[0]){
          locationactivityArr.push(eachLocation.id)
        }

        var featured = await db.activity.findAndCountAll({
          attributes: ["id", "title", "address", "description"],
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
                model:Models.activityCategory  ,
                as:'businessCategory',
                required:false          
              },
          ],
          where: {id:locationactivityArr , featured: 1,status:constant.BUSINESS_STATUS.ACCEPT ,active:true},
        });

        var category = await db.activityCategory.findAndCountAll({
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

        var sendCategory = [];
        for (let i = 0; i < category.rows.length; i++) {
          if (category.rows[i].dataValues) {
            sendCategory.push({
              categoryId: category.rows[i].dataValues.id,
              categoryName: category.rows[i].dataValues.categoryName,
              filePath:
                category.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                category.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: category.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                category.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                category.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        var activity = await db.activity.findAndCountAll({
          limit: 10,
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
              model: Models.attachments,
            },
          ],
          where:{id:locationactivityArr ,isTrending: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true}
        });
        if(activity)
        {
        if(bookmarkData)
        {
          console.log('SSSSSSSSSSS',bookmarkData.rows.length)
         for(let i=0 ;i<activity.rows.length;i++){
           let flag =0
           for(let j=0;j<bookmarkData.rows.length;j++){
            
             if( activity.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
             {
                trending.push({
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
           trending.push({
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
        if(!bookmarkData)
        {
          trending=activity.rows
        }
       }
   
      }

      if(data.type=='shops'){
        var reslocation = await Models.sequelize.query(`select id from salon where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((salon.long),(salon.lat)) ) < 50000`)
        var locationsalonArr = [];
        for(let eachLocation of reslocation[0]){
          locationsalonArr.push(eachLocation.id)
        }

        var featured = await db.salon.findAndCountAll({
          attributes: ["id", "title", "address", "description"],
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
                model:Models.salonCategory  ,
                as:'businessCategory',
                required:false          
              },
          ],
          where: {id:locationsalonArr, featured: 1,status:constant.BUSINESS_STATUS.ACCEPT ,active:true},
        });

        var category = await db.salonCategory.findAndCountAll({
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

        var sendCategory = [];
        for (let i = 0; i < category.rows.length; i++) {
          if (category.rows[i].dataValues) {
            sendCategory.push({
              categoryId: category.rows[i].dataValues.id,
              categoryName: category.rows[i].dataValues.categoryName,
              filePath:
                category.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                category.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: category.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                category.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                category.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        var shops = await db.salon.findAndCountAll({
          limit: 10,
          attributes: [
            "id",
            "title",
            "address",
            "description",
            "rating",
            "ratingCount",
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
          where:{id:locationsalonArr, isTrending: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true}
        });
        console.log('ss',shops)
        if(shops)
        {
        if(bookmarkData)
        {
        for(let i=0 ;i<shops.rows.length;i++){
         let flag =0
         for(let j=0;j<bookmarkData.rows.length;j++){
          
           if( shops.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
           {
              trending.push({
                  id:shops.rows[i].dataValues.id,
                  bookmarked:true,
                  title:shops.rows[i].dataValues.title,
                  description:shops.rows[i].dataValues.description,
                  address:shops.rows[i].dataValues.address,
                  rating:shops.rows[i].dataValues.rating,
                  ratingCount:shops.rows[i].dataValues.ratingCount,
                  showAddress:shops.rows[i].dataValues.showAddress,
                 attachment:{
                    filePath : shops.rows[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : shops.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : shops.rows[i].dataValues.attachment.dataValues.id,
                    originalName : shops.rows[i].dataValues.attachment.dataValues.originalName,
                    fileName : shops.rows[i].dataValues.attachment.dataValues.fileName
                  } 
              })
              flag = 1;
              break;
           }
         }
         if(flag == 0){
         trending.push({
           id: shops.rows[i] && shops.rows[i].dataValues.id,
           bookmarked:false,
           title:shops.rows[i].dataValues.title,
                  description:shops.rows[i].dataValues.description,
                  address:shops.rows[i].dataValues.address,
                  rating:shops.rows[i].dataValues.rating,
                  ratingCount:shops.rows[i].dataValues.ratingCount,
                  showAddress:shops.rows[i].dataValues.showAddress,
                 attachment:{
                    filePath : shops.rows[i].dataValues.attachment.dataValues.filePath,
                    thumbnailPath : shops.rows[i].dataValues.attachment.dataValues.thumbnailPath,
                    id : shops.rows[i].dataValues.attachment.dataValues.id,
                    originalName : shops.rows[i].dataValues.attachment.dataValues.originalName,
                    fileName : shops.rows[i].dataValues.attachment.dataValues.fileName
                  } 
         })
      }
       }
     }
      if(!bookmarkData)
      {
        trending=shops.rows
      }
   }
      }

      if(data.type=='restaurant')
      {
        var reslocation = await Models.sequelize.query(`select id from restaurant where st_distance_sphere(Point((${request.query.long}),(${request.query.lat})), Point((restaurant.long),(restaurant.lat)) ) < 50000`)
        var locationresArr = [];
        for(let eachLocation of reslocation[0]){
          locationresArr.push(eachLocation.id)
        }
        var featured = await db.restaurant.findAndCountAll({
          attributes: ["id", "title", "address", "description","serviceType"],
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
                model:Models.restaurantCategory  ,
                as:'businessCategory',
                required:false          
              },
          ],
          where: {id:locationresArr, featured: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true},
        });

        var category = await db.restaurantCategory.findAndCountAll({
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

        var sendCategory = [];
        for (let i = 0; i < category.rows.length; i++) {
          if (category.rows[i].dataValues) {
            sendCategory.push({
              categoryId: category.rows[i].dataValues.id,
              categoryName: category.rows[i].dataValues.categoryName,
              filePath:
                category.rows[i].dataValues.attachment.dataValues.filePath,
              thumbnailPath:
                category.rows[i].dataValues.attachment.dataValues.thumbnailPath,
              id: category.rows[i].dataValues.attachment.dataValues.id,
              originalName:
                category.rows[i].dataValues.attachment.dataValues.originalName,
              fileName:
                category.rows[i].dataValues.attachment.dataValues.fileName,
            });
          }
        }

        var restaurant = await db.restaurant.findAndCountAll({
          limit: 10,
          attributes: [
            "id",
            "title",
            "address",
            "description",
            "rating",
            "ratingCount",
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
              model: Models.attachments,
            },
          ],
          where:{id:locationresArr ,isTrending: 1 ,status:constant.BUSINESS_STATUS.ACCEPT,active:true}
        });
        if(restaurant)
          {
          if(bookmarkData)
          {
            console.log('SSSSSSSSSSS',bookmarkData.rows.length)
          for(let i=0 ;i<restaurant.rows.length;i++){
            let flag =0
            for(let j=0;j<bookmarkData.rows.length;j++){
              
              if( restaurant.rows[i].dataValues.id ==bookmarkData.rows[j].dataValues.savedId)
              {
                  trending.push({
                      id:restaurant.rows[i].dataValues.id,
                      bookmarked:true,
                      title:restaurant.rows[i].dataValues.title,
                      description:restaurant.rows[i].dataValues.description,
                      address:restaurant.rows[i].dataValues.address,
                      rating:restaurant.rows[i].dataValues.rating,
                      serviceType:restaurant.rows[i].dataValues.serviceType,
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
            trending.push({
              id: restaurant.rows[i] && restaurant.rows[i].dataValues.id,
              bookmarked:false,
              title:restaurant.rows[i].dataValues.title,
                      description:restaurant.rows[i].dataValues.description,
                      address:restaurant.rows[i].dataValues.address,
                      rating:restaurant.rows[i].dataValues.rating,
                      serviceType:restaurant.rows[i].dataValues.serviceType,
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
          if(!bookmarkData)
          {
            trending=restaurant.rows
          }
          } 

      }

      return h.response({
        responseData: {
          featured: featured.rows,
          categories: sendCategory,
          trending,
        },
        message: "Successfull",
      });
    } catch (e) {
      console.log("SSSSSSSSSSSSS", e);
    }
  };

  getEventHost = async (request, h) => {
    try {
      const authToken = request.auth.credentials ? request.auth.credentials.userData:'';
     
      if(authToken){
      const follow = await db.hostFollow.findOne({
        attributes:["follow"],
        where:{user_id:authToken.userId}
      })
     /*  var update = follow ? follow.dataValues.follow:'' */
      
      if(follow)
      {
        const update =await db.userProfiles.update({
          isFollowing:true
        },{
          where:{user_id:request.query.user_id}
        })
      }
      if(!follow){
        const update =await db.userProfiles.update({
          isFollowing:false
        },{
          where:{user_id:request.query.user_id}
        })
      }
    }
    if(!authToken){
      const update =await db.userProfiles.update({
        isFollowing:false
      },{
        where:{user_id:request.query.user_id}
      })
    }


      const host = await db.event.findOne({
        attributes: [],
        include: [
          {
            attributes: ["mobile"],
            required: false,
            model: Models.users,
            include: [
              {
                attributes: ["firstName", "lastName", "email","description","followers","isFollowing"],
                required: false,
                model: Models.userProfiles,
                include: [
                  {
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
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              },
            ],
          },
        ],
        where: { user_id: request.query.user_id },
      });
    if(!host){
      return h.response({message:"Enter valid id"}).code(400)
    }
      return h.response({
        responseData: {
         user: host.user,
        },
        message: "Successfull",
      });
    } catch (e) {
      console.log("SSSSSSSSSSSSSS", e);
    }
  };

  getHostUpcomingEvent = async (request, h) => {
    try {
      var totalPages;
      var data = request.query;
      var now = new Date();
      const page = data.page ? data.page : 1;
      if (data.type == "upcoming") {
        var upcomingEvent = await db.event.findAndCountAll({
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "category",
            "bookmarked",
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
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { endDate: { [Op.gt]: now }, user_id: data.user_id },
        });

        totalPages = await UniversalFunctions.getTotalPages(
          upcomingEvent.count,
          10
        );
      }

      if (data.type == "past") {
        var pastEvent = await db.event.findAndCountAll({
          attributes: [
            "id",
            "title",
            "description",
            "address",
            "startDate",
            "endDate",
            "category",
            "bookmarked",
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

              model: Models.attachments,
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          distinct: true,
          limit: 10,
          where: { endDate: { [Op.lt]: now }, user_id: data.user_id },
        });
        totalPages = await UniversalFunctions.getTotalPages(
          pastEvent.count,
          10
        );
      }

      return h.response({
        responseData: {
          data: upcomingEvent ? upcomingEvent.rows : pastEvent.rows,
          totalRecords: upcomingEvent ? upcomingEvent.count : pastEvent.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: upcomingEvent
            ? upcomingEvent.rows.length < 10
              ? 0
              : 1
            : pastEvent.rows.length < 10
            ? 0
            : 1,
        },
      });
    } catch (e) {
      console.log("SSSSSSSSSSSSs", e);
    }
  };
}

module.exports = new event();
