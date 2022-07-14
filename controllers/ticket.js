
const db = require("../models/index");

class ticket {
  getTicket = async (request,h) => {
    try {
      const authToken = request.auth.credential
      var tickets;
      
      if(request.payload.startTime=='' || request.payload.endTime==''|| request.payload.id=='' || request.payload.startDate=='')
      {
        return h.response({message:"Enter all the request payload"}).code(400)
      }
      var serviceCharge = await db.eventSetting.findOne({attributes:['serviceTax']})
      
        if(request.payload.type=="event")
        {
        const remain = await db.eventBookingTimings.findAll({
          attributes:["booking_id"],
          where:{startDate: request.payload.startDate,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
        })
        console.log('already bookings',remain.length)
        if(remain.length==0 )
        {
         
          var ticketFinal=[]
          var TicketData = await db.ticket.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
            where:{event_id:request.payload.id}
          })
          console.log("TicketData",TicketData)
          
          for(let i=0;i<TicketData.length;i++)
          {
            var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              // ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price + servicePrice,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }

          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
        }
        for(let i =0 ;i<remain.length;i++)
        {
          var remainticket =await db.userBookingEventsTicket.findAll({
            attributes:["ticket_id","ticketSold"],
            where:{booking_id:remain[i].dataValues.booking_id}
          })
          console.log("user booked tickets",remainticket)
        }
        var ticketDate=[]
      for(let i=0;i<remainticket.length;i++){
        var noOfticket = await db.ticket.findAll({
          attributes:["noOfTicketAvailable"],
          where:{id:remainticket[i].dataValues.ticket_id}
        })
        console.log("ticket available",noOfticket)
        for(let j=0;j<noOfticket.length;j++)
        {
          if(noOfticket[j].dataValues.noOfTicketAvailable!==0)
          {
          var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketAvailable - remainticket[i].dataValues.ticketSold
          console.log('noOfTicketRemain',noOfTicketRemain)
          var ticket_id = remainticket[i].dataValues.ticket_id
          ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          }
          // if(noOfticket[j].dataValues.noOfTicketRemain==0)
          // {
          //   var noOfTicketRemain=0
          //   var ticket_id = remainticket[i].dataValues.ticket_id
          //   ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
          // }

          
        }

        // var update = await db.ticket.update({
        //   noOfTicketRemain:noOfTicketRemain
        // },{
        //   where:{id:remainticket[i].dataValues.ticket_id}
        // })
      }
    
      console.log('SSSSSSDate',ticketDate)
      var ticketFinal =[]
      var TicketData = await db.ticket.findAll({
        where:{event_id:request.payload.id}
      })
      for(let i=0 ; i<TicketData.length;i++)
      {
        var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
        let flag = 0
        for(let j=0 ;j<ticketDate.length;j++)
        {
          if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
          {
            
            ticketFinal.push({
                id:TicketData[i].dataValues.id,
                ticketRemain:ticketDate[j].noOfTicketRemain,
                noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
                ticketName:TicketData[i].dataValues.ticketName,
                price:TicketData[i].dataValues.price + servicePrice ,
                description:TicketData[i].dataValues.description,
                minLimit:TicketData[i].dataValues.minLimit,
                maxLimit:TicketData[i].dataValues.maxLimit
              })    
              flag = 1;
              break;
      }
      }
      if(flag==0)
      {
      ticketFinal.push({
        id:TicketData[i].dataValues.id,
        ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
        noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
        ticketName:TicketData[i].dataValues.ticketName,
        price:TicketData[i].dataValues.price + servicePrice ,
        description:TicketData[i].dataValues.description,
        minLimit:TicketData[i].dataValues.minLimit,
        maxLimit:TicketData[i].dataValues.maxLimit
      })
    }
      }
        if(!TicketData){
          return h.response({message:"Enter Valid Id"}).code(400)
        }
        return h.response({
          responseData:{
            ticket:ticketFinal,
          /*  totalTicketAvailable:tickets */
          }
        });
      }
      if(request.payload.type=="activity")
      {
        const remain = await db.activityBookingTimings.findAll({
          attributes:["booking_id"],
          where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
        })
        console.log('already bookings',remain.length)
        if(remain.length==0 )
        {
         
          var ticketFinal=[]
          var TicketData = await db.activityTicket.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
            where:{activity_id:request.payload.id}
          })
          console.log("TicketData",TicketData)
          
          for(let i=0;i<TicketData.length;i++)
          {
            var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              // ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price + servicePrice,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }

          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
        }
        for(let i =0 ;i<remain.length;i++)
        {
          var remainticket =await db.activityBookingTickets.findAll({
            attributes:["ticket_id","ticketSold"],
            where:{booking_id:remain[i].dataValues.booking_id}
          })
          console.log("user booked tickets",remainticket)
        }
        var ticketDate=[]
        for(let i=0;i<remainticket.length;i++){
          var noOfticket = await db.activityTicket.findAll({
            attributes:["noOfTicketAvailable"],
            where:{id:remainticket[i].dataValues.ticket_id}
          })
          console.log("ticket available",noOfticket)
          for(let j=0;j<noOfticket.length;j++)
          {
            if(noOfticket[j].dataValues.noOfTicketAvailable!==0)
            {
            var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketAvailable - remainticket[i].dataValues.ticketSold
            console.log('noOfTicketRemain',noOfTicketRemain)
            var ticket_id = remainticket[i].dataValues.ticket_id
            ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
            }
            // if(noOfticket[j].dataValues.noOfTicketRemain==0)
            // {
            //   var noOfTicketRemain=0
            //   var ticket_id = remainticket[i].dataValues.ticket_id
            //   ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
            // }

            
          }

          // var update = await db.ticket.update({
          //   noOfTicketRemain:noOfTicketRemain
          // },{
          //   where:{id:remainticket[i].dataValues.ticket_id}
          // })
        }
    
      console.log('SSSSSSDate',ticketDate)
      var ticketFinal =[]
      var TicketData = await db.activityTicket.findAll({
        where:{activity_id:request.payload.id}
      })
      for(let i=0 ; i<TicketData.length;i++)
      {
        var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
        let flag = 0
        for(let j=0 ;j<ticketDate.length;j++)
        {
          if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
          {
            
            ticketFinal.push({
                id:TicketData[i].dataValues.id,
                ticketRemain:ticketDate[j].noOfTicketRemain,
                noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
                ticketName:TicketData[i].dataValues.ticketName,
                price:TicketData[i].dataValues.price + servicePrice ,
                description:TicketData[i].dataValues.description,
                minLimit:TicketData[i].dataValues.minLimit,
                maxLimit:TicketData[i].dataValues.maxLimit
              })    
              flag = 1;
              break;
      }
      }
      if(flag==0)
      {
      ticketFinal.push({
        id:TicketData[i].dataValues.id,
        ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
        noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
        ticketName:TicketData[i].dataValues.ticketName,
        price:TicketData[i].dataValues.price + servicePrice ,
        description:TicketData[i].dataValues.description,
        minLimit:TicketData[i].dataValues.minLimit,
        maxLimit:TicketData[i].dataValues.maxLimit
      })
    }
      }
        if(!TicketData){
          return h.response({message:"Enter Valid Id"}).code(400)
        }
        return h.response({
          responseData:{
            ticket:ticketFinal,
          /*  totalTicketAvailable:tickets */
          }
        });
        
        
        //syd code
    //     const remain = await db.activityBookingTimings.findAll({
    //       attributes:["booking_id"],
    //       where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
    //     })
    //     console.log('SSSSSSSS',remain.length)
    //     if(remain.length==0)
    //     {
    //       var ticketFinal=[]
    //       var TicketData = await db.activityTicket.findAll({
    //         attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
    //         where:{activity_id:request.payload.id}
    //       })
          
    //       for(let i=0;i<TicketData.length;i++)
    //       {
    //         var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
    //         ticketFinal.push({
    //           id:TicketData[i].dataValues.id,
    //           ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
    //           noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //           ticketName:TicketData[i].dataValues.ticketName,
    //           price:TicketData[i].dataValues.price + servicePrice ,
    //           description:TicketData[i].dataValues.description,
    //           minLimit:TicketData[i].dataValues.minLimit,
    //           maxLimit:TicketData[i].dataValues.maxLimit
    //         }) 
    //       }
    //       return h.response({
    //         responseData:{
    //           ticket:ticketFinal
    //         }
    //       })
    //     }
    //     for(let i =0 ;i<remain.length;i++)
    //     {
    //       var remainticket =await db.activityBookingTickets.findAll({
    //         attributes:["ticket_id","ticketSold"],
    //         where:{booking_id:remain[i].dataValues.booking_id}
    //       })
    //     }
    //     console.log('SSSSSSSSSsticket',remainticket)
    //     var ticketDate=[]
    //   for(let i=0;i<remainticket.length;i++){
    //     var noOfticket = await db.activityTicket.findAll({
    //       attributes:["noOfTicketRemain"],
    //       where:{id:remainticket[i].dataValues.ticket_id}
    //     })
    //     for(let j=0;j<noOfticket.length;j++)
    //     {
    //       if(noOfticket[j].dataValues.noOfTicketRemain!==0)
    //       {
    //       console.log('SSSSS',noOfticket[j].dataValues.noOfTicketRemain)
    //       var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketRemain - remainticket[i].dataValues.ticketSold
    //       var ticket_id = remainticket[i].dataValues.ticket_id
    //       ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
    //       }
    //       if(noOfticket[j].dataValues.noOfTicketRemain==0)
    //       {
    //         var noOfTicketRemain=0
    //         var ticket_id = remainticket[i].dataValues.ticket_id
    //         ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
    //       }
          
    //     }

    //     var update = await db.activityTicket.update({
    //       noOfTicketRemain:noOfTicketRemain
    //     },{
    //       where:{id:remainticket[i].dataValues.ticket_id}
    //     })

      
    //   }
    //   console.log('SSSSSSDate',ticketDate)
    //   var ticketFinal =[]
    //   var TicketData = await db.activityTicket.findAll({
    //     where:{activity_id:request.payload.id}
    //   })
    //   for(let i=0 ; i<TicketData.length;i++)
    //   {
    //     var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
    //     let flag = 0
    //     for(let j=0 ;j<ticketDate.length;j++)
    //     {
    //       if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
    //       {
    //         ticketFinal.push({
    //             id:TicketData[i].dataValues.id,
    //             ticketRemain:ticketDate[j].noOfTicketRemain,
    //             noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //             ticketName:TicketData[i].dataValues.ticketName,
    //             price:TicketData[i].dataValues.price + servicePrice ,
    //             description:TicketData[i].dataValues.description,
    //             minLimit:TicketData[i].dataValues.minLimit,
    //             maxLimit:TicketData[i].dataValues.maxLimit
    //           })    
    //           flag = 1;
    //           break;
    //   }
    //   }
    //   if(flag==0)
    //   {
    //   ticketFinal.push({
    //     id:TicketData[i].dataValues.id,
    //     ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
    //     noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //     ticketName:TicketData[i].dataValues.ticketName,
    //     price:TicketData[i].dataValues.price + servicePrice ,
    //     description:TicketData[i].dataValues.description,
    //     minLimit:TicketData[i].dataValues.minLimit,
    //     maxLimit:TicketData[i].dataValues.maxLimit
    //   })
    // }
    //   }
    //     if(!TicketData){
    //       return h.response({message:"Enter Valid Id"}).code(400)
    //     }
    //     return h.response({
    //       responseData:{
    //         ticket:ticketFinal,
    //       /*  totalTicketAvailable:tickets */
    //       }
    //     });
      }
      if(request.payload.type=='shops')
      {
        var ticketFinal=[]
          var TicketData = await db.salonServices.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description"],
            where:{salon_id:request.payload.id}
          })
          
