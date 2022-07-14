const db = require("../models/index");
const constant = require("../config/constant");
const UniversalFunctions = require("../universalFunctions/lib");
const sendNotification = require("../notifications/notifications")
const sendEmailReceipt = require("../notifications/email")
const emailTemplate=require('../templates/header')
const moment = require("moment");
const bookingTemplate=require('../templates/bookingConfirmReceipt')
const handlebars = require("handlebars");


class admin {

  payment=async(request)=>{
  try{
    
        var user;
       user = request.payload.data.object.metadata && request.payload.data.object.metadata.bookingId;
        if(request.payload.type=="charge.succeeded")
        {
          const fcmToken = await db.userAccesses.findAll({
            where:{user_id:request.payload.data.object.metadata.userId,fcmToken:{[Op.ne]:null}}
          })
          const userData = await db.userProfiles.findOne({where:{user_id:request.payload.data.object.metadata.userId}})
          var n = fcmToken.length - 1
          if(request.payload.data.object.metadata.type=='subscription')
          {
            const status = await db.vendorsubscriptionplanBooking.update({
              status:'success'
            },
            {
              where:{id:request.payload.data.object.metadata.subscriptionbookingId
              }
            })

            var vendorBusiness = await db.restaurant.findAll({
              where:{user_id:request.payload.data.object.metadata.userId}
            })
            var id=[]

            for(var i=0;i<vendorBusiness.length;i++)
            {
                id.push(vendorBusiness[i].dataValues.id)
            }

            if(id.length!==0)
            {
            var isOrder = await db.restaurant.update({
              isOrder:true
            },{
              where:{id:id}
            }) 
          }

          var vendorBusinessClub = await db.clubs.findAll({
            where:{user_id:request.payload.data.object.metadata.userId}
          })
          var id1=[]

          for(var i=0;i<vendorBusinessClub.length;i++)
          {
              id1.push(vendorBusinessClub[i].dataValues.id)
          }

          if(id1.length!==0)
          {
          var isOrder = await db.clubs.update({
            isOrder:true
          },{
            where:{id:id1}
          }) 
        }

        var vendorBusinesssalon = await db.salon.findAll({
          where:{user_id:request.payload.data.object.metadata.userId}
        })
        var id2=[]

        for(var i=0;i<vendorBusinesssalon.length;i++)
        {
            id2.push(vendorBusinesssalon[i].dataValues.id)
        }

        if(id2.length!==0)
        {
        var isOrder = await db.salon.update({
          isOrder:true
        },{
          where:{id:id2}
        }) 
      }



            let notificationData ={
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_SUBSCRIPTION_PLAN.title,
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_SUBSCRIPTION_PLAN.body,
              notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_SUBSCRIPTION_PLAN.type),
              user_id:request.payload.data.object.metadata.userId
            }

            let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)

            var vendorTransaction = await db.vendorTransaction.create({
              vendorTransaction_id:request.payload.data.object.id,
              user_id:request.payload.data.object.metadata.userId,
              subscriptionbooking_id:request.payload.data.object.metadata.subscriptionbookingId,
              totalAmount:request.payload.data.object.metadata.amount,
              status:request.payload.data.object.status,
              vendorTransactionData:JSON.stringify(request.payload.data),
            })


            return request.payload.type
          }
          const data = await db.transaction.create({
            transaction_id:request.payload.data.object.id,
            user_id:request.payload.data.object.metadata.userId,
            business_id:request.payload.data.object.metadata.businessId,
            booking_id:request.payload.data.object.metadata.bookingId,
            order_id:request.payload.data.object.metadata.orderId,
            totalAmount:request.payload.data.object.metadata.amount,
            type:request.payload.data.object.metadata.type,
            status:request.payload.data.object.status,
            transactionData:JSON.stringify(request.payload.data),
            isDeleted:false
            
          })
          if(request.payload.data.object.metadata.type=="event")
          {
            var booking=[]
            var a = 0
           let data = await db.booking.update({
            type:"success"
            },{
              where:{id:user}
            }) 
            const vendorId = await db.event.findOne({where:{id:request.payload.data.object.metadata.businessId}})
            const vendorFcm =  await db.userAccesses.findAll({
              where:{user_id:vendorId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
            })
            var m = vendorFcm.length - 1
            let notificationData ={
              title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Event'),
              body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type),
              type:'event',
              actionId:request.payload.data.object.metadata.bookingId,
              user_id:request.payload.data.object.metadata.userId
            }

            let vendornotificationData={
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Event'),
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
              notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type),
              type:'event',
              actionId:request.payload.data.object.metadata.bookingId,
              user_id:request.payload.data.object.metadata.userId
            }
          if(fcmToken.length!==0)
          {
           let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
          }
            let sendVendor = await sendNotification.sendMessage(vendorFcm[m].dataValues.fcmToken,vendornotificationData)
            let dataBooking = await db.booking.findOne({
              attributes:["event_id","user_id","totalAmount","paymentMode","createdAt"],
              where:{id:request.payload.data.object.metadata.bookingId},
              include:[{
                model:Models.userBookingEventsTicket,
                include:[{model:Models.ticket}]
              },{
                model:Models.eventBookingTimings,
                include:[{model:Models.userBookingEventsTicket,include:[{model:Models.ticket}]}]
              }],
            })  

            for(let i=0;i<dataBooking.dataValues.eventBookingTimings.length;i++)
            {
              var ticket=[];
              for( let k=0;k<dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets.length;k++)
              {
                console.log('SSSSSAAAA',dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues)
   
                a= dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.price + a
                ticket.push({
                   id:dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.id,
                  ticketSold:dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticketSold,
                   ticketName:dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.ticketName,
                  price:dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.price,
                  description:dataBooking.dataValues.eventBookingTimings[i].dataValues.userBookingEventsTickets[k].dataValues.ticket.dataValues.description,  
                  totalTicketPrice:a 
                })

                console.log('SSSSSSSSSS',ticket)
              }
              booking.push({
                id:dataBooking.dataValues.eventBookingTimings[i].dataValues.id,
                startDate:moment(dataBooking.dataValues.eventBookingTimings[i].dataValues.startDate).format('LL'),
                startTime:moment(dataBooking.dataValues.eventBookingTimings[i].dataValues.startTime,"HH:mm:ss").format('LT'),
                endTime:moment(dataBooking.dataValues.eventBookingTimings[i].dataValues.endTime,"HH:mm:ss").format('LT'),
                noOfPerson:dataBooking.dataValues.eventBookingTimings[i].dataValues.ticketBooked,
                status:dataBooking.dataValues.eventBookingTimings[i].dataValues.status,
                refundStatus:dataBooking.dataValues.eventBookingTimings[i].dataValues.refundStatus,
                totalTicketPrice:a,
                ticket
              })
            }

            console.log('SSSSSSSSSSS',booking)
           let ContentData={
             id:request.payload.data.object.metadata.bookingId,
             name:request.payload.data.object.metadata.eventName,
             address:request.payload.data.object.metadata.eventAddress,
             booking:booking,
             totalTicketPrice:a,
             createdAt:moment(dataBooking.dataValues.createdAt).utcOffset("+05:30").format('LLL'),
             paymentMethod:dataBooking.dataValues.paymentMode,
             totalAmount:request.payload.data.object.metadata.amount
           }
             var htmlToSend = handlebars.compile(bookingTemplate.bookingConfirmReceipt)(ContentData)
             let templateData={
              content:htmlToSend,
              type:'Booking Confirmation'
            }
            var htmlToSendData = handlebars.compile(emailTemplate.header)(templateData)
          
             let sendEmail = await sendEmailReceipt.sendEmail(constant.EMAIL_FROM.FROM,userData.dataValues.email,'Booking Confirmed',htmlToSendData)
            console.log('ssendEmail',sendEmail)  

           const create = await db.notifications.create({
             user_id:request.payload.data.object.metadata.userId,
             title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Event'),
             body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
             notificationType:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type,
             type:'event',
             booking_id:request.payload.data.object.metadata.bookingId,
             notificationTo:constant.NOTIFICATION_TO.USER
           })

           const createvendorNotify = await db.notifications.create({
            user_id:request.payload.data.object.metadata.userId,
            title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Event'),
            body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
            notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type,
            type:'event',
            booking_id:request.payload.data.object.metadata.bookingId,
            notificationTo:constant.NOTIFICATION_TO.VENDOR
          })
          }
          if(request.payload.data.object.metadata.type=="activity")
          {
            var booking=[]
            var a = 0
            let data = await db.activityBooking.update({
              type:"success"
              },{
                where:{id:user}
              })
              
              const vendorId = await db.activity.findOne({where:{id:request.payload.data.object.metadata.businessId}})
              const vendorFcm =  await db.userAccesses.findAll({
                where:{user_id:vendorId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
              })
              var m = vendorFcm.length - 1

              let notificationData ={
                title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Activity'),
                body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
                notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type),
                type:'activity',
                actionId:request.payload.data.object.metadata.bookingId,
                user_id:request.payload.data.object.metadata.userId
              }
              let vendornotificationData={
                title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Activity'),
                body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
                notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type),
                type:'activity',
                actionId:request.payload.data.object.metadata.bookingId,
                user_id:request.payload.data.object.metadata.userId
              }
               if(fcmToken.length!==0)
          {
             let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
          }
              let sendVendor = await sendNotification.sendMessage(vendorFcm[m].dataValues.fcmToken,vendornotificationData)   
              var dataBooking = await db.activityBooking.findOne({
                attributes:["activity_id","user_id","totalAmount","paymentMode","createdAt"],
                where:{id:request.payload.data.object.metadata.bookingId},
                include:[{
                  model:Models.activityBookingTickets,
                  include:[{model:Models.activityTicket}]
                },{
                  model:Models.activityBookingTimings,
                  include:[{model:Models.activityBookingTickets,include:[{model:Models.activityTicket}]}]
                  
                }],
              })
               
