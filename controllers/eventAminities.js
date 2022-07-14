const db = require("../models/index");

class eventAminities {
  getAminities = async (request,h) => {
    try {
      if(request.query.type=='event')
      {
      var aminities = await db.event.findOne({
        attributes:["id"],
        include: [
            {
              attributes: ["amenitiesItem"],
              required: false,
              model: db.aminitiesList ,
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
          ],
          where:{id:request.query.id}
      })
    }
    if(request.query.type=='activity')
    {
      var aminities = await db.activity.findOne({
        attributes:["id"],
        include: [
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
          where:{id:request.query.id}
      })
    }
    if(request.query.type=='club')
    {
      var aminities = await db.clubs.findOne({
        attributes:["id"],
        include: [
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
          where:{id:request.query.id}
      })
    }
    if(request.query.type=='shops')
    {
      var aminities = await db.salon.findOne({
        attributes:["id"],
        include: [
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
          where:{id:request.query.id}
      })
    }
    if(request.query.type=='restaurant')
    {
      var aminities = await db.restaurant.findOne({
        attributes:["id"],
        include: [
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
          where:{id:request.query.id}
      })
    }
      return h.response({
          responseData:{
            aminities
          }
      });
    } catch (e) {
      console.log("ss", e);
    }
  };

  addAminities = async (request) => {
    try {
      let existdata = [];
      let alreadyExist = [];
      let uniqueAminites = [];
      var aminityId = [];
      var checkAlreadyExist;
    if(request.payload.type=='event')
    {
      const dd= await db.event.findOne({attributes:['id'],where:{id:request.payload.id}}) 

      if(!dd)
      {
        return h.response({message:'Event not exist'})
      }
      for (let i = 0; i < request.payload.amenities.length; i++) {
        checkAlreadyExist = await db.aminitiesList.findOne({
          where: {
            amenitiesItem:request.payload.amenities[i].amenitiesItem,
          },
        });
        if (checkAlreadyExist) {
          existdata.push(checkAlreadyExist);
          aminityId.push(checkAlreadyExist.dataValues.id);
        }
        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenities[i].amenitiesItem,
            attachment_id: request.payload.amenities[i].attachment_id,
          });
        }
      }     
        if (existdata && existdata.length !== 0) {
      /*   for (var j = 0; j < existdata.length; j++) {
          aminityId.push(existdata[j].dataValues.id);
        } */
        console.log('SSSSSSSSSSSSS',aminityId)
        dd.setAminitiesLists(aminityId);
       
      } 

  if(uniqueAminites.length!=0)
  {
    var adddata = await db.aminitiesList.bulkCreate(uniqueAminites);
      for  (var i = 0; i < adddata.length; i++) {
        aminityId.push(adddata[i].dataValues.id);
      }
    }
      console.log('SSSSSSSSs',aminityId)
      dd.setAminitiesLists(aminityId);
      /* const add = await db.aminitiesList.create({
        aminitiesItem: request.payload.aminitiesItem,
        attachment_id:request.payload.attachment_id
      })
      dd.setAminitiesLists(add.dataValues.id); */

      
      return "added successfully";
    }
    if(request.payload.type=='activity')
    {
      const dd= await db.activity.findOne({attributes:['id'],where:{id:request.payload.id}}) 
      if(!dd)
      {
        return h.response({message:'Event not exist'})
      }
      for (let i = 0; i < request.payload.amenities.length; i++) {
        checkAlreadyExist = await db.activityAmenities.findOne({
          where: {
            amenitiesItem:request.payload.amenities[i].amenitiesItem,
          },
        });
        if (checkAlreadyExist) {
          existdata.push(checkAlreadyExist);
          aminityId.push(checkAlreadyExist.dataValues.id);
        }
        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenities[i].amenitiesItem,
            attachment_id: request.payload.amenities[i].attachment_id,
          });
        }
      }     
        if (existdata && existdata.length !== 0) {
        /* for (var j = 0; j < existdata.length; j++) {
          aminityId.push(existdata[j].dataValues.id);
        } */
        dd.setAminitiesLists(aminityId);
        
      } 
      if(uniqueAminites.length!==0)
      {
     var adddata = await db.activityAmenities.bulkCreate(uniqueAminites);
      for  (var i = 0; i < adddata.length; i++) {
        aminityId.push(adddata[i].dataValues.id);
      }
    }
      dd.setAminitiesLists(aminityId);

      return "added successfully";
    }
    if(request.payload.type=='club')
    {
      const dd= await db.clubs.findOne({attributes:['id'],where:{id:request.payload.id}}) 

      if(!dd)
      {
        return h.response({message:'Event not exist'})
      }
      for (let i = 0; i < request.payload.amenities.length; i++) {
        checkAlreadyExist = await db.amenities.findOne({
          where: {
            amenitiesItem:request.payload.amenities[i].amenitiesItem,
            attachmentId: request.payload.amenities[i].attachment_id
          },
        });
        if (checkAlreadyExist) {
          existdata.push(checkAlreadyExist);
          aminityId.push(checkAlreadyExist.dataValues.id);
        }
        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenities[i].amenitiesItem,
            attachmentId: request.payload.amenities[i].attachment_id,
          });
        }
      }     
        if (existdata && existdata.length !== 0) {
      /*   for (var j = 0; j < existdata.length; j++) {
          aminityId.push(existdata[j].dataValues.id);
        } */
        console.log('SSSSSSSSSSSSS',aminityId)
        dd.setAminitiesLists(aminityId);
        
      } 
      if(uniqueAminites.length!==0)
      {
    var adddata = await db.amenities.bulkCreate(uniqueAminites);
      for  (var i = 0; i < adddata.length; i++) {
        aminityId.push(adddata[i].dataValues.id);
      }
    }
      console.log('SSSSSSSSs',aminityId)
      dd.setAminitiesLists(aminityId);
      return "added successfully";
    }
    if(request.payload.type=='shops')
    {
      const dd= await db.salon.findOne({attributes:['id'],where:{id:request.payload.id}}) 

      if(!dd)
      {
        return h.response({message:'Event not exist'})
      }
      for (let i = 0; i < request.payload.amenities.length; i++) {
        checkAlreadyExist = await db.salonAmenities.findOne({
          where: {
            amenitiesItem:request.payload.amenities[i].amenitiesItem,
          },
        });
        if (checkAlreadyExist) {
          existdata.push(checkAlreadyExist);
          aminityId.push(checkAlreadyExist.dataValues.id);
        }
        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenities[i].amenitiesItem,
            attachment_id: request.payload.amenities[i].attachment_id,
          });
        }
      }     
        if (existdata && existdata.length !== 0) {
        console.log('SSSSSSSSSSSSS',aminityId)
        dd.setAminitiesLists(aminityId);
        
      } 
      if(uniqueAminites.length!==0)
      {
    var adddata = await db.salonAmenities.bulkCreate(uniqueAminites);
      for  (var i = 0; i < adddata.length; i++) {
        aminityId.push(adddata[i].dataValues.id);
      }
    }
      console.log('SSSSSSSSs',aminityId)
      dd.setAminitiesLists(aminityId);
      return "added successfully";
    }
    if(request.payload.type=='restaurant')
    {
      const dd= await db.restaurant.findOne({attributes:['id'],where:{id:request.payload.id}}) 

      if(!dd)
      {
        return h.response({message:'Event not exist'})
      }
      for (let i = 0; i < request.payload.amenities.length; i++) {
        checkAlreadyExist = await db.restaurantAmenities.findOne({
          where: {
            amenitiesItem:request.payload.amenities[i].amenitiesItem,
          },
        });
        if (checkAlreadyExist) {
          existdata.push(checkAlreadyExist);
          aminityId.push(checkAlreadyExist.dataValues.id);
        }
        if (!checkAlreadyExist) {
          uniqueAminites.push({
            amenitiesItem: request.payload.amenities[i].amenitiesItem,
            attachment_id: request.payload.amenities[i].attachment_id,
          });
        }
      }     
        if (existdata && existdata.length !== 0) {
        console.log('SSSSSSSSSSSSS',aminityId)
        dd.setAminitiesLists(aminityId);
        
      } 
      if(uniqueAminites.length!==0)
      {
    var adddata = await db.restaurantAmenities.bulkCreate(uniqueAminites);
      for  (var i = 0; i < adddata.length; i++) {
        aminityId.push(adddata[i].dataValues.id);
      }
    }
      console.log('SSSSSSSSs',aminityId)
      dd.setAminitiesLists(aminityId);
      return "added successfully";
    }
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  editAminities = async (request) => {
    try {
      const editAmini = await db.aminitiesList.update(
        {
          aminitiesItem: request.payload.aminitiesItem,
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

  deleteAminities = async (request) => {
    try {
      const delamini = await db.aminitiesList.destroy({
        where: {
          id: request.payload.id,
        },
      });
      return "Deleted Successfully";
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  };
}

module.exports = new eventAminities();