          for(let i=0;i<TicketData.length;i++)
          {
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
      }
      if(request.payload.type=="club")
      {
        var ticketFinal=[]
          var TicketData = await db.clubServices.findAll({
            attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","priceFor"],
            where:{club_id:request.payload.id}
          })
          
          for(let i=0;i<TicketData.length;i++)
          {
            ticketFinal.push({
              id:TicketData[i].dataValues.id,
              ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
              noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
              ticketName:TicketData[i].dataValues.ticketName,
              price:TicketData[i].dataValues.price,
              priceFor:TicketData[i].dataValues.priceFor,
              description:TicketData[i].dataValues.description,
              minLimit:TicketData[i].dataValues.minLimit,
              maxLimit:TicketData[i].dataValues.maxLimit
            }) 
          }
          return h.response({
            responseData:{
              ticket:ticketFinal
            }
          })
      }
    //   if(request.payload.type=="club")
    //   {
    //     var ticketFinal=[]
    //     const remain = await db.clubBookingServices.findAll({
    //       attributes:["booking_id"],
    //       where:{startDate:request.payload.startDate ,startTime:request.payload.startTime,endTime:request.payload.endTime,status:{[Op.is]:null},refundStatus:{[Op.is]:null}}
    //     })
    //     console.log('already bookings',remain.length)
    //     if(remain.length==0 )
    //     {
         