        for(let i=0;i<dataBooking.dataValues.activityBookingTimings.length;i++)
        {
          var ticket=[];
          console.log('SSSSS',dataBooking.dataValues.activityBookingTimings)
          for( let k=0;k<dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets.length;k++)
          {
           console.log('SSSSSAAAA',dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues) 
           a= dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.price + a
            ticket.push({
               id:dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.id,
              ticketSold:dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.ticketSold,
               ticketName:dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.ticketName,
              price:dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.price,
              description:dataBooking.dataValues.activityBookingTimings[i].dataValues.activityBookingTickets[k].dataValues.activityTicket.dataValues.description,
              totalTicketPrice:a    
            })
          }
          booking.push({
            id:dataBooking.dataValues.activityBookingTimings[i].dataValues.id,
            startDate:moment(dataBooking.dataValues.activityBookingTimings[i].dataValues.startDate).format('LL'),
            startTime:moment(dataBooking.dataValues.activityBookingTimings[i].dataValues.startTime,"HH:mm:ss").format('LT'),
                endTime:moment(dataBooking.dataValues.activityBookingTimings[i].dataValues.endTime,"HH:mm:ss").format('LT'),
            preferedTime:dataBooking.dataValues.activityBookingTimings[i].dataValues.preferedTime,
            noOfPerson:dataBooking.dataValues.activityBookingTimings[i].dataValues.ticketBooked,
            status:dataBooking.dataValues.activityBookingTimings[i].dataValues.status,
            refundStatus:dataBooking.dataValues.activityBookingTimings[i].dataValues.refundStatus,
            totalTicketPrice:a,
            ticket
          })
        }
        let ContentData={
          id:request.payload.data.object.metadata.bookingId,
          name:request.payload.data.object.metadata.activityName,
          address:request.payload.data.object.metadata.activityAddress,
          booking:booking,
          totalTicketPrice:a,
          createdAt:moment(dataBooking.dataValues.createdAt).format('LLL'),
          paymentMethod:dataBooking.dataValues.paymentMode,
          totalAmount:request.payload.data.object.metadata.amount
        }
          var htmlToSend = handlebars.compile(bookingTemplate.bookingConfirmReceipt)(ContentData)
          let templateData={
           content:htmlToSend,
           type:'Booking Confirmation'
         }
         var htmlToSendData = handlebars.compile(emailTemplate.header)(templateData)
              let sendEmail = await sendEmailReceipt.sendEmail(constant.EMAIL_FROM.FROM,userData.dataValues.email,'Booking Confirmed',htmlToSendData)
             console.log('ssendEmail',sendEmail)  
             const create = await db.notifications.create({
               user_id:request.payload.data.object.metadata.userId,
               title:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.title.replace('{}','Activity'),
               body:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.body,
               notificationType:constant.NOTIFICATION_TYPE.BOOKING_CONFIRMED.type,
               type:'activity',
               booking_id:request.payload.data.object.metadata.bookingId,
               notificationTo:constant.NOTIFICATION_TO.USER
             })

