const db = require("../models/index");
const joi = require('joi');
const moment = require('moment');

class Available{
    addAvailables = async(request) => {
        try{
            const newDate = new Date();
            const formatDate = moment(newDate).format("MM-DD-YYYY");
            const startTime = moment(`${formatDate} ${request.payload.startTime}`).format('HH:mm:ss')
            const endTime = moment(`${formatDate} ${request.payload.endTime}`).format('HH:mm:ss');
            const result = await db.availables.create({
                availableId : request.payload.availableId,
                startDate : request.payload.startDate,
                endDate : request.payload.endDate,
                startTime : startTime,
                endTime : endTime
            })
            return result;
        }catch(e){
            console.log('$$$$$$$$',e)
            return e;
            
        }
    }

    getAvailables = async(request) => {
        try{
            const result = await db.availables.findAll({})
            return result;
        }catch(e){
            console.log('$$$$$$$$',e)
            return e;
            
        }
    }

}

module.exports = new Available();