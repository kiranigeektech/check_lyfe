const db = require("../models/index");
const joi = require("joi");
const moment = require("moment");

class availability {
  addavailability = async (request) => {
    try {
      var data = request.payload
      var available=[]
      const newDate = new Date();
      const formatDate = moment(newDate).format("MM-DD-YYYY");
      for (var i = 0; i < data.availabilities.length; i++) {
      const startTime = moment(
        `${formatDate} ${data.availabilities[i].startTime}`
      ).format("HH:mm:SS");
      const endTime = moment(`${formatDate} ${data.availabilities[i].endTime}`).format(
        "HH:mm:SS"
      );
      available.push({
        event_id:data.event_id,
        startTime: startTime,
        endTime: endTime,
        startDate: data.availabilities[i].startDate,
        endDate: data.availabilities[i].endDate,
      });
    }
    if(data.event_id)
    {
      const already = await db.availability.findAll({where:{event_id:data.event_id}});
      if(already)
      {
        for(var i=0;i<already.length;i++)
        {
          const deleteData = await db.availability.destroy({where:{id:already[i].dataValues.id}})
        }
      }
    }
     const result = await db.availability.bulkCreate(available)

      return result;
    } catch (e) {
      console.log("$$$$$$$$", e);
      return e;
    }
  };

  getavailability = async (request,h) => {
    try {
      const result = await db.availability.findAll({where:{event_id:request.query.event_id}});
      return h.response({
        responseData:{
          result
        }
      });
    } catch (e) {
      console.log("$$$$$$$$", e);
      return e;
    }
  };

  editavailability = async (request, h) => {
    try {
      const newDate = new Date();
      const formatDate = moment(newDate).format("MM-DD-YYYY");
      const startTime = moment(
        `${formatDate} ${request.payload.startTime}`
      ).format("HH:MM:SS");
      const endTime = moment(`${formatDate} ${request.payload.endTime}`).format(
        "HH:MM:SS"
      );
      const edittime = await db.availability.update(
        {
          startDate: request.payload.startDate,
          endDate: request.payload.endDate,
          startTime: startTime,
          endTime: endTime,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return edittime
    } catch (e) {
      console.log("&&&&&&&&&&&&&&&&&editTime", e);
    }
  };
}

module.exports = new availability();
