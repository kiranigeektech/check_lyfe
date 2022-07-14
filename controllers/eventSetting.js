const db = require("../models/index");
class eventSetting {

    addSetting=async(request,h)=>{
        try{
            const data = request.payload

            if(data.serviceTax && data.adminCommission)
            {
                var host= data.adminCommission - data.serviceTax
            }
            if(data.id)
            {
                const editData = await db.eventSetting.update({
                    serviceTax:data.serviceTax,
                    adminCommission:data.adminCommission,
                    host:host
                },{
                    where:{id:data.id}
                })

                if(editData)
                {
                 return h.response({message:'Successfully'}).code(200)
                }
            }
                const add = await db.eventSetting.create({
                    serviceTax:data.serviceTax,
                    adminCommission:data.adminCommission,
                    host:host
                })
                return h.response({
                    add
                }).code(200)
        }
        catch(e){
                console.log('SSSSSSSS',e)
        }
    }

    getSetting=async(request,h)=>{
        try{
            var authToken = request.auth.credentials.userData

            var data = await db.eventSetting.findOne({
                attributes:["id","serviceTax","adminCommission","createdAt"]
            })

            if(data)
            {
                return h.response({
                    responseData:{
                        data
                    }
                })
            }
        }
        catch(e)
        {
            console.log('SSSSSSSSs',e)
        }
    }
}

module.exports = new eventSetting();
