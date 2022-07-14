const db = require("../models/index");
const moment = require("moment");
class Club {
  // Write your functions here

  addClub = async (request) => {
    try {
      const data = {
        title: request.payload.title,
        address: request.payload.address,
        description: request.payload.description,
        bookmarked: false,
        type:'club',
        attachmentId:request.payload.attachmentId,
        category_id:request.payload.category_id,
        clubgalleries: request.payload.clubgalleries,
        clubServices:request.payload.tickets 
        
      };
      if (request.payload.availables) {
        const newDate = new Date();
        const formatDate = moment(newDate).format("MM-DD-YYYY");
        data.availables = [];
        for(var i=0; i<request.payload.availables.length; i++){
            const startTime = moment(`${formatDate} ${request.payload.availables[i].startTime}`).format('HH:mm:ss')
            const endTime = moment(`${formatDate} ${request.payload.availables[i].endTime}`).format('HH:mm:ss');
            data.availables[i] = request.payload.availables[i]
            data.availables[i].startTime = startTime
            data.availables[i].endTime = endTime
        } 
        
      }

     const result = await db.clubs.create(data, {
        include: [
          {
            model: db.availables,
          },
          {
              model:db.attachments
          },
          {
            model:db.clubServices
          }
        ],
      }); 

      let uniqueAminites = [];
      var checkAlreadyExist;
      var finalData = [];
      var alreadyExistData = [];
      if (request.payload.amenities) {
        for(let i =0; i < request.payload.amenities.length ; i ++){
          checkAlreadyExist = await db.amenities.findOne({
             where : {
             amenitiesItem : request.payload.amenities[i].amenitiesItem
             }
         });
         if(checkAlreadyExist/* [0] */){
             alreadyExistData.push(checkAlreadyExist/* [0] */);
             finalData.push(checkAlreadyExist.dataValues.id)
             
         }
         if(!checkAlreadyExist /* [0] */ ){
             uniqueAminites.push({
                 amenitiesItem: request.payload.amenities[i].amenitiesItem,
                 attachmentId: request.payload.amenities[i].attachmentId,
             })
         }
     }
     
     const adddata = await db.amenities.bulkCreate(uniqueAminites);
     for (var i = 0; i < adddata.length; i++) {
         finalData.push(adddata[i].dataValues.id)
     }
     result.setAminitiesLists(finalData)
      }
      let clubGallaries = [];
      for (let i = 0; i <request.payload.clubgalleries.length; i++) {
        let obj = {
          club_id: result.dataValues.id,
          attachment_id:request.payload.clubgalleries[i],
        };
        clubGallaries.push(obj);
      }
      await db.clubGallery.bulkCreate(clubGallaries);
      return result;
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

  getClub = async (request,h) => {
    try {
      const query = request.query;
      const page = query.page ? query.page :1;
      var params = {};
      if (request.query.title) {
        params.title = request.query.title;
      }
      const data = await db.clubs.findAndCountAll({
        attributes:[ "id","title", "address","description","bookmarked","rating","ratingCount"],
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
        limit:10,
        where: params,
      });

      let totalPages = await UniversalFunctions.getTotalPages(
        data.count,
        10
      );

      const count = await db.clubs.count({})
      return h.response({
        responseData:
        {
          data:data.rows,
          totalRecords: data.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage:10,
          loadMoreFlag: data.rows.length < 10 ? 0 : 1,
        },
        message:"Succesfull"
      });
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

  groupBy=(collection, property) =>{
    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
  }

  getClubById = async (request,h) => {
    try {
      const result = await db.clubs.findOne({
        attributes:[ "id","title", "address","description","bookmarked","rating","ratingCount"],
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
            attributes:["id","title"],
            required: false,
            model: db.menus,
            include: [
              {
                attributes:["id","categoryName"],
                required: false,
                model: db.menuCategory,
                include: [
                  {
                    attributes:["id","itemName"],
                    required: false,
                    model: db.menuCategoryItem,
                  },
                ],
              },
            ],
          }, 
         {
             attributes:["amenitiesItem"], 
            required: false,
            model: db.amenities,
            through: {attributes: []},
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
                    "filename",
                  ],
                  model: db.attachments,
              }
            ]
          }, 
       /*    {
             attributes:["id","startDate", "endDate"], 
            required: false,
            model: db.availables,
          },  */
         /*   {
            required: false,
            model: db.ticketCategory,
            include: [
              {
                required: false,
                model: db.ticketCategoryItem,
              },
            ],
          }, */ 
         
        ],
        where: {
          id: request.params.id,
        },
      });

      var dateRange = [];
      var timings = [];
      let availabilities = await db.availables.findAll({
        where: { availableId: request.params.id },
      });
      var n = availabilities.length;
      for(let i=0;i<n;i++){
        dateRange.push({
          startDate:JSON.stringify(availabilities[i].dataValues.startDate),
          endDate:JSON.stringify(availabilities[i].dataValues.endDate),
          startTime:availabilities[i].dataValues.startTime,
          endTime:availabilities[i].dataValues.endTime,
        })
      }
      var resultData = this.groupBy(dateRange, "startDate");
 
let arrayToSend = []
for(let eachresult of resultData){
  
    let obj = {
        startDate : eachresult[0].startDate.slice(1,25),
        endDate : eachresult[0].endDate.slice(1,25),
    }
    let timing = []
    for(let eachSubresult of eachresult){
        let obj = {
            startTime : eachSubresult.startTime,
            endTime : eachSubresult.endTime
        }
        timing.push(obj);
    }
    obj.timings = timing
    arrayToSend.push(obj)
}

console.log(arrayToSend)
  
      
    // dateRange = [ ...dateRange];
    
      

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
      const review = await db.clubRating.findAndCountAll({
        attributes:["review"],
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
        ],
        where: { clubId: request.params.id },
      })

