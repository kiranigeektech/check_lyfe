
const db = require("../models/index");
const constant = require('../config/constant')

class eventRating {
  getRating = async (request,h) => {
    try {
      var totalPages;
      var averageRating;
      const query = request.query;
      const page = query.page ? query.page : 1;
      if(query.type=='event'){
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
                      /* ["id", "data"],  */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          distinct: true,
          order: [["id", "DESC"]], 
          offset: (parseInt(page) - 1) * 10,
          limit:10,
          where: { event_id:request.query.id,status:constant.RATING_STATUS.SHOW },
        })
      
      totalPages = await UniversalFunctions.getTotalPages(review.count, 10);
       averageRating = await db.event.findOne({
         attributes:["rating"],
         where:{id:request.query.id}
       })
       }
    if(query.type=='club'){
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
        distinct: true,
        order: [["id", "DESC"]],
        offset: (parseInt(page) - 1) * 10, 
        limit:10,
        where: { club_id:request.query.id ,status:constant.RATING_STATUS.SHOW},
      })
      totalPages = await UniversalFunctions.getTotalPages(review.count, 10);
      averageRating = await db.clubs.findOne({
        attributes:["rating"],
        where:{id:request.query.id}
      })
      }
      if(query.type=='activity'){
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
          distinct: true,
          order: [["id", "DESC"]], 
          offset: (parseInt(page) - 1) * 10,
          limit:10,
          where: { activity_id:request.query.id,status:constant.RATING_STATUS.SHOW },
        })
        totalPages = await UniversalFunctions.getTotalPages(review.count, 10);
        averageRating = await db.activity.findOne({
          attributes:["rating"],
          where:{id:request.query.id}
        })
      }
      if(query.type=='restaurant'){
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
                      /* ["id", "data"], */
                      "originalName",
                      "filename",
                    ],
                    model: Models.attachments,
                  },
                ],
              }
          ],  
          distinct: true,
          limit:10,
          offset: (parseInt(page) - 1) * 10,
          order: [["id", "DESC"]], 
          where: { restaurant_id:request.query.id,status:constant.RATING_STATUS.SHOW },
        })
        totalPages = await UniversalFunctions.getTotalPages(review.count, 10);
        averageRating = await db.restaurant.findOne({
          attributes:["rating"],
          where:{id:request.query.id}
        })
      }
      if(query.type=='shops')
      {
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
          distinct: true,
          order: [["id", "DESC"]], 
          offset: (parseInt(page) - 1) * 10,
          limit:10,
          where: { salon_id:request.query.id,status:constant.RATING_STATUS.SHOW },
        })
        totalPages = await UniversalFunctions.getTotalPages(review.count, 10);
        averageRating = await db.salon.findOne({
          attributes:["rating"],
          where:{id:request.query.id}
        })
      }

      return h.response({
        responseData:{
          review:review.rows,
          averageRating:averageRating.rating ? averageRating.rating : 0,
          totalRecords: review.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 10,
          loadMoreFlag: review.rows.length < 10 ? 0 : 1,
        },
        message: "Successfull",
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  addRating = async (request,h) => {
    try {
      var rating=0;
      var average;
      var total;
      var ratingData;
      var averageRating;
     var authToken = request.auth.credentials.userData;
     if(request.payload.type=='event'){

        if (request.payload.rating && request.payload.id) {
          var data = await db.event.findOne({ where: { id: request.payload.id } })
          //send notification to vendor
          const create = await db.notifications.create({
            title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.title,
            body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.body,
            notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.type,
            type:request.payload.type,
            user_id:data.dataValues.user_id,
            notificationTo:constant.NOTIFICATION_TO.VENDOR
          })
        }

       if(request.payload.bookingId)
       {
        var oldrating = await db.eventRating.findAll({
          attributes:["rating"],
          where:{booking_id:request.payload.bookingId}
        })
       }
       if(request.payload.id)
       {
        var oldrating = await db.eventRating.findAll({
          attributes:["rating"],
          where:{event_id:request.payload.id}
        })
       }
    
      console.log('SSSSSSSSSSSSSS',oldrating.length)
      if(oldrating.length!==0)
      {
        for(let i=0;i<oldrating.length;i++)
      {
        rating = parseInt(oldrating[i].dataValues.rating) + parseInt(rating)
      }
       total= oldrating.length
      if(request.payload.rating){
        average = request.payload.rating  + rating
       averageRating = parseInt(average)/parseInt(total+1)
          console.log('SSSSSSSSSSSaverageRating',averageRating)
      }
      }
      if(averageRating)
      {
        if(request.payload.bookingId )
        {
          console.log('SSSSSSSSSSSSSSS')
        ratingData = await db.eventRating.update({
          /* user_id:authToken.userId,
          booking_id:request.payload.bookingId, */
          review:request.payload.review,
          averageRating: averageRating,
          rating:request.payload.rating   
      },{
        where:{user_id:authToken.userId,booking_id:request.payload.bookingId}
      }) 

      return h.response({message:'successfull'})
    }
    if(request.payload.id)
    {
      ratingData = await db.eventRating.create({
        user_id:authToken.userId,
        booking_id:request.payload.bookingId,
        event_id:request.payload.id,
        review:request.payload.review,
        averageRating: averageRating,
        rating:request.payload.rating   
    }) 
    
          var eventUpdate = await db.event.update({
            rating:averageRating.toFixed(1),
            ratingCount:parseInt(total+1)
          },{
            where:{id:request.payload.id}
          })
    }
      }
      if(oldrating.length == 0)
      {
      if(!averageRating)
      {
         ratingData = await db.eventRating.create({
            user_id:authToken.userId,
            event_id:request.payload.id,
            booking_id:request.payload.bookingId,
            review:request.payload.review,
            averageRating: request.payload.rating,
            rating:request.payload.rating
        })
        if(request.payload.id)
        {
          var eventUpdate = await db.event.update({
            rating:request.payload.rating,
            ratingCount:1
          },{
            where:{id:request.payload.id}
          })
        }  
      
      }
    }
    let ratingGallaries = [];
    if(request.payload.ratinggalleries)
   {
    for (let i = 0; i <request.payload.ratinggalleries.length; i++) {
      let obj = {
        rating_id: ratingData.dataValues.id,
        attachment_id:request.payload.ratinggalleries[i],
      };
      ratingGallaries.push(obj);
    }
    await db.eventRatingGallery.bulkCreate(ratingGallaries);
    }
    return h.response({
      ratingData, 
      message:"Thanku For rating"
  })

     }
      if(request.payload.type=='club'){
        if (request.payload.rating && request.payload.id) {
          var data = await db.clubs.findOne({ where: { id: request.payload.id } })
          if(data.dataValues.user_id){
            //send notification to vendor
            const create = await db.notifications.create({
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.title,
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.body,
              notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.type,
              type:request.payload.type,
              user_id:data.dataValues.user_id,
              notificationTo:constant.NOTIFICATION_TO.VENDOR
            })
          }

        }

        if(request.payload.bookingId)
        {
         var oldrating = await db.clubRating.findAll({
           attributes:["rating"],
           where:{booking_id:request.payload.bookingId}
         })
        }
        if(request.payload.id)
        {
         var oldrating = await db.clubRating.findAll({
           attributes:["rating"],
           where:{club_id:request.payload.id}
         })
        }
        
        if(oldrating.length!==0)
        {
          for(let i=0;i<oldrating.length;i++)
        {
          rating = parseInt(oldrating[i].dataValues.rating) + parseInt(rating)
        }
        console.log('SSSSSSSSSSSSSrating',rating)
        total= oldrating.length
        console.log('SSSSSSSSSSSSSSSSS',total)
        if(request.payload.rating){
          average = request.payload.rating  + rating
        averageRating = parseInt(average)/parseInt(total+1)
            console.log('SSSSSSSSSSS',averageRating)
        }
        }
        if(averageRating)
        {
          if(request.payload.bookingId )
        {
            ratingData = await db.clubRating.update({
            /*  user_id:authToken.userId,
              booking_id:request.payload.bookingId, */
              review:request.payload.review,
              averageRating: averageRating,
              rating:request.payload.rating   
          },{
            where:{userId:authToken.userId,booking_id:request.payload.bookingId}
          })

            return h.response({message:'successfull'}) 
        }
        if(request.payload.id)
        {
              ratingData = await db.clubRating.create({
                userId:authToken.userId,
                club_id:request.payload.id,
                review:request.payload.review,
                averageRating: averageRating,
                rating:request.payload.rating   
            }) 
                var clubUpdate = await db.clubs.update({
                  rating:averageRating.toFixed(1),
                  ratingCount:parseInt(total+1)
                },{
                  where:{id:request.payload.id}
                })
              }
        }
        if(oldrating.length == 0)
        {
        if(!averageRating)
        {
          ratingData = await db.clubRating.create({
              userId:authToken.userId,
              club_id:request.payload.id,
              booking_id:request.payload.bookingId,
              review:request.payload.review,
              averageRating: request.payload.rating,
              rating:request.payload.rating
          })  
          if(request.payload.id)
          {
        var clubUpdate = await db.clubs.update({
            rating:request.payload.rating,
            ratingCount:1
          },{
            where:{id:request.payload.id}
          })
        }
        }
      }
      let ratingGallaries = [];
      if(request.payload.ratinggalleries)
      {
      for (let i = 0; i <request.payload.ratinggalleries.length; i++) {
        let obj = {
          rating_id: ratingData.dataValues.id,
          attachment_id:request.payload.ratinggalleries[i],
        };
        ratingGallaries.push(obj);
      }
    
      await db.clubRatingGallery.bulkCreate(ratingGallaries);
    }
          return h.response({
              ratingData, 
              message:"Thanku For rating"
          }) 
      }
      if(request.payload.type=='activity'){
        if (request.payload.rating && request.payload.id) {
          var data = await db.activity.findOne({ where: { id: request.payload.id } })
          //send notification to vendor
          const create = await db.notifications.create({
            title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.title,
            body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.body,
            notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.type,
            type:request.payload.type,
            user_id:data.dataValues.user_id,
            notificationTo:constant.NOTIFICATION_TO.VENDOR
          })
        }

        if(request.payload.bookingId)
        {
         var oldrating = await db.activityRating.findAll({
           attributes:["rating"],
           where:{booking_id:request.payload.bookingId}
         })
        }
        if(request.payload.id)
        {
        var oldrating = await db.activityRating.findAll({
          attributes:["rating"],
          where:{activity_id:request.payload.id}
        })
      }
        console.log('SSSSSSSSSSSSSS',oldrating)
        if(oldrating.length!==0)
        {
          for(let i=0;i<oldrating.length;i++)
        {
          rating = parseInt(oldrating[i].dataValues.rating) + parseInt(rating)
        }
        console.log('SSSSSSSSSSSSSrating',rating)
        total= oldrating.length
        console.log('SSSSSSSSSSSSSSSSS',total)
        if(request.payload.rating){
          average = request.payload.rating  + rating
        averageRating = parseInt(average)/parseInt(total+1)
            console.log('SSSSSSSSSSS',averageRating)
        }
        }
        if(averageRating)
        {
          if(request.payload.bookingId)
          {
            ratingData = await db.activityRating.update({
              /* user_id:authToken.userId,
              booking_id:request.payload.bookingId, */
              review:request.payload.review,
              averageRating: averageRating,
              rating:request.payload.rating   
          },{
            where:{user_id:authToken.userId,booking_id:request.payload.bookingId}
          }) 
          return h.response({message:'successfull'})
          }
          if(request.payload.id)
          {
          ratingData = await db.activityRating.create({
            user_id:authToken.userId,
            activity_id:request.payload.id,
            review:request.payload.review,
            averageRating: averageRating,
            rating:request.payload.rating   
        }) 
            var activityUpdate = await db.activity.update({
              rating:averageRating.toFixed(1),
              ratingCount:parseInt(total+1)
            },{
              where:{id:request.payload.id}
            })
          }
        }
        if(oldrating.length == 0)
        {
        if(!averageRating)
        {
          ratingData = await db.activityRating.create({
              user_id:authToken.userId,
              activity_id:request.payload.id,
              booking_id:request.payload.bookingId,
              review:request.payload.review,
              averageRating: request.payload.rating,
              rating:request.payload.rating
          }) 
          if(request.payload.id) 
          {
        var activityUpdate = await db.activity.update({
            rating:request.payload.rating,
            ratingCount:1
          },{
            where:{id:request.payload.id}
          })
        }
        }
      }
      let ratingGallaries = [];
      if(request.payload.ratinggalleries)
      {
      for (let i = 0; i <request.payload.ratinggalleries.length; i++) {
        let obj = {
          rating_id: ratingData.dataValues.id,
          attachment_id:request.payload.ratinggalleries[i],
        };
        ratingGallaries.push(obj);
      }
      await db.activityRatingGallery.bulkCreate(ratingGallaries);
    }
          return h.response({
              ratingData, 
              message:"Thanku For rating"
          }) 
      }
      if(request.payload.type=='shops'){
        if (request.payload.rating && request.payload.id) {
          var data = await db.salon.findOne({ where: { id: request.payload.id } })
          //send notification to vendor
          if(data.dataValues.user_id){
            const create = await db.notifications.create({
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.title,
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.body,
              notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.type,
              type:request.payload.type,
              user_id:data.dataValues.user_id,
              notificationTo:constant.NOTIFICATION_TO.VENDOR
            })
          }
        }
        if(request.payload.bookingId)
        {
         var oldrating = await db.salonRating.findAll({
           attributes:["rating"],
           where:{booking_id:request.payload.bookingId}
         })
        }
        if(request.payload.id)
        {
        var oldrating = await db.salonRating.findAll({
          attributes:["rating"],
          where:{salon_id:request.payload.id}
        })
      }
        console.log('SSSSSSSSSSSSSS',oldrating)
        if(oldrating.length!==0)
        {
          for(let i=0;i<oldrating.length;i++)
        {
          rating = parseInt(oldrating[i].dataValues.rating) + parseInt(rating)
        }
        console.log('SSSSSSSSSSSSSrating',rating)
        total= oldrating.length
        console.log('SSSSSSSSSSSSSSSSS',total)
        if(request.payload.rating){
          average = request.payload.rating  + rating
        averageRating = parseInt(average)/parseInt(total+1)
            console.log('SSSSSSSSSSS',averageRating)
        }
        }
        if(averageRating)
        {
          if(request.payload.bookingId)
        {
          ratingData = await db.salonRating.update({
            /* user_id:authToken.userId,
            booking_id:request.payload.bookingId, */
            review:request.payload.review,
            averageRating: averageRating,
            rating:request.payload.rating   
        },{
          where:{user_id:authToken.userId,booking_id:request.payload.bookingId}
        }) 
        return h.response({message:'successfull'})
      }
        if(request.payload.id)
        {
          ratingData = await db.salonRating.create({
            user_id:authToken.userId,
            salon_id:request.payload.id,
            review:request.payload.review,
            averageRating: averageRating,
            rating:request.payload.rating   
        }) 
            var salonUpdate = await db.salon.update({
              rating:averageRating.toFixed(1),
              ratingCount:parseInt(total+1)
            },{
              where:{id:request.payload.id}
            })
          }
        }
        if(oldrating.length == 0)
        {
        if(!averageRating)
        {
          ratingData = await db.salonRating.create({
              user_id:authToken.userId,
              salon_id:request.payload.id,
              booking_id:request.payload.bookingId,
              review:request.payload.review,
              averageRating: request.payload.rating,
              rating:request.payload.rating
          })
          if(request.payload.id)
          {  
        var salonUpdate = await db.salon.update({
            rating:request.payload.rating,
            ratingCount:1
          },{
            where:{id:request.payload.id}
          })
        }
        }
      }
      let ratingGallaries = [];
      if(request.payload.ratinggalleries)
      {
      for (let i = 0; i <request.payload.ratinggalleries.length; i++) {
        let obj = {
          rating_id: ratingData.dataValues.id,
          attachment_id:request.payload.ratinggalleries[i],
        };
        ratingGallaries.push(obj);
      }
      await db.salonRatingGallery.bulkCreate(ratingGallaries);
    }
          return h.response({
              ratingData, 
              message:"Thanku For rating"
          }) 
      }
      if(request.payload.type=='restaurant'){
        if (request.payload.rating && request.payload.id) {
          var data = await db.restaurant.findOne({ where: { id: request.payload.id } })
          //send notification to vendor
          if(data.dataValues.user_id){
            const create = await db.notifications.create({
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.title,
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.body,
              notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_RATING.type,
              type:request.payload.type,
              user_id:data.dataValues.user_id,
              notificationTo:constant.NOTIFICATION_TO.VENDOR
            })
          }

        }
        var oldrating = await db.restaurantRating.findAll({
          attributes:["rating"],
          where:{restaurant_id:request.payload.id}
        })
        console.log('SSSSSSSSSSSSSS',oldrating)
        if(oldrating.length!==0)
        {
          for(let i=0;i<oldrating.length;i++)
        {
          rating = parseInt(oldrating[i].dataValues.rating) + parseInt(rating)
        }
        console.log('SSSSSSSSSSSSSrating',rating)
        total= oldrating.length
        console.log('SSSSSSSSSSSSSSSSS',total)
        if(request.payload.rating){
          average = request.payload.rating  + rating
        averageRating = parseInt(average)/parseInt(total+1)
            console.log('SSSSSSSSSSS',averageRating)
        }
        }
        if(averageRating)
        {
          ratingData = await db.restaurantRating.create({
            user_id:authToken.userId,
            restaurant_id:request.payload.id,
            review:request.payload.review,
            averageRating: averageRating,
            rating:request.payload.rating   
        }) 
            var restaurantUpdate = await db.restaurant.update({
              rating:averageRating.toFixed(1),
              ratingCount:parseInt(total+1)
            },{
              where:{id:request.payload.id}
            })
        }
        if(oldrating.length == 0)
        {
        if(!averageRating)
        {
          ratingData = await db.restaurantRating.create({
              user_id:authToken.userId,
              restaurant_id:request.payload.id,
              review:request.payload.review,
              averageRating: request.payload.rating,
              rating:request.payload.rating
          })  
        var restaurantUpdate = await db.restaurant.update({
            rating:request.payload.rating,
            ratingCount:1
          },{
            where:{id:request.payload.id}
          })
        }
      }
      let ratingGallaries = [];
      for (let i = 0; i <request.payload.ratinggalleries.length; i++) {
        let obj = {
          rating_id: ratingData.dataValues.id,
          attachment_id:request.payload.ratinggalleries[i],
        };
        ratingGallaries.push(obj);
      }
      await db.restaurantRatingGallery.bulkCreate(ratingGallaries);
          return h.response({
              ratingData, 
              message:"Thanku For rating"
          }) 
      }
} catch (e) {
      console.log("##addaminties######", e);
    }
  };

 /*  editRating = async (request) => {
    try {
      const editRating = await db.eventRating.update(
        {
          categoryName: request.payload.categoryName,
          attachment_id:request.payload.attachment_id
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return editRating;
    } catch (e) {
      console.log("###edit####", e);
    }
  }; */

/*   deleteRating = async (request) => {
    try {
      const delRating = await db.eventRating.destroy({
        where: {
          id: request.payload.id,
        },
      });
      return "Deleted Successfully";
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  }; */
}

module.exports = new eventRating();