    //       var ticketFinal=[]
    //       var TicketData = await db.activityTicket.findAll({
    //         attributes:["id","ticketName","noOfTicketAvailable","price","maxLimit","minLimit","description","noOfTicketRemain"],
    //         where:{activity_id:request.payload.id}
    //       })
    //       console.log("TicketData",TicketData)
          
    //       for(let i=0;i<TicketData.length;i++)
    //       {
    //         var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
    //         ticketFinal.push({
    //           id:TicketData[i].dataValues.id,
    //           // ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
    //           ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
    //           noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //           ticketName:TicketData[i].dataValues.ticketName,
    //           price:TicketData[i].dataValues.price + servicePrice,
    //           description:TicketData[i].dataValues.description,
    //           minLimit:TicketData[i].dataValues.minLimit,
    //           maxLimit:TicketData[i].dataValues.maxLimit
    //         }) 
    //       }

    //       return h.response({
    //         responseData:{
    //           ticket:ticketFinal
    //         }
    //       })
    //     }
    //     for(let i =0 ;i<remain.length;i++)
    //     {
    //       var remainticket =await db.activityBookingTickets.findAll({
    //         attributes:["ticket_id","ticketSold"],
    //         where:{booking_id:remain[i].dataValues.booking_id}
    //       })
    //       console.log("user booked tickets",remainticket)
    //     }
    //     var ticketDate=[]
    //     for(let i=0;i<remainticket.length;i++){
    //       var noOfticket = await db.activityTicket.findAll({
    //         attributes:["noOfTicketAvailable"],
    //         where:{id:remainticket[i].dataValues.ticket_id}
    //       })
    //       console.log("ticket available",noOfticket)
    //       for(let j=0;j<noOfticket.length;j++)
    //       {
    //         if(noOfticket[j].dataValues.noOfTicketAvailable!==0)
    //         {
    //         var noOfTicketRemain = noOfticket[j].dataValues.noOfTicketAvailable - remainticket[i].dataValues.ticketSold
    //         console.log('noOfTicketRemain',noOfTicketRemain)
    //         var ticket_id = remainticket[i].dataValues.ticket_id
    //         ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
    //         }
    //         // if(noOfticket[j].dataValues.noOfTicketRemain==0)
    //         // {
    //         //   var noOfTicketRemain=0
    //         //   var ticket_id = remainticket[i].dataValues.ticket_id
    //         //   ticketDate.push({noOfTicketRemain:noOfTicketRemain ,ticket_id: ticket_id})
    //         // }

            
    //       }

