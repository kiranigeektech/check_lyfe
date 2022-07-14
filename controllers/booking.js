const db = require("../models/index");
const stripe = require('stripe')(process.env.STRIPE_KEY);
const moment = require("moment");
const sendNotification = require('../notifications/notifications')
const constant = require('../config/constant')
const braintree = require("braintree");
const ticket = require("./ticket");





class booking {

  getMyReviews = async (request,h) => {
    try {
      const query = request.query;
      const page = query.page ? query.page : 1;
      var authToken=request.auth.credentials.userData
      var date =new Date();
      var data=[]
      var bookingRating;
    if(request.query.type=="event")
      {
        var booking = await db.eventRating.findAndCountAll({
          attributes:["id","rating","review","createdAt"],
          include:[
            {
              attributes:['id','title','address'],
              required:false,
              model:Models.event,
              include:[
                {
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
                }
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
                    /* ["id", "data"],  */
                    "originalName",
                    "filename",
                  ],
                  model: Models.attachments,
                },
              ],
            }
          ],
          offset: (parseInt(page) - 1) * 10,
          limit: 10,
          distinct: true,
          where:{user_id:authToken.userId, event_id:{[Op.ne]:null}},
          order: [["id", "DESC"]]
         
        });
        var length =booking.rows.length
        console.log('SS',booking.rows) 
       var rating;
        for(let i=0;i<parseInt(length);i++)
        {
          data.push({
            id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
            title:booking.rows[i].dataValues &&booking.rows[i].event.dataValues.title,
            address:booking.rows[i].dataValues && booking.rows[i].event.dataValues.address,
            attachment:{
              filePath : booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.filePath,
              thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].event.dataValues.attachment.dataValues.thumbnailPath,
              id :booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.id,
              originalName : booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.originalName,
              fileName :booking.rows[i].dataValues&& booking.rows[i].event.dataValues.attachment.dataValues.fileName
            },
            rating: booking.rows[i].dataValues && booking.rows[i].dataValues.rating,
            review: booking.rows[i].dataValues && booking.rows[i].dataValues.review,
            createdAt: booking.rows[i].dataValues && booking.rows[i].dataValues.createdAt,
            reviewAttachment: booking.rows[i].dataValues && booking.rows[i].dataValues.reviewAttachment,
          })
        }

