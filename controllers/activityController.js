const db = require("../models/index");
const moment = require("moment");
const constant = require('../config/constant')
class Activity {
  // Write your functions here

  addActivity = async (request,h) => {
    try {
      if(!request.payload.id){
        let adminData = await db.users.findOne({
          where: {
            role_id: constant.ROLES.ADMIN_ROLE,
          },
        });
        if(adminData){
          //send notification to admin
          const create = await db.notifications.create({
            title:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.title,
            body:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.body.replace('{name}',request.payload.title),
            notificationType:constant.ADMIN_NOTIFICATION_TYPE.NEW_BUSINESS_REQUEST.type,
            user_id:adminData.dataValues.id,
            notificationTo:constant.NOTIFICATION_TO.ADMIN
          })
        }
      }

      var authToken=request.auth.credentials.userData
      var isOrder= false
      var subscription = await db.vendorsubscriptionplanBooking.findOne({
        order: [["createdAt", "DESC"]],
        where:{user_id:authToken.userId,status:'success'}
      })
      if(subscription)
      {
        var currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD HH:mm:ss')
        if(currentDate >= expiryplan)
        {
          isOrder = false
        }
        if(currentDate <= expiryplan)
        {
          isOrder=true
        }

      }
        if(request.payload.type =='activity')
        {

        if(request.payload.id)
        {
          const edit = await db.activity.update(
            {
              title: request.payload.title,
              address: request.payload.address,
              description: request.payload.description,
              capacity:request.payload.capacity,
              bookingUrl:request.payload.bookingUrl,
              refundTime:request.payload.refundTime,
              cancellationPolicy:request.payload.cancellationPolicy,
              termsAndCondition:request.payload.termsAndCondition,
              lat:request.payload.lat,
              long:request.payload.long,
              attachment_id:request.payload.attachment_id,
              category_id:request.payload.category_id,
            },
            {
              where: {
                id: request.payload.id,
                user_id:authToken.userId
              },
            }
          );
          return h.response({message:'Edit Successfull'}).code(200)
        }
        const data = {
          title: request.payload.title,
          address: request.payload.address,
          description: request.payload.description,
          bookmarked: false,
          featured:false,
          active:true,
          type:'activity',
          user_id:authToken.userId,
          capacity:request.payload.capacity,
          bookingUrl:request.payload.bookingUrl,
          refundTime:request.payload.refundTime,
          cancellationPolicy:request.payload.cancellationPolicy,
          termsAndCondition:request.payload.termsAndCondition,
          lat:request.payload.lat,
          long:request.payload.long,
          attachment_id:request.payload.attachment_id,
          category_id:request.payload.category_id,
          /* activitygalleries: request.payload.activitygalleries, */
        /*  activityTickets:request.payload.tickets */
        };
      var result = await db.activity.create(data); 
      if(result)
      {
        var ratingData = await db.activityRating.create({
          user_id:authToken.userId,
          activity_id:result.dataValues.id,
          rating:5,
          averageRating:5,
          status:1   
      }) 
      var rating = await db.activity.update({
        rating:5,
        ratingCount:1
      },{
        where:{id:result.dataValues.id}
      })
      }
        }
        if(request.payload.type=='club')
        {
          console.log(request.payload)
            
          if(request.payload.id)
          {
            const edit = await db.clubs.update(
              {
                title: request.payload.title,
                address: request.payload.address,
                description: request.payload.description,
              /*  bookingUrl:request.payload.bookingUrl, */
                cancellationPolicy:request.payload.cancellationPolicy,
                termsAndCondition:request.payload.termsAndCondition,
                lat:request.payload.lat,
                long:request.payload.long,
                attachmentId:request.payload.attachment_id,
                category_id:request.payload.category_id,
                capacity:request.payload.capacity,
              },
              {
                where: {
                  id: request.payload.id,
                  user_id:authToken.userId
                },
              }
            );

            return h.response({message:'Edit Successfull'}).code(200)
          }
          const data = {
            title: request.payload.title,
            address: request.payload.address,
            description: request.payload.description,
            bookmarked: false,
            featured:false,
            status:0,
            active:true,
            type:'club',
            user_id:authToken.userId,
            isOrder:isOrder,
            capacity:request.payload.capacity,/* 
            bookingUrl:request.payload.bookingUrl, */
            /* refundTime:request.payload.refundTime, */
            cancellationPolicy:request.payload.cancellationPolicy,
            termsAndCondition:request.payload.termsAndCondition,
            lat:request.payload.lat,
            long:request.payload.long,
            attachmentId:request.payload.attachment_id,
            category_id:request.payload.category_id,
            /* activitygalleries: request.payload.activitygalleries, */
          /*  activityTickets:request.payload.tickets */
          };
        var result = await db.clubs.create(data); 
        if(result)
        {
          var ratingData = await db.clubRating.create({
            userId:authToken.userId,
            club_id:result.dataValues.id,
            rating:5,
            averageRating:5,
            status:1   
        }) 
        var rating = await db.clubs.update({
          rating:5,
          ratingCount:1
        },{
          where:{id:result.dataValues.id}
        })
        }
        }
        if(request.payload.type=='shops')
        {
          if(request.payload.id)
          {
            const edit = await db.salon.update(
              {
                title: request.payload.title,
                address: request.payload.address,
                description: request.payload.description,
                 serviceAvailableAtHome:request.payload.serviceAvailableAtHome, 
                 serviceAvailableAtShop:request.payload.serviceAvailableAtShop,
                lat:request.payload.lat,
                long:request.payload.long,
                attachment_id:request.payload.attachment_id,
                category_id:request.payload.category_id,
                showAddress:request.payload.showAddress,
                cancellationPolicy:request.payload.cancellationPolicy,
                termsAndCondition:request.payload.termsAndCondition,
              },
              {
                where: {
                  id: request.payload.id,
                  user_id:authToken.userId
                },
              }
            );

            return h.response({message:'Edit Successfull'}).code(200)
          }
          const data = {
            title: request.payload.title,
            address: request.payload.address,
            description: request.payload.description,
            bookmarked: false,
            featured:false,
            status:0,
            type:'shops',
            isOrder:isOrder,
            user_id:authToken.userId,
            serviceAvailableAtHome:request.payload.serviceAvailableAtHome, 
            serviceAvailableAtShop:request.payload.serviceAvailableAtShop,
            lat:request.payload.lat,
            long:request.payload.long,
            attachment_id:request.payload.attachment_id,
            category_id:request.payload.category_id,
            showAddress:request.payload.showAddress,
            cancellationPolicy:request.payload.cancellationPolicy,
            termsAndCondition:request.payload.termsAndCondition,
            /* activitygalleries: request.payload.activitygalleries, */
          /*  activityTickets:request.payload.tickets */
          };
        var result = await db.salon.create(data); 
        if(result)
        {
          var ratingData = await db.salonRating.create({
            user_id:authToken.userId,
            salon_id:result.dataValues.id,
            rating:5,
            averageRating:5,
            status:1   
        })
        var rating = await db.salon.update({
          rating:5,
          ratingCount:1
        },{
          where:{id:result.dataValues.id}
        }) 
        }
        }
        if(request.payload.type=='restaurant')
        {
          if(request.payload.id)
          {
            const edit = await db.restaurant.update({
              title: request.payload.title,
              address: request.payload.address,
              description: request.payload.description,
              attachment_id: request.payload.attachment_id,
              category_id: request.payload.category_id,
              mobile:request.payload.mobile,
              lat:request.payload.lat,
              long:request.payload.long,
              cancellationPolicy:request.payload.cancellationPolicy,
              termsAndCondition:request.payload.termsAndCondition,
              serviceType: request.payload.serviceType
            },
            {
              where: {
                id: request.payload.id,
                user_id:authToken.userId
              },
            }
          );
          return h.response({message:'Edit Successfull'}).code(200)
          
          }
          const data = {
            title: request.payload.title,
            address: request.payload.address,
            description: request.payload.description,
            bookmarked: false,
            type: "restaurant",
            featured: false,
            status:0,
            active:true,
            isOrder:isOrder,
            user_id:authToken.userId,
            attachment_id:request.payload.attachment_id,
            category_id:request.payload.category_id,
            mobile:request.payload.mobile,
            lat:request.payload.lat,
            long:request.payload.long,
            cancellationPolicy:request.payload.cancellationPolicy,
            termsAndCondition:request.payload.termsAndCondition,
            serviceType: request.payload.serviceType
          };
          var result = await db.restaurant.create(data); 
          if(result)
          {
            var ratingData = await db.restaurantRating.create({
              user_id:authToken.userId,
              restaurant_id:result.dataValues.id,
              rating:5,
              averageRating:5,
              status:1   
            }) 

            var rating = await db.restaurant.update({
              rating:5,
              ratingCount:1
            },{
              where:{id:result.dataValues.id}
            })
          }
        }

      return result;
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

}

module.exports = new Activity();