             const createvendorNotify = await db.notifications.create({
              user_id:request.payload.data.object.metadata.userId,
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.title.replace('{}','Activity'),
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.body,
              notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_BUSINESS_BOOKING_CONFIRMED.type,
              type:'activity',
              booking_id:request.payload.data.object.metadata.bookingId,
              notificationTo:constant.NOTIFICATION_TO.VENDOR
            })
          }
          if(request.payload.data.object.metadata.type=="restaurant")
          {
            let data = await db.restaurantOrder.update({
              orderPlaced:"success"
              },{
                where:{id:request.payload.data.object.metadata.orderId}
              }) 

              const vendorId = await db.restaurant.findOne({where:{id:request.payload.data.object.metadata.businessId}})
              const vendorFcm =  await db.userAccesses.findAll({
                where:{user_id:vendorId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
              })
              var m = vendorFcm.length - 1
              let notificationData ={
                title:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.title,
                body:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.body,
                notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.type),
                type:'restaurant',
                actionId:request.payload.data.object.metadata.orderId,
                user_id:request.payload.data.object.metadata.userId
              }
              let vendornotificationData={
                title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.title,
                body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.body,
                notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.type),
                type:'restaurant',
                actionId:request.payload.data.object.metadata.orderId,
                user_id:request.payload.data.object.metadata.userId
              }
               if(fcmToken.length!==0)
          {
             let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
          }
              let sendVendor = await sendNotification.sendMessage(vendorFcm[m].dataValues.fcmToken,vendornotificationData) 
            //  console.log('SSSSSSSSendNotification',send)
             const create = await db.notifications.create({
               user_id:request.payload.data.object.metadata.userId,
               title:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.title,
               body:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.body,
               notificationType:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.type,
               type:'restaurant',
               order_id:request.payload.data.object.metadata.orderId,
               notificationTo:constant.NOTIFICATION_TO.USER
             })
             const createvendorNotify = await db.notifications.create({
              user_id:request.payload.data.object.metadata.userId,
              title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.title,
              body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.body,
              notificationType:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RESTAURANT_ORDER.type,
              type:'restaurant',
              order_id:request.payload.data.object.metadata.orderId,
              notificationTo:constant.NOTIFICATION_TO.VENDOR
            })
          }
        }
        if(request.payload.type=="charge.failed")
        {
          if(request.payload.data.object.metadata.type=='subscription')
          {
            const status = await db.vendorsubscriptionplanBooking.update({
              type:'failed'
            },{
              where:{id:request.payload.data.object.metadata.subscriptionbookingId}
            })
          }
          if(request.payload.data.object.metadata.type=="event")
          {
          let data = await db.booking.update({
           type:"failed"
           },{
             where:{id:user}
           }) 
         } 
        if(request.payload.data.object.metadata.type=="activity")
        {
          let data = await db.activityBooking.update({
            type:"failed"
            },{
              where:{id:user}
            }) 
         }
        if(request.payload.data.object.metadata.type=="restaurant")
        {
          let data = await db.restaurantOrder.update({
            orderPlaced:"failed"
            },{
              where:{id:request.payload.data.object.metadata.orderId}
            }) 
         }
      }
        return request.payload.type
  }
  catch(e){
      console.log('SSSSSSSSSSSS',e)
  }
  }

  payPal=async(request)=>{
    try{
          console.log('SSSSSSSSSSSS',request)
    }
    catch(e)
    {
      console.log('SSSSSSSSSSS',e)
    }
  }

}

module.exports = new admin();
