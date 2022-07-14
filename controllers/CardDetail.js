const db = require("../models/index");
const stripe = require('stripe')(process.env.STRIPE_KEY);
class cardDetail {

    addCard=async(request,h)=>{
            try {
                const authToken = request.auth.credentials.userData
                var card;
                let customerDetails = await db.users.findAll({
                    attribute:["stripeCustomerId","mobile"],
                    where:{id:authToken.userId}
                })
                console.log('SSSSSS',customerDetails[0].dataValues.stripeCustomerId)
                console.log('SSSSSS', customerDetails[0].dataValues.mobile)
                  if(customerDetails && customerDetails.length){

                  if(!customerDetails[0].dataValues.stripeCustomerId){
                   await stripe.customers.create(
                    {
                      phone: customerDetails[0].dataValues.mobile,
                    }
                  ).then(async(customer)=>{
                    console.log("customer->>",customer)
                   await stripe.customers.createSource(
                      customer.id,
                      {
                        source: request.payload.token,
                      }
                    ).then(async (source)=>{
                      console.log("source",source)
                      let cardParams = [
                        authToken.userId,
                        source.brand,
                        source.last4,
                        source.exp_year,
                        source.id,
                        source.funding,
                        customer.id
                      ];
                     let data = await db.users.update({stripeCustomerId:customer.id},{ where:{id:authToken.userId} })
                   
                     card = await db.userCardDetail.create({
                        user_id:authToken.userId,
                        lastFourDigit:source.last4,
                        cardType:source.funding,
                        cardBrand:source.brand,
                        expiryDate:source.exp_year,
                        token:source.id,
                        stripCustomerId:customer.id , 
                        isDeleted:false
                    })
                    
                   
                     /*  */
         
                    }).catch((err)=>{
                      console.log('SSSSSSSSSSS1',err)
                  });
         
                  }).catch((err)=>{
                    console.log('SSSSSSSSSSSSs',err)
                  });
                  console.log('SSSSSSSSS',card)
                  return h.response({
                    responseData:{
                        
                          cardId:card.dataValues.id
                        
                    }
                })
                  }

                  else{
                      console.log('TTTTTTTTTTTTTT')
                   await stripe.customers.createSource(
                      customerDetails[0].stripeCustomerId,
                      {
                        source:request.payload.token,
                      }
                    ).then(async (source)=>{
                      console.log("source",source)
                      let cardParams = [
                        authToken.userId,
                        source.brand,
                        source.last4,
                        source.exp_year,
                        source.id,
                        source.funding,
                        customerDetails[0].stripeCustomerId
                      ];
                     card= await db.userCardDetail.create({
                        user_id:authToken.userId,
                        lastFourDigit:source.last4,
                        cardType:source.funding,
                        cardBrand:source.brand,
                        expiryDate:source.exp_year,
                        token:source.id,
                        stripCustomerId:customerDetails[0].stripeCustomerId , 
                        isDeleted:false
                    })

                    }).catch((err)=>{
                      console.log('SSSSSSSSSSSSSSSSSSSSSS4',err)
                  });
                  return h.response({
                    responseData:{
                        cardId:card.dataValues.id
                    }
                })
                    
                  }
                }

                else{
                  return "Not Available";
                } 


              } catch (err) {
               console.log('SSSSSSSSSSSSSSSSSs',err)
              }

            }
            
        
           /*  const authToken = request.auth.credentials.userData
            const data = request.payload
                const add = await db.userCardDetail.create({
                    user_id:authToken.userId,
                    lastFourDigit:data.lastFourDigit,
                    cardType:data.cardType,
                    cardBrand:data.cardBrand,
                    token:data.token,
                     stripCustomerId:data.stripCustomerId, 
                    isDeleted:false
                })
                return h.response({
                    message:'Add Successfully'
                }) */
        

    getCard=async(request,h)=>{
        try{
            const authToken = request.auth.credentials.userData

                const paymentMode = await db.paymentOptions.findAll({
                    attributes:["platForm","enable"],
                    where:{enable:true}
                })
                const get = await db.userCardDetail.findAndCountAll({
                  attributes:["id","lastFourDigit","cardType","cardBrand","expiryDate"],
                    where:{user_id:authToken.userId,isDeleted:false}
                })

                return h.response({
                    responseData:{
                        cards:get.rows,
                        paymentMode,
                       
                    }
                })
        }
        catch(e){
            console.log('SSSSSSSSSSS',e)
        }
    }


    deleteCard=async(request,h)=>{
      try{
        const authToken=request.auth.credentials.userData
        var data =request.query
          if(data.cardId==0||data.cardId=='')
          {
            return h.response({message:"Enter  CardID "})
          }
        var cardData = await db.userCardDetail.findOne({
          attributes:["token","stripCustomerId"],
          where:{user_id:authToken.userId,id:data.cardId}
        })
        if(!cardData)
        {
            return h.response({message:"No card details found"})
        }
        
        const deleted = await stripe.customers.deleteSource(cardData.dataValues.stripCustomerId,cardData.dataValues.token);
        console.log('deleted',deleted)
        if(deleted.id)
        {
          var remove = await db.userCardDetail.update({
            isDeleted:true,
          },
            {
            where:{user_id:authToken.userId,id:data.cardId}
          })

          return h.response({responseData:{message:'Deleted'}})
        }
      }
      catch(e){
        console.log('SSSSSSSSSSdeleteCard',e)
        return h.response({message:e.raw.message}).code(400)
      }
    }
}

module.exports = new cardDetail();
