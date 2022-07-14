const db = require("../models/index");
class hostFollow {
  
    hostFollows = async (req, h) => {
      try {
        const authToken = req.auth.credentials.userData;
        const availabileHostID = await db.userProfiles.findOne({
            where:{user_id:req.payload.host_id}
        })

        if(availabileHostID)
        {
        const alreadyFollow = await db.hostFollow.findOne({
            attributes:["follow"],
            where:{user_id:authToken.userId}
        })
      
         var following = alreadyFollow ? alreadyFollow.dataValues.follow :''
        
        if(alreadyFollow!==null && following)
        {
            if(req.payload.follow == false){
                const unfollow = await db.hostFollow.destroy({
                    where:{user_id:authToken.userId}
                }) 
                const count = await db.hostFollow.count({
                    where:{
                        host_id:req.payload.host_id
                    }
                })
                const updatefollower = await db.userProfiles.update({
                    followers:count
                },{where:{user_id:req.payload.host_id}}) 
        
                return h.response({
                    message:"unfollow Successfull"
                })
            }
            return h.response({
                message:"Already Following"
            }).code(400)
        }
        if(!alreadyFollow)
        {
            if(req.payload.follow == true)
            {
            const follow =await db.hostFollow.create({
                user_id:authToken.userId,
                host_id:req.payload.host_id,
                follow:req.payload.follow
            })
            const count = await db.hostFollow.count({
                where:{
                    host_id:req.payload.host_id
                }
            })
            const updatefollower = await db.userProfiles.update({
                followers:count
            },{where:{user_id:req.payload.host_id}}) 

            return h.response({
                message:"follow Successfull"
            })
        }
        if(req.payload.follow==false){
            return h.response({message:'Follow User First'}).code(400)
        }

    }
    }
    else{
       return h.response({message:'Enter valid id'}).code(400)
    }
      } catch (e) {
        console.log('sssssssssss',e)
      }
    };
  }
  
  module.exports = new hostFollow();
  