    //       // var update = await db.ticket.update({
    //       //   noOfTicketRemain:noOfTicketRemain
    //       // },{
    //       //   where:{id:remainticket[i].dataValues.ticket_id}
    //       // })
    //     }
    
    //   console.log('SSSSSSDate',ticketDate)
    //   var ticketFinal =[]
    //   var TicketData = await db.activityTicket.findAll({
    //     where:{activity_id:request.payload.id}
    //   })
    //   for(let i=0 ; i<TicketData.length;i++)
    //   {
    //     var servicePrice = (serviceCharge.dataValues.serviceTax/100) * TicketData[i].dataValues.price
    //     let flag = 0
    //     for(let j=0 ;j<ticketDate.length;j++)
    //     {
    //       if(TicketData[i].dataValues.id == ticketDate[j].ticket_id)
    //       {
            
    //         ticketFinal.push({
    //             id:TicketData[i].dataValues.id,
    //             ticketRemain:ticketDate[j].noOfTicketRemain,
    //             noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //             ticketName:TicketData[i].dataValues.ticketName,
    //             price:TicketData[i].dataValues.price + servicePrice ,
    //             description:TicketData[i].dataValues.description,
    //             minLimit:TicketData[i].dataValues.minLimit,
    //             maxLimit:TicketData[i].dataValues.maxLimit
    //           })    
    //           flag = 1;
    //           break;
    //   }
    //   }
    //   if(flag==0)
    //   {
    //   ticketFinal.push({
    //     id:TicketData[i].dataValues.id,
    //     ticketRemain:TicketData[i].dataValues.noOfTicketRemain,
    //     noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //     ticketName:TicketData[i].dataValues.ticketName,
    //     price:TicketData[i].dataValues.price + servicePrice ,
    //     description:TicketData[i].dataValues.description,
    //     minLimit:TicketData[i].dataValues.minLimit,
    //     maxLimit:TicketData[i].dataValues.maxLimit
    //   })
    // }
    //   }
    //     if(!TicketData){
    //       return h.response({message:"Enter Valid Id"}).code(400)
    //     }
    //     return h.response({
    //       responseData:{
    //         ticket:ticketFinal,
    //       /*  totalTicketAvailable:tickets */
    //       }
    //     });
          