      let reviews = [];
      for (let i = 0; i < review.rows.length; i++) {
        reviews.push({
           review: review.rows[i].dataValues.review,
           firstName:review.rows[i].dataValues.user.dataValues.userProfile.dataValues.firstName,
           lastName:review.rows[i].dataValues.user.dataValues.userProfile.dataValues.lastName,
           filePath: review.rows[i].dataValues.user.dataValues.userProfile.dataValues.attachment.dataValues.filePath,
          thumbnailPath:review.rows[i].dataValues.user.dataValues.userProfile.dataValues.attachment.dataValues.thumbnailPath,
          id: review.rows[i].dataValues.user.dataValues.userProfile.dataValues.attachment.dataValues.id,
          originalName:review.rows[i].dataValues.user.dataValues.userProfile.dataValues.attachment.dataValues.originalName,
          fileName: review.rows[i].dataValues.user.dataValues.userProfile.dataValues.attachment.dataValues.fileName
        });
      }

      const moreClubs = await db.clubs.findAll({
        limit: 4,
        attributes: [
          "id",
          "title",
          "description",
          "address",
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
      });
      return h.response({
        responseData:{
          data:result,
          review:reviews,
          dates:arrayToSend,
          gallery:sendGalleryEvent,
           galleryCount:gallery.count ,
           moreClubs
        },
        message:"Successfull"
       
      });
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

  // save club
  saveClub = async (request, h) => {
    try {
      const data = await db.clubs.update(
        {
          bookmarked: request.payload.bookmarked,
        },
        {
          where: {
            id: request.query.id,
          },
        }
      );
      return h.response({
        message: "Succesfully",
      });
    } catch (e) {
      console.log("___err", e);
      return e;
    }
  };

  savedClubs = async (request,h) => {
    try {
      const result = await db.clubs.findAll({
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
                  model: db.attachments, 
              }
          ],
        where: {
          bookmarked: true,
        },
      });
      return h.response({
        data:result
      });
    } catch (e) {
      console.log("___err", e);
    }
  };

  // Amenities
  addAmenity = async (request) => {
    try {
      let uniqueAminites = [];

      for (let i = 0; i < request.payload.amenitiesItem.length; i++) {
        let checkAlreadyExist = await db.amenities.findOne({
          where: {
            amenitiesItem: request.payload.amenitiesItem[i],
          },
        });

        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenitiesItem[i],
          });
        }
      }

      if (uniqueAminites && uniqueAminites.length == 0) {
        return "already present";
      }

      const add = await db.amenities.bulkCreate(uniqueAminites);
      return add;
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

  getAmenity = async (request) => {
    try {
      const result = await db.amenities.findAll({});
      return result;
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };
}

module.exports = new Club();