        var totalPages = await UniversalFunctions.getTotalPages(booking.rows.length, 10);
    }
    if(request.query.type=="club")
    {
      var booking = await db.clubRating.findAndCountAll({
        attributes:["id","rating","review","createdAt"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.clubs,
            include:[
              {
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
              },
            ],
           
          } ,
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
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{userId:authToken.userId, club_id:{[Op.ne]:null}} ,
        order: [["id", "DESC"]]
       
      });
      var length =booking.rows.length
      
      for(let i=0;i<parseInt(length);i++)
      {
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].club.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].club.dataValues.address,
          isRatingAvailable:rating,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].club.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].club.dataValues.attachment.dataValues.fileName
          },
          rating: booking.rows[i].dataValues && booking.rows[i].dataValues.rating,
          review: booking.rows[i].dataValues && booking.rows[i].dataValues.review,
          createdAt: booking.rows[i].dataValues && booking.rows[i].dataValues.createdAt,
          reviewAttachment: booking.rows[i].dataValues && booking.rows[i].dataValues.reviewAttachment,
        })
      }
      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    }
    if(request.query.type=="activity")
    {
      var booking = await db.activityRating.findAndCountAll({
        attributes:["id","rating","review","createdAt"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.activity,
            include:[
              {
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
              }
            ]
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
                  /* ["id", "data"],  */
                  "originalName",
                  "filename",
                ],
                model: Models.attachments,
              },
            ],
          }
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId, activity_id:{[Op.ne]:null}} ,
        order: [["id", "DESC"]]
      });
 
      var length =booking.rows.length
      console.log('SS',booking.rows)
      for(let i=0;i<parseInt(length);i++)
      {
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].activity.dataValues.address,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].activity.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].activity.dataValues.attachment.dataValues.fileName
          },
          rating: booking.rows[i].dataValues && booking.rows[i].dataValues.rating,
          review: booking.rows[i].dataValues && booking.rows[i].dataValues.review,
          createdAt: booking.rows[i].dataValues && booking.rows[i].dataValues.createdAt,
          reviewAttachment: booking.rows[i].dataValues && booking.rows[i].dataValues.reviewAttachment,
        })
      }

      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
     
    }
    if(request.query.type=="shops"){
      var booking = await db.salonRating.findAndCountAll({
        attributes:["id","rating","review","createdAt"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.salon,
            include:[
              {
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
              }
            ]
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
                  /* ["id", "data"],  */
                  "originalName",
                  "filename",
                ],
                model: Models.attachments,
              },
            ],
          }
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId, salon_id:{[Op.ne]:null}} ,
        order: [["id", "DESC"]]
       
      });
      var length =booking.rows.length
      
      for(let i=0;i<parseInt(length);i++)
      {
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].salon.dataValues.address,
          isRatingAvailable:rating,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].salon.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].salon.dataValues.attachment.dataValues.fileName
          },
          rating: booking.rows[i].dataValues && booking.rows[i].dataValues.rating,
          review: booking.rows[i].dataValues && booking.rows[i].dataValues.review,
          createdAt: booking.rows[i].dataValues && booking.rows[i].dataValues.createdAt,
          reviewAttachment: booking.rows[i].dataValues && booking.rows[i].dataValues.reviewAttachment,
        })
      }
      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    }
    if(request.query.type=="restaurant")
    {
      var booking = await db.restaurantRating.findAndCountAll({
        attributes:["id","rating","review","createdAt"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
            include:[
              {
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
              }
            ]
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
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId, restaurant_id:{[Op.ne]:null}} ,
        order: [["id", "DESC"]]
       
      });
 
      var length =booking.rows.length
      for(let i=0;i<parseInt(length);i++)
      {
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].restaurant.dataValues.address,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].restaurant.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].restaurant.dataValues.attachment.dataValues.fileName
          },
          rating: booking.rows[i].dataValues && booking.rows[i].dataValues.rating,
          review: booking.rows[i].dataValues && booking.rows[i].dataValues.review,
          createdAt: booking.rows[i].dataValues && booking.rows[i].dataValues.createdAt,
          reviewAttachment: booking.rows[i].dataValues && booking.rows[i].dataValues.reviewAttachment,
        })
      }

      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    
    }

      return h.response({
        responseData:{
        review:data,
        totalRecords:booking.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: booking.rows.length < 10 ? 0 : 1,
        }
      });

    } catch (e) {
      console.log("ss", e);
    }
  };

  getbooking = async (request,h) => {
    try {
      const query = request.query;
      const page = query.page ? query.page : 1;
      var authToken=request.auth.credentials.userData
      var date =new Date();
      var data=[]
      var bookingRating;
    if(request.query.type=="event")
      {
        var booking = await db.booking.findAndCountAll({
          attributes:["id"],
          include:[
            {
              attributes:['id','title','address'],
              required:false,
              model:Models.event,
              include:[
                {
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
                }
              ],
            },{
              attributes:["rating","review"],
              model:Models.eventRating,
              
            } ,
            {
              attributes:["id","startDate","startTime","endTime","status"], 
              required:false,
              model:Models.eventBookingTimings,
              order: [["startDate", "ASC"]]
            },
          ],
          offset: (parseInt(page) - 1) * 10,
          limit: 10,
          distinct: true,
          where:{user_id:authToken.userId,type:'success',isDeleted:false} ,
          order: [["id", "DESC"]]
         
        });
        var length =booking.rows.length
        console.log('SS',booking.rows) 
       var rating;
        for(let i=0;i<parseInt(length);i++)
        {
            var status =booking.rows[i].dataValues && booking.rows[i].eventBookingTimings[0].dataValues.status
            var startDate=moment(booking.rows[i].dataValues && booking.rows[i].eventBookingTimings[0].startDate).format('YYYY-MM-DD');
            var timeD = moment(startDate + " " +booking.rows[i].dataValues && booking.rows[0].eventBookingTimings[0].startTime).utcOffset("-05:30")

            if(moment(date).format('YYYY-MM-DD') > startDate && status!=="CANCELLED")
            {
              rating=true
              
            }
            else{
              rating=false
            }
            if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
             
              rating =false
            }
           
           if(moment(date).format('YYYY-MM-DD')==startDate && status!=="CANCELLED")
            {
              console.log('ssssssssss')
              if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
                {
                  rating =true
                }
                else{
                  rating=false
                }
               
               if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS")&& status!=="CANCELLED")
               {
                  rating =false
               }
            }
            if(booking.rows[i].eventRatings.length!==0)
            {
             for(let j=0;j<booking.rows[i].eventRatings.length;j++)
            {
            console.log('SSSSSSSSSSS',booking.rows[i].eventRatings[j].dataValues)
              var ratingData = booking.rows[i].eventRatings[j].dataValues.rating
              var review = booking.rows[i].eventRatings[j].dataValues.review
                ratingData = Number(ratingData)
               var bookingRating={ratingData ,review}
            } 
          }
          if(booking.rows[i].eventRatings.length==0)
          {
            var ratingData=0
            var review=null
            var bookingRating={ratingData,review}
          }

          data.push({
            id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
            title:booking.rows[i].dataValues &&booking.rows[i].event.dataValues.title,
            address:booking.rows[i].dataValues && booking.rows[i].event.dataValues.address,
            isRatingAvailable:rating,
            attachment:{
              filePath : booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.filePath,
              thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].event.dataValues.attachment.dataValues.thumbnailPath,
              id :booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.id,
              originalName : booking.rows[i].dataValues &&booking.rows[i].event.dataValues.attachment.dataValues.originalName,
              fileName :booking.rows[i].dataValues&& booking.rows[i].event.dataValues.attachment.dataValues.fileName
            },
            timings:booking.rows[i].dataValues && booking.rows[i].eventBookingTimings,
            bookingRating,
            
          })
        }

        var totalPages = await UniversalFunctions.getTotalPages(booking.rows.length, 10);
    }
    if(request.query.type=="club")
    {
      var booking = await db.clubBooking.findAndCountAll({
        attributes:["id","startDate","startTime","endTime","preferTime"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.clubs,
            include:[
              {
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
              }
            ],
           
          } ,
          {
              attributes:["rating","review"],
              model:Models.clubRating,
          
          }
          
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId,isDeleted:false} ,
        order: [["id", "DESC"]]
       
      });
      var length =booking.rows.length
      
      for(let i=0;i<parseInt(length);i++)
      {

        var status =booking.rows[i].dataValues.status
        var startDate=moment(booking.rows[i].dataValues.startDate).format('YYYY-MM-DD');
        var timeD = moment(startDate + " " +booking.rows[i].dataValues && booking.rows[i].dataValues.startTime).utcOffset("-05:30")

        if(moment(date).format('YYYY-MM-DD') > startDate && status!=="CANCELLED")
        {
          rating=true
          
        }
        else{
          rating=false
        }
        if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
         
          rating =false
        }
       
       if(moment(date).format('YYYY-MM-DD')==startDate && status!=="CANCELLED")
        {
          console.log('ssssssssss')
          if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
            {
              rating =true
            }
            else{
              rating=false
            }
           
           if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS")&& status!=="CANCELLED")
           {
              rating =false
           }
        }
        if(booking.rows[i].clubRatings.length!==0)
        {
        for(let j=0;j<booking.rows[i].clubRatings.length;j++)
        {
         
          var review=booking.rows[i].clubRatings[j].dataValues.review
          var ratingData = booking.rows[i].clubRatings[j].dataValues.rating
          ratingData = Number(ratingData)
           var bookingRating={ratingData ,review}
        } 
      }
      if(booking.rows[i].clubRatings.length==0)
      {
        var ratingData=0
        var review=null
        var bookingRating={ratingData,review}
      }
      var time=[]

      console.log('SSSSSSSSS',booking.rows[i].dataValues)
        time.push({
          startDate:booking.rows[i].dataValues && booking.rows[i].dataValues.startDate,
          startTime:booking.rows[i].dataValues && booking.rows[i].dataValues.startTime,
          endTime:booking.rows[i].dataValues && booking.rows[i].dataValues.endTime,
          preferTime:booking.rows[i].dataValues.preferTime
        })
       
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].club.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].club.dataValues.address,
          isRatingAvailable:rating,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].club.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].club.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].club.dataValues.attachment.dataValues.fileName
          },
          timings:time,
          bookingRating
        })
      }
      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    }
    if(request.query.type=="activity")
    {
      var booking = await db.activityBooking.findAndCountAll({
        attributes:["id"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.activity,
            include:[
              {
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
              }
            ]
          } ,
          {
            attributes:["startDate","startTime","endTime"], 
            required:false,
            model:Models.activityBookingTimings,
          },
          {
            attributes:["rating","review"],
            model:Models.activityRating
          }
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId,type:'success',isDeleted:false} ,
        order: [["id", "DESC"]]
       
      });
 
      var length =booking.rows.length
      console.log('SS',booking.rows)
      for(let i=0;i<parseInt(length);i++)
      {
        var status =booking.rows[i].dataValues && booking.rows[i].activityBookingTimings[0].dataValues.status
        var startDate=moment(booking.rows[i].dataValues && booking.rows[i].activityBookingTimings[0].startDate).format('YYYY-MM-DD');
        var timeD = moment(startDate + " " +booking.rows[i].dataValues && booking.rows[0].activityBookingTimings[0].startTime).utcOffset("-05:30")

        if(moment(date).format('YYYY-MM-DD') > startDate && status!=="CANCELLED")
        {
          rating=true
          
        }
        else{
          rating=false
        }
        if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
         
          rating =false
        }
       
       if(moment(date).format('YYYY-MM-DD')==startDate && status!=="CANCELLED")
        {
          console.log('ssssssssss')
          if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
            {
              rating =true
            }
            else{
              rating=false
            }
           
           if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS")&& status!=="CANCELLED")
           {
              rating =false
           }
          }
          if(booking.rows[i].activityRatings.length!==0)
          {
        for(let j=0;j<booking.rows[i].activityRatings.length;j++)
        {
          var review=booking.rows[i].activityRatings[j].dataValues.review
          var ratingData = booking.rows[i].activityRatings[j].dataValues.rating
          ratingData = Number(ratingData)
          var bookingRating={ratingData ,review}
          
        } 
      }
      if(booking.rows[i].activityRatings.length==0)
      {
        var ratingData=0
        var review=null
        var bookingRating={ratingData,review}
      }
       
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].activity.dataValues.address,
          isRatingAvailable:rating,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].activity.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].activity.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].activity.dataValues.attachment.dataValues.fileName
          },
          timings:booking.rows[i].dataValues && booking.rows[i].activityBookingTimings,
          bookingRating
        })
      }

      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
     
    }
    if(request.query.type=="shops"){
      var booking = await db.salonBooking.findAndCountAll({
        attributes:["id","startDate","startTime","endTime","preferTime"],
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.salon,
            include:[
              {
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
              }
            ]
          } ,
          {
            attributes:["rating","review"],
            model:Models.salonRating,
            required:false
          }
          
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId,isDeleted:false} ,
        order: [["id", "DESC"]]
       
      });
      var length =booking.rows.length
      
      for(let i=0;i<parseInt(length);i++)
      {
        var status =booking.rows[i].dataValues && booking.rows[i].dataValues.status
        var startDate=moment(booking.rows[i].dataValues && booking.rows[i].dataValues.startDate).format('YYYY-MM-DD');
        var timeD = moment(startDate + " " +booking.rows[i].dataValues && booking.rows[i].dataValues.startTime).utcOffset("-05:30")

        if(moment(date).format('YYYY-MM-DD') > startDate && status!=="CANCELLED")
        {
          rating=true
          
        }
        else{
          rating=false
        }
        if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
         
          rating =false
        }
       
       if(moment(date).format('YYYY-MM-DD')==startDate && status!=="CANCELLED")
        {
          console.log('ssssssssss')
          if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
            {
              rating =true
            }
            else{
              rating=false
            }
           
           if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS")&& status!=="CANCELLED")
           {
              rating =false
           }
          }
          console.log('length',booking.rows[i].salonRatings.length)
          if(booking.rows[i].salonRatings.length!==0)
          {
            for(let j=0;j<booking.rows[i].salonRatings.length;j++)
            {
              console.log('SSSSSSSSSDDD',booking.rows[i].dataValues.id)
              console.log('SSSSSSS',booking.rows[i].salonRatings[j])
              var review = booking.rows[i].salonRatings[j].dataValues.review
              var ratingData = booking.rows[i].salonRatings[j].dataValues.rating
               ratingData = Number(ratingData) 
              var bookingRating={ratingData,review}
            }
          }
          if(booking.rows[i].salonRatings.length==0)
          {
            var ratingData=0
            var review=null
            var bookingRating={ratingData,review}
          }
          var time=[]
        time.push({
          startDate:booking.rows[i].dataValues && booking.rows[i].dataValues.startDate,
          startTime:booking.rows[i].dataValues && booking.rows[i].dataValues.startTime,
          endTime:booking.rows[i].dataValues && booking.rows[i].dataValues.endTime,
          preferTime:booking.rows[i].dataValues.preferTime
        })
       
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].salon.dataValues.address,
          isRatingAvailable:rating,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].salon.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].salon.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].salon.dataValues.attachment.dataValues.fileName
          },
          timings:time,
         bookingRating
        })
      }
      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    }
    if(request.query.type=="restaurant")
    {
      var booking = await db.restaurantReservations.findAndCountAll({
        include:[
          {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
            include:[
              {
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
              }
            ]
          } ,
        ],
        offset: (parseInt(page) - 1) * 10,
        limit: 10,
        distinct: true,
        where:{user_id:authToken.userId,isDeleted:false} ,
        order: [["id", "DESC"]]
       
      });
 
      var length =booking.rows.length
      for(let i=0;i<parseInt(length);i++)
      {
        var time=[]
        time.push({
          startDate:booking.rows[i].dataValues.startDate,
          startTime:booking.rows[i].dataValues.startTime,
          endTime:booking.rows[i].dataValues.endTime,
          preferTime:booking.rows[i].dataValues.preferTime
        })
        data.push({
          id:booking.rows[i].dataValues && booking.rows[i].dataValues.id,
          title:booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.title,
          address:booking.rows[i].dataValues && booking.rows[i].restaurant.dataValues.address,
          attachment:{
            filePath : booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.filePath,
            thumbnailPath :booking.rows[i].dataValues&& booking.rows[i].restaurant.dataValues.attachment.dataValues.thumbnailPath,
            id :booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.id,
            originalName : booking.rows[i].dataValues &&booking.rows[i].restaurant.dataValues.attachment.dataValues.originalName,
            fileName :booking.rows[i].dataValues&& booking.rows[i].restaurant.dataValues.attachment.dataValues.fileName
          },
          timings:time
        })
      }

      var totalPages = await UniversalFunctions.getTotalPages(booking.count, 10);
    
  }

      return h.response({
        responseData:{
        booking:data,
        totalRecords:booking.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: booking.rows.length < 10 ? 0 : 1,
        }
      });

    } catch (e) {
      console.log("ss", e);
    }
  };

  addbooking = async (request, h) => {
    try {
      let adminData = await db.users.findOne({
        where: {
          role_id: constant.ROLES.ADMIN_ROLE,
        },
      });
      if(adminData){
        //send notification to admin
        const create = await db.notifications.create({
          title:constant.ADMIN_NOTIFICATION_TYPE.NEW_ORDER.title,
          body:constant.ADMIN_NOTIFICATION_TYPE.NEW_ORDER.body.replace('{type}',request.payload.type),
          notificationType:constant.ADMIN_NOTIFICATION_TYPE.NEW_ORDER.type,
          user_id:adminData.dataValues.id,
          notificationTo:constant.NOTIFICATION_TO.ADMIN
        })
      }
      var authToken = request.auth.credentials.userData
      var stripeCustomerId=null;
      var token=null;
      const gateway = await new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: "35y8p9yjr3vfh2bn",
        publicKey: "xnth54rqpr4fzgmn",
        privateKey: "d217d871d3ef2845cff15c2b0ce3b577"
      });

      const fcmToken = await db.userAccesses.findAll({
        where:{user_id:authToken.userId,fcmToken:{[Op.ne]:null}}
      })

      var n = fcmToken.length - 1
      if(request.payload.type=="event")
      {

      //get events tickets 
      request.payload.startTime =  request.payload.timings[0].startTime,
      request.payload.endTime =  request.payload.timings[0].endTime,
      request.payload.startDate =  request.payload.timings[0].startDate

      let businessTickets = await this.getTicket(request,h, true);
      console.log(businessTickets)
      let ticketMap = {};
      if(businessTickets && businessTickets.length){
        for(let i=0; i<businessTickets.length; i++){
          ticketMap[businessTickets[i].id] = businessTickets[i]
        }
      }
      console.log(ticketMap)

      //check tickets available or not, that event have remain
      console.log(request.payload.timings[0].tickets.length)
      for(let i=0; i<request.payload.timings[0].tickets.length; i++){
        if(request.payload.timings[0].tickets[i].ticketSold > ticketMap[request.payload.timings[0].tickets[i].ticket_id].ticketRemain){
          return h.response({message:"Tickets not available"}).code(400)
        }
      }
      if(request.payload.cardId){
        const check = await db.userCardDetail.findOne({
          where:{id:request.payload.cardId,user_id:authToken.userId}
        })
        if(!check){
          return h.response({message:"Enter Valid CardID"}).code(400)
        }
        stripeCustomerId=check.dataValues.stripCustomerId
        token=check.dataValues.token
      }
      var time=[];
      var tickets=[];
      var data = request.payload;
      const dataCap = await db.event.findOne({
        attributes: ["available","title","address"],
        where: {
          id: data.id,
        },
      });
      console.log('SSS',dataCap.dataValues.available)
      var ticket = dataCap.dataValues.available - data.noOfPerson;

      if(data.timings){
        for (var i = 0; i < data.timings.length; i++) {
        const newDate = new Date();
        const formatDate = moment(newDate).format("MM-DD-YYYY");
        time.push({
              startTime: data.timings[i].startTime,
              endTime: data.timings[i].endTime,
              startDate: data.timings[i].startDate,
              ticketBooked:data.timings[i].noOfPerson
        })
        for(let j=0;j<data.timings[i].tickets.length;j++)
        {
          tickets.push({
            ticket_id:data.timings[i].tickets[j].ticket_id,
            ticketSold:data.timings[i].tickets[j].ticketSold
          })
        }
       
      }
      }
      console.log('sssssssssssss',data.totalAmount)
      const tax = await db.eventSetting.findOne({})
      
      var serviceTax = tax.dataValues.serviceTax
      var original = (tax.dataValues.serviceTax/100) + 1
      var originalAmount =  data.totalAmount/original
      var taxAmount = data.totalAmount - originalAmount
      var adminCommission = tax.dataValues.adminCommission
      var adminCommissionAmount = (adminCommission/ 100) * originalAmount
      var fixedAdminamount = adminCommissionAmount + taxAmount
      var fixedhostamount = originalAmount-adminCommissionAmount


      const addbook = await db.booking.create({
        user_id:authToken.userId,
        event_id: data.id,
        noOfPerson: data.noOfPerson,
        serviceTax:serviceTax,
        adminCommission:adminCommission,
        adminCommissionAmount: fixedAdminamount.toFixed(2),
        hostAmount:fixedhostamount.toFixed(2),
        type:'pending',
        isDeleted:false,
        paymentMode:data.paymentMode,
        totalAmount: data.totalAmount,
      },
      ); 
      for(let i=0;i<data.timings.length;i++)
      {
          var slotId = await db.eventBookingTimings.create({
            startDate:data.timings[i].startDate,
            startTime:data.timings[i].startTime,
            endTime:data.timings[i].endTime,
            ticketBooked:data.timings[i].noOfPerson,
            booking_id:addbook.dataValues.id
          })
          for(let j=0;j<data.timings[i].tickets.length;j++)
          {
            let ticketsData = [];
            ticketsData.push({
              ticket_id:data.timings[i].tickets[j].ticket_id,
              ticketSold:data.timings[i].tickets[j].ticketSold,
              slot_id:slotId.dataValues.id,
              booking_id:addbook.dataValues.id
            }) 
            console.log('SSSSSSSSSSS',ticketsData)
           const adddata = await db.userBookingEventsTicket.bulkCreate(ticketsData) 
          }

      }

      var timeData={}
      timeData.time = time

      if(data.paymentMode=='CARD')
      {
            if(stripeCustomerId!==null )
            {
            var stripeChargeParam = {
                amount: Math.floor(data.totalAmount * 100),
                currency: 'usd',
                description : 'Testing',
                payment_method_types: ["card"],
                customer:stripeCustomerId,
                payment_method:token,
                metadata:{
                  userId:authToken.userId,
                  businessId: data.id,
                  type:'event',
                  eventName:dataCap.dataValues.title,
                  eventAddress:dataCap.dataValues.address,
                  amount:data.totalAmount,
                  /*  bookingTime:timeData,  */
                  bookingId:addbook.dataValues.id
                }
              }
            }
            else{
              console.log('SSSSSSS@@@@@@@@')
            var stripeChargeParam = {
              amount:Math.floor(data.totalAmount * 100),
              currency: 'usd',
              description : 'Testing',
              payment_method_types: ["card"],
              metadata:{
                userId:authToken.userId,
                businessId: data.id,
                type:'event',
                eventName:dataCap.dataValues.title,
                eventAddress:dataCap.dataValues.address,
                amount:data.totalAmount,
                /* bookingTime:timeData, */
                bookingId:addbook.dataValues.id
              }
            }
          }

          var payement= await stripe.paymentIntents.create(stripeChargeParam)
          return h.response({
            responseData: {
              paymentIntent:payement,
              bookingId:addbook.dataValues.id
            },
          });
        }

      if(data.paymentMode=='PAYPAL' || data.paymentMode=="APPLEPAY")
      {

        const payment = await gateway.transaction.sale({
          amount: data.totalAmount,
          paymentMethodNonce: data.paymentNonce,
          deviceData: data.deviceData,
          options: {
            submitForSettlement: true
          }
        });

        if(payment)
        {
          console.log('SSSSSSSSSSS',payment.transaction)
          let data = await db.booking.update({
            type:"success"
            },{
              where:{id:addbook.dataValues.id}
            }) 

            const dataTransaction = await db.transaction.create({
              transaction_id:payment.transaction.id,
              user_id:authToken.userId,
              booking_id:addbook.dataValues.id,
              totalAmount:payment.transaction.amount,
              business_id:data.id,
              type:'event',
              status:'succeeded',
              isDeleted:false
            })

            let notificationData ={
              title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Event'),
              body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type),
              type:'event',
              actionId:JSON.stringify(addbook.dataValues.id),
              user_id:JSON.stringify(authToken.userId)
             }
             if(fcmToken.length!=0)
             {
           let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
             }
         

           const create = await db.notifications.create({
             user_id:authToken.userId,
             title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Event'),
             body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
             notificationType:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type,
             type:'event',
             booking_id:addbook.dataValues.id,
             notificationTo:constant.NOTIFICATION_TO.USER
           })

           return h.response({
            responseData: {
              bookingId:addbook.dataValues.id
            },
          });
        }  

        }
   
    }
      if(request.payload.type=="activity")
      {
        if(request.payload.cardId){
          const check = await db.userCardDetail.findOne({
            where:{id:request.payload.cardId,user_id:authToken.userId}
          })
          if(!check){
            return h.response({message:"Enter Valid CardID"}).code(400)
          }
          stripeCustomerId=check.dataValues.stripCustomerId
          token=check.dataValues.token
        }
        var time=[];
        var tickets=[];
        var data = request.payload;
        const dataCap = await db.activity.findOne({
          attributes: ["title","address"],
          where: {
            id: data.id,
          },
        });
        console.log('SSS',dataCap.dataValues.available)
        var ticket = dataCap.dataValues.available - data.noOfPerson;

        if(data.timings){
          for (var i = 0; i < data.timings.length; i++) {
          const newDate = new Date();
          const formatDate = moment(newDate).format("MM-DD-YYYY");
          time.push({
                startTime: data.timings[i].startTime,
                endTime: data.timings[i].endTime,
                startDate: data.timings[i].startDate,
                preferedTime:data.timings[i].preferedTime,
                ticketBooked:data.timings[i].noOfPerson
          })
          for(let j=0;j<data.timings[i].tickets.length;j++)
          {
            tickets.push({
              ticket_id:data.timings[i].tickets[j].ticket_id,
              ticketSold:data.timings[i].tickets[j].ticketSold
            })
          }
        
        }
        }
        console.log('sssssssssssss',tickets)
        const tax = await db.eventSetting.findOne({})

        var serviceTax = tax.dataValues.serviceTax
      var original = (tax.dataValues.serviceTax/100) + 1
      var originalAmount =  data.totalAmount/original
      var taxAmount = data.totalAmount - originalAmount
      var adminCommission = tax.dataValues.adminCommission
      var adminCommissionAmount = (adminCommission/ 100) * originalAmount

      var fixedAdminamount = adminCommissionAmount + taxAmount
      var fixedhostamount = originalAmount-adminCommissionAmount
    
       /*  var serviceTax = tax.dataValues.serviceTax
        var adminCommission = tax.dataValues.adminCommission
        var adminCommissionAmount = (adminCommission/ 100) * data.totalAmount */


        const addbook = await db.activityBooking.create({
          user_id:authToken.userId,
          activity_id: data.id,
          serviceTax:serviceTax,
          adminCommission:adminCommission,
          adminCommissionAmount:fixedAdminamount.toFixed(2),
          hostAmount:fixedhostamount.toFixed(2),
          type:'pending',
          isDeleted:false,
          paymentMode:data.paymentMode,
          totalAmount: data.totalAmount,
        },
        ); 
        for(let i=0;i<data.timings.length;i++)
        {
            var slotId = await db.activityBookingTimings.create({
              startDate:data.timings[i].startDate,
              startTime:data.timings[i].startTime,
              endTime:data.timings[i].endTime,
              preferedTime:data.timings[i].preferedTime,
              ticketBooked:data.timings[i].noOfPerson,
              booking_id:addbook.dataValues.id
            })
            for(let j=0;j<data.timings[i].tickets.length;j++)
            {
              let ticketsData = [];
              ticketsData.push({
                ticket_id:data.timings[i].tickets[j].ticket_id,
                ticketSold:data.timings[i].tickets[j].ticketSold,
                slot_id:slotId.dataValues.id,
                booking_id:addbook.dataValues.id
              }) 
              console.log('SSSSSSSSSSS',ticketsData)
            const adddata = await db.activityBookingTickets.bulkCreate(ticketsData) 
            }

        }
        if(data.paymentMode=='CARD')
        {

        if(stripeCustomerId!==null )
        {
        var stripeChargeParam = {
            amount: Math.floor(data.totalAmount * 100),
            currency: 'usd',
            description : 'Activity Booking',
            payment_method_types: ["card"],
            customer:stripeCustomerId,
            payment_method:token,
            metadata:{
              userId:authToken.userId,
              type:'activity',
              businessId: data.id,
              activityName:dataCap.dataValues.title,
              activityAddress:dataCap.dataValues.address,
              amount:data.totalAmount,
              bookingId:addbook.dataValues.id
            }
          }
        }
        else{
          console.log('SSSSSSS@@@@@@@@')
        var stripeChargeParam = {
          amount:Math.floor(data.totalAmount * 100),
          currency: 'usd',
          description : 'Activity Booking',
          payment_method_types: ["card"],
          metadata:{
            userId:authToken.userId,
            businessId: data.id,
            type:'activity',
            amount:data.totalAmount,
            activityName:dataCap.dataValues.title,
              activityAddress:dataCap.dataValues.address,
            bookingId:addbook.dataValues.id
          }
        }
      }
      var payement= await stripe.paymentIntents.create(stripeChargeParam)
      
      return h.response({
        responseData: {
          paymentIntent:payement,
          bookingId:addbook.dataValues.id
        },
      });
         }

        if(data.paymentMode=='PAYPAL' || data.paymentMode=="APPLEPAY")
        {
          const payment = await gateway.transaction.sale({
            amount: data.totalAmount,
            paymentMethodNonce: data.paymentNonce,
            deviceData: data.deviceData,
            options: {
              submitForSettlement: true
            }
          });
         
          if(payment)
        {
          console.log('SSSSSSSSSSS',payment.transaction)
            let data = await db.activityBooking.update({
              type:"success"
              },{
                where:{id:addbook.dataValues.id}
              }) 

            const dataTransaction = await db.transaction.create({
              transaction_id:payment.transaction.id,
              user_id:authToken.userId,
              booking_id:addbook.dataValues.id,
              business_id:data.id,
              totalAmount:payment.transaction.amount,
              type:'activity',
              status:'succeeded',
              isDeleted:false
            })

            let notificationData ={
              title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Activity'),
              body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type),
              type:'activity',
              actionId:JSON.stringify(addbook.dataValues.id),
              user_id:JSON.stringify(authToken.userId)
             }
              if(fcmToken.length!=0)
             {
           let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
             }
           const create = await db.notifications.create({
             user_id:authToken.userId,
             title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Activity'),
             body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
             notificationType:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type,
             type:'activity',
             booking_id:addbook.dataValues.id,
             notificationTo:constant.NOTIFICATION_TO.USER
           })

           return h.response({
            responseData: {
              bookingId:addbook.dataValues.id
            },
          });
        }  

        }
        

    
      }
      if(request.payload.type=="shops")
      {
        var data = request.payload;

      const addbook = await db.salonBooking.create({
        user_id:authToken.userId,
        salon_id: data.id,
        noOfPerson: data.timings[0].noOfPerson, 
        startTime: data.timings[0].startTime,
        endTime: data.timings[0].endTime,
        preferTime:data.timings[0].preferedTime,
        startDate: data.timings[0].startDate,
        serviceAt:data.serviceAt,
        address:data.address,
        type:'pending',
        isDeleted:false,
        totalAmount: data.totalAmount,
      },
    
      ); 
      for(let i=0;i<data.timings.length;i++)
      {
          for(let j=0;j<data.timings[i].tickets.length;j++)
          {
            let ticketsData = [];
            ticketsData.push({
              ticket_id:data.timings[i].tickets[j].ticket_id,
              booking_id:addbook.dataValues.id
            }) 
            console.log('SSSSSSSSSSS',ticketsData)
          const adddata = await db.salonBookingServices.bulkCreate(ticketsData) 
          }

      }

      const vendorId = await db.salon.findOne({where:{id:data.id}})
      const vendorFcm =  await db.userAccesses.findAll({
        where:{user_id:vendorId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
      })
      var m = vendorFcm.length - 1

      let vendornotificationData={
        title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Shop'),
        body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
        notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type),
        type:'shops',
        actionId:JSON.stringify(addbook.dataValues.id),
        user_id:JSON.stringify(authToken.userId)
      }

      let sendVendor = await sendNotification.sendMessage(vendorFcm[m].dataValues.fcmToken,vendornotificationData)  

      return h.response({
        responseData: {
          bookingId:addbook.dataValues.id
        },
      });
      }

     if(request.payload.type=="club")
     {
      var data = request.payload;
      const addbook = await db.clubBooking.create({
        user_id:authToken.userId,
        club_id: data.id,
         noOfPerson: data.timings[0].noOfPerson,
        startTime: data.timings[0].startTime,
        endTime: data.timings[0].endTime,
        preferTime:data.timings[0].preferedTime,
        startDate: data.timings[0].startDate,
        type:'pending',
        isDeleted:false,
        totalAmount: data.totalAmount,
      },
    
      ); 
      for(let i=0;i<data.timings.length;i++)
      {
          for(let j=0;j<data.timings[i].tickets.length;j++)
          {
            let ticketsData = [];
            ticketsData.push({
              ticket_id:data.timings[i].tickets[j].ticket_id,
              ticketSold:data.timings[i].tickets[j].ticketSold,
              booking_id:addbook.dataValues.id
            }) 
            console.log('SSSSSSSSSSS',ticketsData)
          const adddata = await db.clubBookingServices.bulkCreate(ticketsData) 
          }

      }

      const vendorId = await db.clubs.findOne({where:{id:data.id}})
      const vendorFcm =  await db.userAccesses.findAll({
        where:{user_id:vendorId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
      })
      
      var m = vendorFcm.length - 1
console.log('DDDDDDDDDDDDDDDDD',vendorFcm[m].dataValues.fcmToken)
      let vendornotificationData={
        title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Club'),
        body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
        notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type),
        type:'club',
        actionId:JSON.stringify(addbook.dataValues.id),
        user_id:JSON.stringify(authToken.userId)
      }

      let sendVendor = await sendNotification.sendMessage(vendorFcm[m].dataValues.fcmToken,vendornotificationData)

      return h.response({
        responseData: {
          bookingId:addbook.dataValues.id
        },
      });
      
     }

    }
    
     catch (e) {
     console.log('SSSSSSSSs',e)
    }
  };

  editbooking = async (request) => {
    try {
      const newDate = new Date();
      const formatDate = moment(newDate).format("MM-DD-YYYY");
      const startTime = moment(
        `${formatDate} ${request.payload.startTime}`
      ).format("HH:MM:SS");
      const endTime = moment(`${formatDate} ${request.payload.endTime}`).format(
        "HH:MM:SS"
      );
      const editAmini = await db.booking.update(
        {
          noOfPerson: request.payload.noOfPerson,
          totalAmount: request.payload.totalAmount,
          startDate: request.payload.startDate,
          startTime: startTime,
          endTime: endTime,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return editAmini;
    } catch (e) {
      console.log("###edit####", e);
    }
  };

  getbookingbyId=async(request,h)=>{
    try{
      var authToken=request.auth.credentials.userData
      var booking=[];
      console.log('SSSSSS',request.headers.timezone)
      
      var cancelled;
      var date =new Date();
      var time = new Date( )
      if(request.query.type=="event")
      {      
      var data = await db.booking.findOne({
          attributes:["event_id","user_id","totalAmount","paymentMode"],
          where:{id:request.params.id,user_id:authToken.userId},
          include:[{
            model:Models.userBookingEventsTicket,
            include:[{model:Models.ticket}]
          },{
            model:Models.eventBookingTimings,
            include:[{model:Models.userBookingEventsTicket,include:[{model:Models.ticket}]}]
            
          }],
          
        })

       
       
        if(!data)
        {
          return h.response({message:"Enter a valid booking id"}).code(400)
        }
        var totalAmount=data.dataValues.totalAmount
          console.log('SSSSSSSS',data.dataValues.eventBookingTimings)
        for(let i=0;i<data.dataValues.eventBookingTimings.length;i++)
        {
          var status =data.dataValues.eventBookingTimings[i].dataValues.status;
         var startDate=moment(data.dataValues.eventBookingTimings[i].dataValues.startDate).format('YYYY-MM-DD')
         var timeD=moment(startDate + " " +data.dataValues.eventBookingTimings[i].dataValues.startTime).utcOffset(request.headers.timezone)
         console.log('before',timeD)
         console.log('date',moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
         console.log('time',timeD.format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
          if(moment(date).format('YYYY-MM-DD')>startDate)
          {
            cancelled=false
          }
          if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
            cancelled=true
          }
          else{
            cancelled=false
          }

         if(moment(date).format('YYYY-MM-DD')==startDate)
          {
           
            if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
              {
                console.log('sssssssssssstrue')
                cancelled=true
              }
              else{
                cancelled=false
              }
             if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS"))
             {
               
               cancelled=false
             }
          }
          var ticket=[];
          for( let k=0;k<data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets.length;k++)
          {
            console.log('SSSSSAAAA',data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues)
            ticket.push({
               id:data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.id,
              ticketSold:data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticketSold,
               ticketName:data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.ticketName,
              price:data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.price,
              description:data.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.description,   
            })
          }
          booking.push({
            id:data.dataValues.eventBookingTimings[i].dataValues.id,
            startDate:data.dataValues.eventBookingTimings[i].dataValues.startDate,
            startTime:data.dataValues.eventBookingTimings[i].dataValues.startTime,
            endTime:data.dataValues.eventBookingTimings[i].dataValues.endTime,
            noOfPerson:data.dataValues.eventBookingTimings[i].dataValues.ticketBooked,
            isCancelled:cancelled,
            status:data.dataValues.eventBookingTimings[i].dataValues.status,
            refundStatus:data.dataValues.eventBookingTimings[i].dataValues.refundStatus,
            ticket
          })
        
        }

        const event = await db.event.findOne({
          attributes:["title","address","lat","long","showAddress"],
          where:{id:data.dataValues.event_id}
        })
        const user = await db.users.findOne({
          attributes:["mobile","countryCode"],
          where:{id:data.dataValues.user_id},
        })
       

        return h.response({
          responseData:{
            event,
            user,
            text:`Are you sure you want to cancel your booking if you cancel your booking before ${event.dataValues.refundTime}h of your booking time you will get 100% of refund and if you cancel your booking after ${event.dataValues.refundTime}h you will not get your refund back`,
            totalAmount:totalAmount,
            paymentMode:data.dataValues.paymentMode,
            booking,
            supportEmail:'syed@illuminz.com',
            supportNumber:'9090909098'
          }
        })
      }
      if(request.query.type=="activity")
      {
        var data = await db.activityBooking.findOne({
          attributes:["activity_id","user_id","totalAmount","paymentMode"],
          where:{id:request.params.id,user_id:authToken.userId},
          include:[{
            model:Models.activityBookingTickets,
            include:[{model:Models.activityTicket}]
          },{
            model:Models.activityBookingTimings,
            include:[{model:Models.activityBookingTickets,include:[{model:Models.activityTicket}]}]
            
          }],
        })

        if(!data)
        {
          return h.response({message:"Enter a valid booking id"}).code(400)
        }
        var totalAmount=data.dataValues.totalAmount
     
        
        for(let i=0;i<data.dataValues.activityBookingTimings.length;i++)
        {
          var status =data.dataValues.activityBookingTimings[i].dataValues.status;
         var startDate=moment(data.dataValues.activityBookingTimings[i].dataValues.startDate).format('YYYY-MM-DD')
         var timeD=moment(startDate + " " +data.dataValues.activityBookingTimings[i].dataValues.startTime).utcOffset("-05:30")
         console.log('before',timeD)
         console.log('date',moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
         console.log('time',timeD.format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
          if(moment(date).format('YYYY-MM-DD')>startDate)
          {
            cancelled=false
          }
          if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
            cancelled=true
          }
          else{
            cancelled=false
          }

         if(moment(date).format('YYYY-MM-DD')==startDate)
          {
           
            if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
              {
                console.log('sssssssssssstrue')
                cancelled=true
              }
              else{
                cancelled=false
              }
             if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS"))
             {
               
               cancelled=false
             }
          }
          var ticket=[];
          console.log('SSSSS',data.dataValues.activityBookingTimings)
          for( let k=0;k<data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets.length;k++)
          {
           console.log('SSSSSAAAA',data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues) 
            ticket.push({
               id:data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.id,
              ticketSold:data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.ticketSold,
               ticketName:data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.ticketName,
              price:data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.price,
              description:data.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.description,   
            })
          }
          booking.push({
            id:data.dataValues.activityBookingTimings[i].dataValues.id,
            startDate:data.dataValues.activityBookingTimings[i].dataValues.startDate,
            startTime:data.dataValues.activityBookingTimings[i].dataValues.startTime,
            endTime:data.dataValues.activityBookingTimings[i].dataValues.endTime,
            preferedTime:data.dataValues.activityBookingTimings[i].dataValues.preferedTime,
            noOfPerson:data.dataValues.activityBookingTimings[i].dataValues.ticketBooked,
            isCancelled:cancelled,
            status:data.dataValues.activityBookingTimings[i].dataValues.status,
            refundStatus:data.dataValues.activityBookingTimings[i].dataValues.refundStatus,
            ticket
          })
        
        }

        const event = await db.activity.findOne({
          attributes:["title","address","lat","long","user_id"],
          where:{id:data.dataValues.activity_id}
        })
        const user = await db.users.findOne({
          attributes:["mobile","countryCode"],
          where:{id:event.dataValues.user_id},
        })
       

        return h.response({
          responseData:{
            event,
            user,
            text:"Are you sure you want to cancel",
            totalAmount:totalAmount,
            paymentMode:data.dataValues.paymentMode,
            booking,
            supportEmail:'syed@illuminz.com',
            supportNumber:'9090909098'
          }
        })
      }
      if(request.query.type=="shops"){
        var data = await db.salonBooking.findOne({
           attributes:["salon_id","user_id","status","startTime","endTime","startDate","preferTime","totalAmount","type","noOfPerson","serviceAt","address"], 
          where:{id:request.params.id,user_id:authToken.userId},
          include:[{
            model:Models.salonBookingServices,
            include:[{model:Models.salonServices}]
          }],
        })
        console.log('SSSSSAAAA',data)

        if(!data)
        {
          return h.response({message:"Enter a valid booking id"}).code(400)
        }
        var totalAmount=data.dataValues.totalAmount
     
        
          var status =data.dataValues.status;
         var startDate=moment(data.dataValues.startDate).format('YYYY-MM-DD')
         var timeD=moment(startDate + " " +data.dataValues.startTime).utcOffset("-05:30")
         console.log('before',timeD)
         console.log('date',moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
         console.log('time',timeD.format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
          if(moment(date).format('YYYY-MM-DD')>startDate)
          {
            cancelled=false
          }
          if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
            cancelled=true
          }
          else{
            cancelled=false
          }

         if(moment(date).format('YYYY-MM-DD')==startDate)
          {
           
            if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
              {
                console.log('sssssssssssstrue')
                cancelled=true
              }
              else{
                cancelled=false
              }
             if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS"))
             {
               
               cancelled=false
             }
          }
          
          var ticket=[];
         
          for( let k=0;k<data.dataValues.salonBookingServices.length;k++)
          {
            
            ticket.push({
               id:data.dataValues.salonBookingServices[k].dataValues.id,
               ticketName:data.dataValues.salonBookingServices[k].dataValues.salonService.dataValues.ticketName,
               price:data.dataValues.salonBookingServices[k].dataValues.salonService.dataValues.price,
               description:data.dataValues.salonBookingServices[k].dataValues.salonService.dataValues.description,   
            })
          }
          booking.push({
            id:data.dataValues.id,
            startDate:data.dataValues.startDate,
            startTime:data.dataValues.startTime,
            endTime:data.dataValues.endTime,
            preferedTime:data.dataValues.preferTime,
            noOfPerson:data.dataValues.noOfPerson,
            serviceAt:data.dataValues.serviceAt,
            isCancelled:cancelled,
            status:data.dataValues.status,
            address:data.dataValues.address,
            type:data.dataValues.type,
            ticket
          })
        
        

        const event = await db.salon.findOne({
          attributes:["title","address","lat","long","showAddress"],
          where:{id:data.dataValues.salon_id}
        })
        const user = await db.users.findOne({
          attributes:["mobile","countryCode"],
          where:{id:data.dataValues.user_id},
        })
       

        return h.response({
          responseData:{
            event,
            user,
            text:"Are you sure you want to cancel",
            totalAmount:totalAmount,
            paymentMode:data.dataValues.paymentMode,
            booking,
            supportEmail:'syed@illuminz.com',
            supportNumber:'9090909098'
          }
        })
      }
      if(request.query.type=="club")
      {
        var data = await db.clubBooking.findOne({
          attributes:["club_id","user_id","status","startTime","endTime","startDate","preferTime","totalAmount","type","noOfPerson"],
          where:{id:request.params.id,user_id:authToken.userId},
          include:[{
            model:Models.clubBookingServices,
            include:[{model:Models.clubServices}]
          }],
        })

        if(!data)
        {
          return h.response({message:"Enter a valid booking id"}).code(400)
        }
        var totalAmount=data.dataValues.totalAmount
     
        
          var status =data.dataValues.status;
         var startDate=moment(data.dataValues.startDate).format('YYYY-MM-DD')
         var timeD=moment(startDate + " " +data.dataValues.startTime).utcOffset("-05:30")
         console.log('before',timeD)
         console.log('date',moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
         console.log('time',timeD.format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
          if(moment(date).format('YYYY-MM-DD')>startDate)
          {
            cancelled=false
          }
          if(moment(date).format('YYYY-MM-DD')<startDate && status!=="CANCELLED"){
            cancelled=true
          }
          else{
            cancelled=false
          }

         if(moment(date).format('YYYY-MM-DD')==startDate)
          {
           
            if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") <= timeD.format("YYYY-MM-DDTHH:mm:ss.SSS") && status!=="CANCELLED")
              {
                console.log('sssssssssssstrue')
                cancelled=true
              }
              else{
                cancelled=false
              }
             if(moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS") > timeD.format("YYYY-MM-DDTHH:mm:ss.SSS"))
             {
               
               cancelled=false
             }
          }
          
          var ticket=[];
         
          for( let k=0;k<data.dataValues.clubBookingServices.length;k++)
          {
           console.log('SSSSSAAAA',data.dataValues.clubBookingServices[k].dataValues) 
            ticket.push({
               id:data.dataValues.clubBookingServices[k].dataValues.id,
               ticketSold:data.dataValues.clubBookingServices[k].dataValues.ticketSold,
               ticketName:data.dataValues.clubBookingServices[k].dataValues.clubService.dataValues.ticketName,
               price:data.dataValues.clubBookingServices[k].dataValues.clubService.dataValues.price,
               description:data.dataValues.clubBookingServices[k].dataValues.clubService.dataValues.description,   
            })
          }
          booking.push({
            id:data.dataValues.id,
            startDate:data.dataValues.startDate,
            startTime:data.dataValues.startTime,
            endTime:data.dataValues.endTime,
            noOfPerson:data.dataValues.noOfPerson,
            preferedTime:data.dataValues.preferTime,
            isCancelled:cancelled,
            status:data.dataValues.status,
            type:data.dataValues.type,
            ticket
          })
        
        

        const event = await db.clubs.findOne({
          attributes:["title","address","lat","long"],
          where:{id:data.dataValues.club_id}
        })
        const user = await db.users.findOne({
          attributes:["mobile","countryCode"],
          where:{id:data.dataValues.user_id},
        })
       

        return h.response({
          responseData:{
            event,
            user,
            text:"Are you sure you want to cancel",
            totalAmount:totalAmount,
            paymentMode:data.dataValues.paymentMode,
            booking,
            supportEmail:'syed@illuminz.com',
            supportNumber:'9090909098'
          }
        })
      }
      
    }
    catch(e){
      console.log('SSSSSS',e)
    }
  }

  ticketRemainByDate=async(request,h)=>{
    try{
      const authToken = request.auth.credentials.userData
      const newDate = new Date();
      // const formatDate = moment(request.payload.startDate).format("YYYY-MM-DD");
      // console.log("formatDate",formatDate+' 00:00:00')
      var totalTicket = null;
      if(request.payload.id == '')
      {
        return h.response({message:"Enter Id"})
      }
      if(request.payload.type=="event")
      {
      const remain = await db.eventBookingTimings.findAll({
        attributes:["ticketBooked"],
        where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
      })
      var total=0;
      console.log('SSSSSSSSS',remain)
      if(remain)
      {
      for(let i=0;i<remain.length;i++){
        total = remain[i].dataValues.ticketBooked + total
      }
      console.log('SSSSS',total)
      if(totalTicket==null)
      {
      var totalticket = await db.event.findOne({
         attributes:["capacity"], 
        where:{id: request.payload.id}
      })
      if(!totalticket)
      {
        return h.response({message:"Enter Valid Id"})
      }
    }
      totalTicket = totalticket.dataValues.capacity
      console.log('SSSSSSSS',totalTicket)

      var ticketRemain = totalTicket - total
       totalticket=ticketRemain
      
       if(ticketRemain <=0)
       {
         return h.response({message:'Out Of stock'}).code(400)
       }
      
      return h.response({
        responseData:{
           remainingTickets: ticketRemain
        }
      })
    }
      return h.response({
        responseData:{
          remainingTickets:totalTicket
        }
        })
     }
     
     if(request.payload.type=="activity")
     {
      const remain = await db.activityBookingTimings.findAll({
        attributes:["ticketBooked"],
        where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
      })
      var total=0;
      console.log('SSSSSSSSS',remain)
      if(remain)
      {
      for(let i=0;i<remain.length;i++){
        total = remain[i].dataValues.ticketBooked + total
      }
      console.log('SSSSS',total)
      if(totalTicket==null)
      {
      var totalticket = await db.activity.findOne({
         attribute:["capacity"], 
        where:{id: request.payload.id}
      })
      if(!totalticket)
      {
        return h.response({message:"Enter Valid Id"})
      }
    }
      totalTicket = totalticket.dataValues.capacity
      console.log('SSSSSSSS',totalTicket)

      var ticketRemain = totalTicket - total
       totalticket=ticketRemain

       if(ticketRemain <=0)
       {
         return h.response({message:'Out Of stock'}).code(400)
       }
      
      return h.response({
        responseData:{
           remainingTickets: ticketRemain
        }
      })
    }
      return h.response({
        responseData:{
          remainingTickets:totalTicket
        }
        })
     }
     if(request.payload.type=="shops")
     {
       return h.response({
        responseData:{
          remainingTickets:'34343'
       }
       })
     }
     if(request.payload.type=="club")
     {
      return h.response({
        responseData:{
          remainingTickets:'34343'
       }
       })
     }
     
    }
    catch(e){
      console.log('SSSSSSSSSS',e)
    }
  }

  cancelBooking=async(request,h)=>{
    try{
      var authToken = request.auth.credentials.userData
      var currentDate = moment(new Date())
      var cancelTicket=0

      const gateway = await new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: "35y8p9yjr3vfh2bn",
        publicKey: "xnth54rqpr4fzgmn",
        privateKey: "d217d871d3ef2845cff15c2b0ce3b577"
      });
      const fcmToken = await db.userAccesses.findAll({
        where:{user_id:authToken.userId,fcmToken:{[Op.ne]:null}}
      })
      var n = fcmToken.length - 1
    
      if(request.payload.type=="event")
      {
      const data = await db.booking.findOne({
        attributes:["event_id","paymentMode"],
        where:request.payload.bookingId
      }) 
     if(!data)
     {
       return h.response({message:"Enter Valid BookingId"})
     }    
      const refund = await db.event.findOne({
        attributes:["refundTime"],
        where:data.dataValues.event_id
      })
      console.log('SSSSSSSS',refund)
      const slot= await db.eventBookingTimings.findOne({
        attributes:["createdAt","ticketBooked"],
        where:{id:request.payload.slotId,booking_id:request.payload.bookingId}
      })
      var bookingDate=moment(slot.dataValues.createdAt)
      
      console.log('SSSS',bookingDate)
      console.log('DDDDDDDDDDDDDD@@',currentDate)
      
      var timediff=moment.duration(currentDate.diff(bookingDate));
         console.log('DDDDDDDDDDDD',timediff.asHours())
         var timeHour=timediff.asHours()

      if( timeHour > refund.dataValues.refundTime )
      {
        const CancelStatus = await db.eventBookingTimings.update({
          status:'CANCELLED'
        },{where:{
            id:request.payload.slotId
        }})
  
        return h.response({message:"No Refund"})
      } 

      const ticketPrice = await db.userBookingEventsTicket.findAll({
        attributes:["ticketSold","ticket_id"],
        where:{slot_id:request.payload.slotId}
      })

      var amount=0;

      for(let i=0;i<ticketPrice.length;i++)
      {
        var ticketData = await db.ticket.findOne({
          attributes:["price"],
          where:{id:ticketPrice[i].dataValues.ticket_id}
        })

        

        amount = ticketPrice[i].dataValues.ticketSold * ticketData.dataValues.price + amount
       var cancelTicket = cancelTicket + ticketPrice[i].dataValues.ticketSold


      }

      const transaction = await db.transaction.findOne({
        attributes:["transaction_id"],
        where:{booking_id:request.payload.bookingId,type:'event'}
      })

      if(data.dataValues.paymentMode=='CARD')
      {

      var refundData = await stripe.refunds.create({
        amount:Math.floor(amount * 100),
        charge: transaction.dataValues.transaction_id,
      });
      console.log('SSSSSSss',refundData)
      if(refundData)
      {

        const CancelStatus = await db.eventBookingTimings.update({
          status:'CANCELLED',
          refundStatus:'SUCCESS'
        },{where:{
            id:request.payload.slotId
        }})
        var ticketCancel = await db.userBookingEventsTicket.findAll({
          attributes:["ticketSold","ticket_id"],
          where:{slot_id:request.payload.slotId}
        })
  
       
        for(let i=0;i<ticketCancel.length;i++)
      {
        var ticketRemain = await db.ticket.findAll({
          where:{id:ticketCancel[i].dataValues.ticket_id}
        })
        for(var j=0;j<ticketRemain.length;j++)
        {
        var ticketData = await db.ticket.update({
          noOfTicketRemain: ticketRemain[j].dataValues.noOfTicketRemain + ticketCancel[i].dataValues.ticketSold
        },{
          where:{id:ticketCancel[i].dataValues.ticket_id}
        })
       }
      }

        let notificationData ={
          title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
                body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
                notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_REFUND.type),
          type:'event',
          actionId:JSON.stringify(request.payload.bookingId),
          user_id:JSON.stringify(authToken.userId)
        }
        let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
        console.log('SSSSSSSSSSSSSRefundNotification',send)

        const create = await db.notifications.create({
          title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
          body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
          notificationType:constant.NOTIFICATION_TYPE.BOOKING_REFUND.type,
            type:'event',
            booking_id:request.payload.bookingId,
            user_id:authToken.userId,
          notificationTo:constant.NOTIFICATION_TO.USER
        })

        }
        if(!refundData.id)
        {
          const CancelStatus = await db.eventBookingTimings.update({
            status:'CANCELLED',
            refundStatus:'FAILED'
          },{where:{
              id:request.payload.slotId
          }})
  
        }
      }

      if(data.dataValues.paymentMode=='PAYPAL')
      {
       var refundData = await gateway.transaction.refund(`${transaction.dataValues.transaction_id}`) 
       console.log('refundDataPaypal',refundData)

       if(refundData)
       {
         const CancelStatus = await db.eventBookingTimings.update({
           status:'CANCELLED',
           refundStatus:'SUCCESS'
         },{where:{
             id:request.payload.slotId
         }})

         var ticketCancel = await db.userBookingEventsTicket.findAll({
          attributes:["ticketSold","ticket_id"],
          where:{slot_id:request.payload.slotId}
        })
  
       
        for(let i=0;i<ticketCancel.length;i++)
      {
        var ticketRemain = await db.ticket.findAll({
          where:{id:ticketCancel[i].dataValues.ticket_id}
        })
        for(var j=0;j<ticketRemain.length;j++)
        {
        var ticketData = await db.ticket.update({
          noOfTicketRemain: ticketRemain[j].dataValues.noOfTicketRemain + ticketCancel[i].dataValues.ticketSold
        },{
          where:{id:ticketCancel[i].dataValues.ticket_id}
        })
       }
      }
 
         let notificationData ={
           title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
            body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
            notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_REFUND.type),
           type:'event',
           actionId:JSON.stringify(request.payload.bookingId),
           user_id:JSON.stringify(authToken.userId)
         }
        let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
        console.log('SSSSSSSSSSSSSRefundNotification',send)
 
        const create = await db.notifications.create({
         title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
         body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
         notificationType:constant.NOTIFICATION_TYPE.BOOKING_REFUND.type,
           type:'event',
           booking_id:request.payload.bookingId,
           user_id:authToken.userId,
          notificationTo:constant.NOTIFICATION_TO.USER
       })
         }

         if(!refundData)
         {
           const CancelStatus = await db.eventBookingTimings.update({
             status:'CANCELLED',
             refundStatus:'FAILED'
           },{where:{
               id:request.payload.slotId
           }})
   
         }
       
       
      }

      

      return h.response({message:"refund"})

    }
    if(request.payload.type=="activity")
    {
      const data = await db.activityBooking.findOne({
        attributes:["activity_id","paymentMode"],
        where:request.payload.bookingId
      }) 
     if(!data)
     {
       return h.response({message:"Enter Valid BookingId"})
     }    
      const refund = await db.activity.findOne({
        attributes:["refundTime"],
        where:data.dataValues.activity_id
      })
      console.log('SSSSSSSS',refund)
      const slot= await db.activityBookingTimings.findOne({
        attributes:["createdAt"],
        where:{booking_id:request.payload.bookingId}
      })
      var bookingDate=moment(slot.dataValues.createdAt)
      
      
      var timediff=moment.duration(currentDate.diff(bookingDate));
         var timeHour=timediff.asHours()

      if( timeHour > refund.dataValues.refundTime )
      {
        const CancelStatus = await db.activityBooking.update({
          status:'CANCELLED'
        },{where:{
            id:request.payload.bookingId
        }})
        const CancelStat = await db.activityBookingTimings.update({
          status:'CANCELLED',
          refundStatus:'NO Refund'
        },{where:{
            booking_id:request.payload.bookingId
        }})
      

        return h.response({message:"No Refund"})
      } 

      const amount = await db.transaction.findOne({
        attributes:["transaction_id"],
        where:{booking_id:request.payload.bookingId,type:'activity'}
      })

      if(data.dataValues.paymentMode=='CARD')
      {
        var refundData = await stripe.refunds.create({
          charge: amount.dataValues.transaction_id,
        });

        if(refundData)
        {
          console.log('SSSSSSSSREFUNDDATA',refundData)
          const CancelStatus = await db.activityBooking.update({
            status:'CANCELLED'
          },{where:{
              id:request.payload.bookingId
          }})
    
          const CancelStat = await db.activityBookingTimings.update({
            status:'CANCELLED',
            refundStatus:'SUCCESS'
          },{where:{
              booking_id:request.payload.bookingId
          }})

          var ticketCancel = await db.activityBookingTickets.findAll({
            attributes:["ticketSold","ticket_id"],
            where:{booking_id:request.payload.bookingId}
          })
    
         
          for(let i=0;i<ticketCancel.length;i++)
        {
          var ticketRemain = await db.activityTicket.findAll({
            where:{id:ticketCancel[i].dataValues.ticket_id}
          })
          for(var j=0;j<ticketRemain.length;j++)
          {
          var ticketData = await db.activityTicket.update({
            noOfTicketRemain: ticketRemain[j].dataValues.noOfTicketRemain + ticketCancel[i].dataValues.ticketSold
          },{
            where:{id:ticketCancel[i].dataValues.ticket_id}
          })
         }
        }
          
        

          let notificationData ={
            title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
            body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
            notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_REFUND.type),
            type:'activity',
            actionId:JSON.stringify(request.payload.bookingId),
            user_id:JSON.stringify(authToken.userId)
          }
          
         let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
         console.log('SSSSSSSSSSSSSRefundNotification',send)

         const create = await db.notifications.create({
          title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
          body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
          notificationType:constant.NOTIFICATION_TYPE.BOOKING_REFUND.type,
            type:'activity',
            booking_id:request.payload.bookingId,
            user_id:authToken.userId,
            notificationTo:constant.NOTIFICATION_TO.USER
        })
        }
        if(!refundData.id)
        {
          const CancelStat = await db.activityBookingTimings.update({
            status:'CANCELLED',
            refundStatus:'Failed'
          },{where:{
              booking_id:request.payload.bookingId
          }})
        }
      }

      if(data.dataValues.paymentMode=='PAYPAL')
      {
       var refundData = gateway.transaction.refund(`${amount.dataValues.transaction_id}`) 
       console.log('refundDataPaypal',refundData)

       if(refundData)
        {
          console.log('SSSSSSSSREFUNDDATA',refundData)
          const CancelStatus = await db.activityBooking.update({
            status:'CANCELLED'
          },{where:{
              id:request.payload.bookingId
          }})
    
          const CancelStat = await db.activityBookingTimings.update({
            status:'CANCELLED',
            refundStatus:'SUCCESS'
          },{where:{
              booking_id:request.payload.bookingId
          }})

          
          var ticketCancel = await db.activityBookingTickets.findAll({
            attributes:["ticketSold","ticket_id"],
            where:{booking_id:request.payload.bookingId}
          })
    
         
          for(let i=0;i<ticketCancel.length;i++)
        {
          var ticketRemain = await db.activityTicket.findAll({
            where:{id:ticketCancel[i].dataValues.ticket_id}
          })
          for(var j=0;j<ticketRemain.length;j++)
          {
          var ticketData = await db.activityTicket.update({
            noOfTicketRemain: ticketRemain[j].dataValues.noOfTicketRemain + ticketCancel[i].dataValues.ticketSold
          },{
            where:{id:ticketCancel[i].dataValues.ticket_id}
          })
         }
        }

          let notificationData ={
            title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
            body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
            notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_REFUND.type),
            type:'activity',
            actionId:JSON.stringify(request.payload.bookingId),
            user_id:JSON.stringify(authToken.userId)
          }
          
         let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
         console.log('SSSSSSSSSSSSSRefundNotification',send)

         const create = await db.notifications.create({
          title:constant.NOTIFICATION_TYPE.BOOKING_REFUND.title,
          body:constant.NOTIFICATION_TYPE.BOOKING_REFUND.body,
          notificationType:constant.NOTIFICATION_TYPE.BOOKING_REFUND.type,
            type:'activity',
            booking_id:request.payload.bookingId,
            user_id:authToken.userId,
            notificationTo:constant.NOTIFICATION_TO.USER
        })
        }
        if(!refundData)
        {
          const CancelStat = await db.activityBookingTimings.update({
            status:'CANCELLED',
            refundStatus:'Failed'
          },{where:{
              booking_id:request.payload.bookingId
          }})
        }
        
      }

        return h.response({message:"refund"})
      
     

     
    }
    if(request.payload.type=="shops")
    {
      const CancelStatus = await db.salonBooking.update({
        status:'CANCELLED'
      },{where:{
          id:request.payload.bookingId,user_id:authToken.userId
      }})

      if(CancelStatus)
      {
        await db.salonBooking.update({
          type:'cancelled'
        },{where:{
            id:request.payload.bookingId,user_id:authToken.userId
        }})
      }

      return h.response({
        responseData:{
          message:"Success"
        }
          
        
      })

    }
    if(request.payload.type=="club"){
      const CancelStatus = await db.clubBooking.update({
        status:'CANCELLED'
      },{where:{
          id:request.payload.bookingId,user_id:authToken.userId
      }})

      if(CancelStatus)
      {
        await db.clubBooking.update({
          type:'cancelled'
        },{where:{
            id:request.payload.bookingId,user_id:authToken.userId
        }})
      }

      return h.response({
        responseData:{
          message:"Success"
        }
      })
    }
  }
    catch(e){
        console.log(e)
    }
  }

  activityCancelBooking=async(request,h)=>{
    try{
      const authToken = request.auth.credentials.userData
      var currentDate = moment(new Date())
      const data = await db.activityBooking.findOne({
        attributes:["activity_id"],
        where:request.payload.bookingId
      }) 
     if(!data)
     {
       return h.response({message:"Enter Valid BookingId"})
     }    
      const refund = await db.activity.findOne({
        attributes:["refundTime"],
        where:data.dataValues.activity_id
      })
      console.log('SSSSSSSS',refund)
      const slot= await db.activityBookingTimings.findOne({
        attributes:["createdAt"],
        where:{booking_id:request.payload.bookingId}
      })
      var bookingDate=moment(slot.dataValues.createdAt)
      
      console.log('SSSS',bookingDate)
      console.log('DDDDDDDDDDDDDD@@',currentDate)
      
      var timediff=moment.duration(currentDate.diff(bookingDate));
         console.log('DDDDDDDDDDDD',timediff.asHours())
         var timeHour=timediff.asHours()

      if( timeHour > refund.dataValues.refundTime )
      {
        return h.response({message:"No Refund"})
      } 

      const CancelStatus = await db.activityBooking.update({
        status:'CANCELLED'
      },{where:{
          id:request.payload.bookingId
      }})

      
      const CancelStat = await db.activityBookingTimings.update({
        status:'CANCELLED'
      },{where:{
          id:request.payload.bookingId
      }})

      return h.response({message:"refund"})
    }
    catch(e)
    {
      console.log('SSSSSSSSSSSSS',e)
    }
  }

  clientToken = async(request,h)=>{
    try{
      var authToken = request.auth.credentials.userData

      const gateway = await new braintree.BraintreeGateway({
            environment: braintree.Environment.Sandbox,
            merchantId: "35y8p9yjr3vfh2bn",
            publicKey: "xnth54rqpr4fzgmn",
            privateKey: "d217d871d3ef2845cff15c2b0ce3b577"
          });

        const token = await  gateway.clientToken.generate();
          console.log('SSSSSSS',token)

          return h.response({
            responseData:{
              token:token.clientToken
            }
          })
    }
    catch(e)
    {
      console.log('SSSSSS',e)
    }
  }

  getTicket = async (request,h, internal) => {
    try {
      console.log(request.payload)
      const authToken = request.auth.credential
      var tickets;
      
      if(request.payload.startTime=='' || request.payload.endTime==''|| request.payload.id=='' || request.payload.startDate=='')
      {
        return h.response({message:"Enter all the request payload"}).code(400)
      }
      var serviceCharge = await db.eventSetting.findOne({attributes:['serviceTax']})
      
        if(request.payload.type=="event")
        {
        const remain = await db.eventBookingTimings.findAll({
          attributes:["booking_id"],
          where:{startDate: request.payload.startDate,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
        })
        console.log('already bookings',remain.length)
        if(remain.length==0 )
        {
         
          var ticketFinal=[]
          var TicketData = await db.ticket.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
            where:{event_id:request.payload.id}
          })
          console.log("TicketData",TicketData)
          
          for(let i=0;i<TicketData.length;i++)
          {
            var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              // ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price + servicePrice,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }

          if(internal){
            return ticketFinal
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
        }
        for(let i =0 ;i<remain.length;i++)
        {
          var remainticket =await db.userBookingEventsTicket.findAll({
            attributes:["ticket_id","ticketSold"],
            where:{booking_id:remain[i].dataValues.booking_id}
          })
          console.log("user booked tickets",remainticket)
        }
        var ticketDate=[]
      for(let i=0;i<remainticket.length;i++){
        var noOfticket = await db.ticket.findAll({
          attributes:["noOfTicketAvailable"],
          where:{id:remainticket[i].dataValues.ticket_id}
        })
        console.log("ticket available",noOfticket)
        for(let j=0;j<noOfticket.length;j++)
        {
          if(noOfticket[j].dataValues.noOfTicketAvailable!==0)
          {
          var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketAvailable - remainticket[i].dataValues.ticketSold
          console.log('noOfTicketRemain',noOfTicketRemain)
          var ticket_id = remainticket[i].dataValues.ticket_id
          ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          }
          // if(noOfticket[j].dataValues.noOfTicketRemain==0)
          // {
          //   var noOfTicketRemain=0
          //   var ticket_id = remainticket[i].dataValues.ticket_id
          //   ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          // }

          
        }

        // var update = await db.ticket.update({
        //   noOfTicketRemain:noOfTicketRemain
        // },{
        //   where:{id:remainticket[i].dataValues.ticket_id}
        // })
      }
    
      console.log('SSSSSSDate',ticketDate)
      var ticketFinal =[]
      var TicketData = await db.ticket.findAll({
        where:{event_id:request.payload.id}
      })
      for(let i=0 ; i<TicketData.length;i++)
      {
        var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
        let flag = 0
        for(let j=0 ;j<ticketDate.length;j++)
        {
          if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
          {
            
            ticketFinal.push({
                id:TicketData[i].dataValues.id,
                ticketRemain:ticketDate[j].noOfTicketRemain,
                noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
                ticketName:TicketData[i].dataValues.ticketName,
                price:TicketData[i].dataValues.price + servicePrice ,
                description:TicketData[i].dataValues.description,
                minLimit:TicketData[i].dataValues.minLimit,
                maxLimit:TicketData[i].dataValues.maxLimit
              })    
              flag = 1;
              break;
      }
      }
      if(flag==0)
      {
      ticketFinal.push({
        id:TicketData[i].dataValues.id,
        ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
        noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
        ticketName:TicketData[i].dataValues.ticketName,
        price:TicketData[i].dataValues.price + servicePrice ,
        description:TicketData[i].dataValues.description,
        minLimit:TicketData[i].dataValues.minLimit,
        maxLimit:TicketData[i].dataValues.maxLimit
      })
    }
      }
        if(!TicketData){
          return h.response({message:"Enter Valid Id"}).code(400)
        }
        if(internal){
          return ticketFinal
        }
        return h.response({
          responseData:{
            ticket:ticketFinal,
          /*  totalTicketAvailable:tickets */
          }
        });
      }
      if(request.payload.type=="activity")
      {
        const remain = await db.activityBookingTimings.findAll({
          attributes:["booking_id"],
          where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
        })
        console.log('SSSSSSSS',remain.length)
        if(remain.length==0)
        {
          var ticketFinal=[]
          var TicketData = await db.activityTicket.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
            where:{activity_id:request.payload.id}
          })
          
          for(let i=0;i<TicketData.length;i++)
          {
            var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price + servicePrice ,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
        }
        for(let i =0 ;i<remain.length;i++)
        {
          var remainticket =await db.activityBookingTickets.findAll({
            attributes:["ticket_id","ticketSold"],
            where:{booking_id:remain[i].dataValues.booking_id}
          })
        }
        console.log('SSSSSSSSSsticket',remainticket)
        var ticketDate=[]
      for(let i=0;i<remainticket.length;i++){
        var noOfticket = await db.activityTicket.findAll({
          attributes:["noOfTicketRemain"],
          where:{id:remainticket[i].dataValues.ticket_id}
        })
        for(let j=0;j<noOfticket.length;j++)
        {
          if(noOfticket[j].dataValues.noOfTicketRemain!==0)
          {
          console.log('SSSSS',noOfticket[j].dataValues.noOfTicketRemain)
          var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketRemain - remainticket[i].dataValues.ticketSold
          var ticket_id = remainticket[i].dataValues.ticket_id
          ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          }
          if(noOfticket[j].dataValues.noOfTicketRemain==0)
          {
            var noOfTicketRemain=0
            var ticket_id = remainticket[i].dataValues.ticket_id
            ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          }
          
        }

        var update = await db.activityTicket.update({
          noOfTicketRemain:noOfTicketRemain
        },{
          where:{id:remainticket[i].dataValues.ticket_id}
        })

      
      }
      console.log('SSSSSSDate',ticketDate)
      var ticketFinal =[]
      var TicketData = await db.activityTicket.findAll({
        where:{activity_id:request.payload.id}
      })
      for(let i=0 ; i<TicketData.length;i++)
      {
        var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
        let flag = 0
        for(let j=0 ;j<ticketDate.length;j++)
        {
          if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
          {
            ticketFinal.push({
                id:TicketData[i].dataValues.id,
                ticketRemain:ticketDate[j].noOfTicketRemain,
                noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
                ticketName:TicketData[i].dataValues.ticketName,
                price:TicketData[i].dataValues.price + servicePrice ,
                description:TicketData[i].dataValues.description,
                minLimit:TicketData[i].dataValues.minLimit,
                maxLimit:TicketData[i].dataValues.maxLimit
              })    
              flag = 1;
              break;
      }
      }
      if(flag==0)
      {
      ticketFinal.push({
        id:TicketData[i].dataValues.id,
        ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
        noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
        ticketName:TicketData[i].dataValues.ticketName,
        price:TicketData[i].dataValues.price + servicePrice ,
        description:TicketData[i].dataValues.description,
        minLimit:TicketData[i].dataValues.minLimit,
        maxLimit:TicketData[i].dataValues.maxLimit
      })
    }
      }
        if(!TicketData){
          return h.response({message:"Enter Valid Id"}).code(400)
        }
        return h.response({
          responseData:{
            ticket:ticketFinal,
          /*  totalTicketAvailable:tickets */
          }
        });
      }
      if(request.payload.type=='shops')
      {
        var ticketFinal=[]
          var TicketData = await db.salonServices.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description"],
            where:{salon_id:request.payload.id}
          })
          
          for(let i=0;i<TicketData.length;i++)
          {
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
      }
      if(request.payload.type=="club")
      {
        var ticketFinal=[]
          var TicketData = await db.clubServices.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","priceFor"],
            where:{club_id:request.payload.id}
          })
          
          for(let i=0;i<TicketData.length;i++)
          {
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price,
              priceFor:TicketData[i].dataValues.priceFor,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
      }
    } catch (e) {
      console.log("ss", e);
    }
  };

}

module.exports = new booking();