    //       //syd code
    //       // for(let i=0;i<TicketData.length;i++)
    //       // {
    //       //   ticketFinal.push({
    //       //     id:TicketData[i].dataValues.id,
    //       //     ticketRemain:TicketData[i].dataValues.noOfTicketAvailable,
    //       //     noOfTicketAvailable:TicketData[i].dataValues.noOfTicketAvailable,
    //       //     ticketName:TicketData[i].dataValues.ticketName,
    //       //     price:TicketData[i].dataValues.price,
    //       //     priceFor:TicketData[i].dataValues.priceFor,
    //       //     description:TicketData[i].dataValues.description,
    //       //     minLimit:TicketData[i].dataValues.minLimit,
    //       //     maxLimit:TicketData[i].dataValues.maxLimit
    //       //   }) 
    //       // }
    //       return h.response({
    //         responseData:{
    //           ticket:ticketFinal
    //         }
    //       })
    //   }
    } catch (e) {
      console.log("ss", e);
    }
  };

  addTicket = async (request, h) => { 
    try {
      var data = request.payload
      var ticket =[];
      var serviceCharge = await db.eventSetting.findOne({attributes:['serviceTax']})
      let totalTicketsCapacity = 0;
      let totalTicketWantTocreat = 0;

      if(data.type=='event')
      {

        var totalCapacity = await db.event.findOne({
          attributes: [
            "capacity"
          ],
          where: { id: data.id},
        });
        if(totalCapacity){
          totalTicketsCapacity = totalCapacity.dataValues.capacity
        }
        for(var i=0;i<data.tickets.length; i++){
          totalTicketWantTocreat += data.tickets[i].noOfTicketAvailable;
        }
        console.log({totalTicketWantTocreat},{totalTicketsCapacity})
        if(totalTicketWantTocreat > totalTicketsCapacity){
          return h.response({message:'Max Limit should not be more than available ticket'}).code(400)
        }

        //get already created tickets
        let existTicketsIds = [];
        var existTickets = await db.ticket.findAll({
          attributes:["id",],
          where:{event_id: data.id, isDeleted:0
          }
        })

        if(existTickets && existTickets.length){
          for(let i=0;i<existTickets.length;i++)
          {
            existTicketsIds.push(existTickets[i].dataValues.id)
          }
        }
        console.log(existTicketsIds.length)

        let updatedTicketIds = [];
        for(var i=0;i<data.tickets.length; i++)
        {
          // var servicePrice = (serviceCharge.dataValues.serviceTax/100) * data.tickets[i].price
          console.log(data.tickets[i].id)
          if(data.tickets[i].id){
                const update=await db.ticket.update({
                  ticketName: data.tickets[i].ticketName,
                  description:data.tickets[i].description,
                  noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
                  noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
                  price: data.tickets[i].price /* + servicePrice */,
                  originalPrice:data.tickets[i].price,
                  minLimit:data.tickets[i].minLimit,
                  maxLimit:data.tickets[i].maxLimit
                },{
                  where:{id:data.tickets[i].id}
                })
                updatedTicketIds.push(data.tickets[i].id)
          }
          else{
            ticket.push({
              event_id:data.id,
              ticketName: data.tickets[i].ticketName,
              description:data.tickets[i].description,
              noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
              noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
              price: data.tickets[i].price /* + servicePrice */,
              originalPrice:data.tickets[i].price,
              minLimit:data.tickets[i].minLimit,
              maxLimit:data.tickets[i].maxLimit
            })
          }
        }
        console.log({updatedTicketIds})

        let deleteTicketIds = []   //need to be delete
        if(updatedTicketIds && updatedTicketIds.length){
          if(existTicketsIds && existTicketsIds.length){
            for(let i=0; i<existTicketsIds.length; i++){
              if(!updatedTicketIds.includes(existTicketsIds[i])){
                deleteTicketIds.push(existTicketsIds[i])
              }
            }
          }
        }

        console.log({deleteTicketIds})
        //check booking exist or not of that ticket than to be delete
        if(deleteTicketIds && deleteTicketIds.length){
          var bookedtickets = await db.userBookingEventsTicket.findAll({
            attributes:["ticket_id"],
            where:{
              ticket_id:{
                [Op.in]: deleteTicketIds
              }
            }
          })
          console.log({bookedtickets})
          if(bookedtickets && bookedtickets.length){
            return h.response({message:'Some ticket have booking cannot delete'}).code(400)
          }

          //delete ticket
          await db.ticket.update({
            isDeleted: 1
          },{
            where:{
              id: {
                [Op.in]: deleteTicketIds
              }
            }
          })
        }

        if(ticket && ticket.length){
          const add = await db.ticket.bulkCreate(ticket)
          return add
        }
        return "edit successfully"
    }
    if(data.type=='activity')
    {
      var totalCapacity = await db.activity.findOne({
        attributes: [
          "capacity"
        ],
        where: { id: data.id},
      });
      if(totalCapacity){
        totalTicketsCapacity = totalCapacity.dataValues.capacity
      }
      for(var i=0;i<data.tickets.length; i++){
        totalTicketWantTocreat += data.tickets[i].noOfTicketAvailable;
      }
      console.log({totalTicketWantTocreat},{totalTicketsCapacity})
      if(totalTicketWantTocreat > totalTicketsCapacity){
        return h.response({message:'Max Limit should not be more than available ticket'}).code(400)
      }

      //get already created tickets
      let existTicketsIds = [];
      var existTickets = await db.activityTicket.findAll({
        attributes:["id",],
        where:{activity_id: data.id, isDeleted:0
        }
      })

      if(existTickets && existTickets.length){
        for(let i=0;i<existTickets.length;i++)
        {
          existTicketsIds.push(existTickets[i].dataValues.id)
        }
      }
      console.log(existTicketsIds.length)

      let updatedTicketIds = [];
      for(var i=0;i<data.tickets.length; i++)
      {
        totalTicketWantTocreat += data.tickets[i].noOfTicketAvailable;
        // var servicePrice = (serviceCharge.dataValues.serviceTax/100) * data.tickets[i].price
        console.log(data.tickets[i].id)
        if(data.tickets[i].id){
              const update=await db.activityTicket.update({
                ticketName: data.tickets[i].ticketName,
                description:data.tickets[i].description,
                noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
                noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
                price: data.tickets[i].price /* + servicePrice */,
                originalPrice:data.tickets[i].price,
                minLimit:data.tickets[i].minLimit,
                maxLimit:data.tickets[i].maxLimit
              },{
                where:{id:data.tickets[i].id}
              })
              updatedTicketIds.push(data.tickets[i].id)
        }
        else{
          ticket.push({
            activity_id:data.id,
            ticketName: data.tickets[i].ticketName,
            description:data.tickets[i].description,
            noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
            noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
            price: data.tickets[i].price /* + servicePrice */,
            originalPrice:data.tickets[i].price,
            minLimit:data.tickets[i].minLimit,
            maxLimit:data.tickets[i].maxLimit
          })
        }
      }
      console.log({updatedTicketIds})

      let deleteTicketIds = []   //need to be delete
      if(updatedTicketIds && updatedTicketIds.length){
        if(existTicketsIds && existTicketsIds.length){
          for(let i=0; i<existTicketsIds.length; i++){
            if(!updatedTicketIds.includes(existTicketsIds[i])){
              deleteTicketIds.push(existTicketsIds[i])
            }
          }
        }
      }

      console.log({deleteTicketIds})
      //check booking exist or not of that ticket than to be delete
      if(deleteTicketIds && deleteTicketIds.length){
        var bookedtickets = await db.activityBookingTickets.findAll({
          attributes:["ticket_id"],
          where:{
            ticket_id:{
              [Op.in]: deleteTicketIds
            }
          }
        })
        console.log({bookedtickets})
        if(bookedtickets && bookedtickets.length){
          return h.response({message:'Some ticket have booking cannot delete'}).code(400)
        }

        //delete ticket
        await db.activityTicket.update({
          isDeleted: 1
        },{
          where:{
            id: {
              [Op.in]: deleteTicketIds
            }
          }
        })
      }

      if(ticket && ticket.length){
        const add = await db.activityTicket.bulkCreate(ticket)
        return add
      }
      return "edit successfully"
    }
    if(data.type=='club')
    {
      var totalCapacity = await db.clubs.findOne({
        attributes: [
          "capacity"
        ],
        where: { id: data.id},
      });
      if(totalCapacity){
        totalTicketsCapacity = totalCapacity.dataValues.capacity
      }
      for(var i=0;i<data.tickets.length; i++){
        totalTicketWantTocreat += data.tickets[i].noOfTicketAvailable;
      }
      console.log({totalTicketWantTocreat},{totalTicketsCapacity})
      if(totalTicketWantTocreat > totalTicketsCapacity){
        return h.response({message:'Max Limit should not be more than available ticket'}).code(400)
      }

      //get already created tickets
      let existTicketsIds = [];
      var existTickets = await db.clubServices.findAll({
        attributes:["id",],
        where:{club_id: data.id, isDeleted:0
        }
      })

      if(existTickets && existTickets.length){
        for(let i=0;i<existTickets.length;i++)
        {
          existTicketsIds.push(existTickets[i].dataValues.id)
        }
      }
      console.log(existTicketsIds.length)

      let updatedTicketIds = [];
      for(var i=0;i<data.tickets.length; i++)
      {
        // var servicePrice = (serviceCharge.dataValues.serviceTax/100) * data.tickets[i].price
        console.log(data.tickets[i].id)
        if(data.tickets[i].id){
              const update=await db.clubServices.update({
                ticketName: data.tickets[i].ticketName,
                description:data.tickets[i].description,
                noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
                noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
                price: data.tickets[i].price /* + servicePrice */,
                originalPrice:data.tickets[i].price,
                minLimit:data.tickets[i].minLimit,
                maxLimit:data.tickets[i].maxLimit
              },{
                where:{id:data.tickets[i].id}
              })
              updatedTicketIds.push(data.tickets[i].id)
        }
        else{
          ticket.push({
            activity_id:data.id,
            ticketName: data.tickets[i].ticketName,
            description:data.tickets[i].description,
            noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
            noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
            price: data.tickets[i].price /* + servicePrice */,
            originalPrice:data.tickets[i].price,
            minLimit:data.tickets[i].minLimit,
            maxLimit:data.tickets[i].maxLimit
          })
        }
      }
      console.log({updatedTicketIds})

      let deleteTicketIds = []   //need to be delete
      if(updatedTicketIds && updatedTicketIds.length){
        if(existTicketsIds && existTicketsIds.length){
          for(let i=0; i<existTicketsIds.length; i++){
            if(!updatedTicketIds.includes(existTicketsIds[i])){
              deleteTicketIds.push(existTicketsIds[i])
            }
          }
        }
      }

      console.log({deleteTicketIds})
      //check booking exist or not of that ticket than to be delete
      if(deleteTicketIds && deleteTicketIds.length){
        var bookedtickets = await db.clubBookingServices.findAll({
          attributes:["ticket_id"],
          where:{
            ticket_id:{
              [Op.in]: deleteTicketIds
            }
          }
        })
        console.log({bookedtickets})
        if(bookedtickets && bookedtickets.length){
          return h.response({message:'Some ticket have booking cannot delete'}).code(400)
        }

        //delete ticket
        await db.clubServices.update({
          isDeleted: 1
        },{
          where:{
            id: {
              [Op.in]: deleteTicketIds
            }
          }
        })
      }

      if(ticket && ticket.length){
        const add = await db.clubServices.bulkCreate(ticket)
        return add
      }
      return "edit successfully"
    }
    if(data.type=='shops')
    {
      //get already created tickets
      let existTicketsIds = [];
      var existTickets = await db.salonServices.findAll({
        attributes:["id",],
        where:{salon_id: data.id, isDeleted:0
        }
      })

      if(existTickets && existTickets.length){
        for(let i=0;i<existTickets.length;i++)
        {
          existTicketsIds.push(existTickets[i].dataValues.id)
        }
      }
      console.log(existTicketsIds.length)

      let updatedTicketIds = [];
      for(var i=0;i<data.tickets.length; i++)
      {
        // var servicePrice = (serviceCharge.dataValues.serviceTax/100) * data.tickets[i].price
        console.log(data.tickets[i].id)
        if(data.tickets[i].id){
              const update=await db.salonServices.update({
                ticketName: data.tickets[i].ticketName,
                description:data.tickets[i].description,
                noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
                noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
                price: data.tickets[i].price /* + servicePrice */,
                originalPrice:data.tickets[i].price,
                minLimit:data.tickets[i].minLimit,
                maxLimit:data.tickets[i].maxLimit
              },{
                where:{id:data.tickets[i].id}
              })
              updatedTicketIds.push(data.tickets[i].id)
        }
        else{
          ticket.push({
            activity_id:data.id,
            ticketName: data.tickets[i].ticketName,
            description:data.tickets[i].description,
            noOfTicketAvailable: data.tickets[i].noOfTicketAvailable,
            noOfTicketRemain:data.tickets[i].noOfTicketAvailable,
            price: data.tickets[i].price /* + servicePrice */,
            originalPrice:data.tickets[i].price,
            minLimit:data.tickets[i].minLimit,
            maxLimit:data.tickets[i].maxLimit
          })
        }
      }
      console.log({updatedTicketIds})

      let deleteTicketIds = []   //need to be delete
      if(updatedTicketIds && updatedTicketIds.length){
        if(existTicketsIds && existTicketsIds.length){
          for(let i=0; i<existTicketsIds.length; i++){
            if(!updatedTicketIds.includes(existTicketsIds[i])){
              deleteTicketIds.push(existTicketsIds[i])
            }
          }
        }
      }

      console.log({deleteTicketIds})
      //check booking exist or not of that ticket than to be delete
      if(deleteTicketIds && deleteTicketIds.length){
        var bookedtickets = await db.salonBookingServices.findAll({
          attributes:["ticket_id"],
          where:{
            ticket_id:{
              [Op.in]: deleteTicketIds
            }
          }
        })
        console.log({bookedtickets})
        if(bookedtickets && bookedtickets.length){
          return h.response({message:'Some ticket have booking cannot delete'}).code(400)
        }

        //delete ticket
        await db.salonServices.update({
          isDeleted: 1
        },{
          where:{
            id: {
              [Op.in]: deleteTicketIds
            }
          }
        })
      }

      if(ticket && ticket.length){
        const add = await db.salonServices.bulkCreate(ticket)
        return add
      }
      return "edit successfully"
    }
    } catch (e) {
      console.log("##addaminties######", e);
    }
  };

  getTicketById=async(request,h)=>{
    try{
          if(request.query.type=='event')
          {
            var ticket = await db.ticket.findAll({where:{event_id:request.query.id, isDeleted:0}})
          }
          if(request.query.type=='activity')
          {
            var ticket = await db.activityTicket.findAll({where:{activity_id:request.query.id}})
          }
          if(request.query.type=='club')
          {
            var ticket = await db.clubServices.findAll({where:{club_id:request.query.id}})
          }
          if(request.query.type=='shops')
          {
            var ticket = await db.salonServices.findAll({where:{salon_id:request.query.id}})
          }
          return h.response({
            responseData:{
              ticket
            }
          })

    }
    catch(e)
    {
      console.log('SSSSSSSss',e)
    }
  }

  editTicket = async (request) => {
    try {
      var data = request.payload
      const editAmini = await db.ticket.update(
        {
          ticketName: data.ticketName,
          description:data.description,
          noOfTicketAvailable: data.noOfTicketAvailable,
          price: data.price,
          minLimit:data.minLimit,
          maxLimit:data.maxLimit
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

  /* deleteTicket = async (request) => {
    try {
      const delamini = await db.ticket.destroy({
        where: {
          id: request.payload.id,
        },
      });
      return ("Deleted Successfully");
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  };*/
}

module.exports = new ticket();
