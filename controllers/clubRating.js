
const db = require("../models/index");

class clubRating {
  getRating = async (request,h) => {
    try {
      const rating = await db.clubRating.findAll();
      return h.response({
          rating
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
      const authToken = request.auth.credentials.userData;
      const oldrating = await db.clubRating.findAll({
        attributes:["rating"],
        where:{club_id:request.payload.club_id}
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
        ratingData = await db.clubRating.create({
          userId:authToken.userId,
          club_id:request.payload.club_id,
          review:request.payload.review,
          averageRating: averageRating,
          rating:request.payload.rating   
      }) 
          var clubUpdate = await db.clubs.update({
            rating:averageRating.toFixed(1),
            ratingCount:parseInt(total+1)
          },{
            where:{id:request.payload.club_id}
          })
      }
      if(oldrating.length == 0)
      {
      if(!averageRating)
      {
         ratingData = await db.clubRating.create({
            userId:authToken.userId,
            club_id:request.payload.club_id,
            review:request.payload.review,
            averageRating: request.payload.rating,
            rating:request.payload.rating
        })  
       var clubUpdate = await db.clubs.update({
          rating:request.payload.rating,
          ratingCount:1
        },{
          where:{id:request.payload.club_id}
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
    await db.clubRatingGallery.bulkCreate(ratingGallaries);


        return h.response({
            ratingData, 
            message:"Thanku For rating"
        }) 
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

 /*  editRating = async (request) => {
    try {
      const editRating = await db.clubRating.update(
        {
          categoryName: request.payload.categoryName,
          attachmentId:request.payload.attachmentId
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
      const delRating = await db.clubRating.destroy({
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

module.exports = new clubRating();
