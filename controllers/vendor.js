const db = require("../models");
const Decryt = require("../universalFunctions/lib");
const stripe = require('stripe')(process.env.STRIPE_KEY);
var UniversalFunctions = require("../universalFunctions/lib");
var constant = require("../config/constant")
const moment = require("moment");
const { Sequelize, sequelize } = require("../models");
const sendEmailReceipt = require("../notifications/email")
const sendNotification = require("../notifications/notifications")
const emailContent = require("../templates/emailVerification")
const emailTemplate=require('../templates/header')
const forgetPasswordTemplate=require('../templates/forgetPassword') 
const handlebars = require("handlebars");
const braintree = require("braintree");
const user = require("./user");



class vendor {

    vendorsignUp=async(req,h)=>{
        try{

             var data = req.payload
             if(data.password)
             {
               var pass = UniversalFunctions.encrypt(data.password)
             }

             let emailExist = await db.users.findOne({
              where: {
                email: data.email,
                status: 1,
              },
            });

            if(emailExist)
            {
              return h.response({message:'Email already exist'}).code(400)
            }

             let mobileExist = await db.users.findOne({
              where: {
                mobile: data.mobile,
                countryCode: data.countryCode,
                country: data.country,
                status: 1,
              },
            });

            if(mobileExist)
            {
              return h.response({message:'Mobile number already exist'}).code(400)
            }

             const User  = await db.users.create({
                 email:data.email,
                 password: pass,
                 status:constant.STATUS.ACTIVE,
                 mobile:data.mobile,
                 countryCode:data.countryCode,
                 country:data.country,
                 profileStatus:constant.PROFILE_STATUS.INCOMPLETE,
                 role_id:constant.ROLES.VENDOR_ROLE
             })

             if(User)
             {
                 const profile = await db.userProfiles.create({
                     user_id:User.dataValues.id,
                     firstName:data.firstName,
                     lastName:data.lastName,
                     email:data.email,
                     profileImage_id:data.profileImage_id,
                     description:data.description
                 })

                 let Contentdata={
                  href:`https://partner.enjoyinglyfe.com/verify?userId=${User.dataValues.id}`,
                 }
                 
                 let completeHtml = handlebars.compile(emailContent.emailVerifiation)(Contentdata) 
                 console.log('ssss',completeHtml)
                 let templateData={
                  content:completeHtml,
                  type:'Verify Your Account'
                }
                  var htmlToSend = handlebars.compile(emailTemplate.header)(templateData)
                  console.log('ssss',htmlToSend)
                  let sendEmail = await sendEmailReceipt.sendEmail(constant.EMAIL_FROM.FROM,data.email,'EmailVerification',htmlToSend)
                 console.log('ssendEmail',sendEmail)
                 
                let adminData = await db.users.findOne({
                  where: {
                    role_id: constant.ROLES.ADMIN_ROLE,
                  },
                });
                if(adminData){
                  //send notification to admin
                  const create = await db.notifications.create({
                    title:constant.ADMIN_NOTIFICATION_TYPE.VENDOR_CREATED.title,
                    body:constant.ADMIN_NOTIFICATION_TYPE.VENDOR_CREATED.body,
                    notificationType:constant.ADMIN_NOTIFICATION_TYPE.VENDOR_CREATED.type,
                    user_id:adminData.dataValues.id,
                    notificationTo:constant.NOTIFICATION_TO.ADMIN
                  })
                }

                 return h.response({
                     responseData:{
                         userId:User.dataValues.id,
                         email:data.email
                     }
                 })
             }

            

        }
        catch(e)
        {
            console.log('SSSSSSSSSSSSSS',e)
        }

    }

    vendorEmailVerification=async(req,h)=>{
      try{
            var data = await db.users.findOne({where:{id:req.payload.userId}})

            if(data)
            {
              if(data.dataValues.profileStatus==constant.PROFILE_STATUS.INCOMPLETE)
              {
                  var verify = await db.users.update({
                    profileStatus:constant.PROFILE_STATUS.COMPLETED
                  },{
                    where:{id:req.payload.userId}
                  })

                  if(verify)
                  {
                    return h.response({message:"Email verify successfull"}).code(200)
                  }

              }
              else{
                return h.response({message:"Already verified"}).code(400)
              }

            }
            else{
              return h.response({message:'User not exists'}).code(400)
            }
      }
      catch(e)
      {
        console.log('ss',e)
      }
    }

    getVendor = async (payload) => {
        console.log("###############", payload.email);
        try {
          let data;
          if (payload.email) {
            data = await Models.users.findOne({
              where: {
                email: payload.email,
                status: 1,
                role_id: 3,
                profileStatus:constant.PROFILE_STATUS.COMPLETED
              },
            });
          }
    
          return data;
        } catch (e) {
          console.log("@@@@@@@@@@@@@@@@@@@@@", e);
          throw e;
        }
    };

    createSession = async (userId, role, ip,token) => {
        try {
          let data = await Models.userAccesses.create({
            user_id: userId,
            ip: ip,
            role: role,
            fcmToken:token
          });
          return data;
        } catch (e) {
          throw e;
        }
    };

    vendorSignIn=async(req,h)=>{
        try{
                const payload = req.payload;
                var stripeaccountEnable;
                let vendor = await this.getVendor(payload);
                if (!vendor) {
                  return Boom.badRequest(req.i18n.__("NO_SUCH_VENDOR_EXIST"));
                }
          
                vendor = vendor.dataValues;
                console.log('SSSSSSS',vendor)
                if(vendor.stripeaccountconnectId==null)
                {
                  var account =   await stripe.accounts.create({
                    type: 'standard'
                })
                  if(account)
                  {
                    const updateId = await db.users.update({
                        stripeaccountconnectId:account.id,
                        stripeaccountEnable:false
                      },
                      {
                     where:{
                       id:vendor.id
                     }}) 

                    var link = await stripe.accountLinks.create({
                      account:account.id,
                      refresh_url:'https://partner.enjoyinglyfe.com/login',
                      return_url:'https://partner.enjoyinglyfe.com/login',
                      type: 'account_onboarding',
                    })

                   if(link)
                   {
                    stripeaccountEnable=false
                    var AccountSetupUrl=link.url
                   }

                  }
                }
                if(vendor.stripeaccountconnectId!==null)
                {
                  var data = await stripe.accounts.retrieve(
                    vendor.stripeaccountconnectId
                  )
                  console.log('ss',data)
                  if(data.charges_enabled && data.details_submitted && data.payouts_enabled){
                    stripeaccountEnable=true
                    const updateId = await db.users.update({
                      stripeaccountEnable:true
                    },
                    {
                   where:{
                     id:vendor.id
                   }}) 

                  }
                  else{
                    stripeaccountEnable=false
                    const updateId = await db.users.update({
                      stripeaccountEnable:false
                    },
                    {
                   where:{
                     id:vendor.id
                   }}) 
                    var link =  await stripe.accountLinks.create({
                      account: vendor.stripeaccountconnectId,
                      refresh_url: "https://partner.enjoyinglyfe.com/login",
                      return_url: "https://partner.enjoyinglyfe.com/login",
                      type: 'account_onboarding',
                    })
                    if(link)
                    {
                      var AccountSetupUrl=link.url
                    }
                  }
                }
                const decryptPass = await Decryt.decryptData(vendor.password);
                if (decryptPass !== payload.password) {
                  return Boom.badRequest(
                    req.i18n.__("INVALID_EMAIL_ADDRESS_OR_PASSWORD")
                  );
                }
                let ip;
                if (req.headers["x-forwarded-for"]) {
                  ip = req.headers["x-forwarded-for"];
                } else {
                  ip = req.info.host;
                }
                const role = Constants.ROLES.VENDOR_ROLE;
                let sessionData = await this.createSession(vendor.id, role, ip,payload.token);
                let vendorScope = [];
                vendorScope.push("vendor");
                const tokenData = {
                  userId: vendor.id,
                  scope: vendorScope,
                  sessionId: sessionData.dataValues.id,
                };
                const token = UniversalFunctions.signToken(tokenData);
                var userProfile = await Models.userProfiles.findOne({
                  where: { user_id:vendor.id},
                  attributes: [
                    "user_id",
                    "firstName",
                    "lastName",
                    "email",
                    "description",
                    "address",
                    "referralCode",
                    "isDeleted",
                    "createdAt",
                    "updatedAt",
                    [Sequelize.col("user.mobile"), "mobile"],
                    [Sequelize.col("user.countryCode"), "countryCode"],
                    [Sequelize.col("user.country"), "country"],
                  ],
      
                  include: [
                    {
                      required: true,
                      model: Models.users,
                      attributes: [],
                    },
      
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model: Models.attachments,
                    },
                  ],
                });
                var subscription = await Models.vendorsubscriptionplanBooking.findOne({
                  attributes:["id","expiryDate"],
                  include:[{
                    attributes:["id","title","description","duration","price"],
                      model:Models.subscriptionPlan,
                      required:false
                  }],
                  order: [["createdAt", "DESC"]],
                  where:{user_id:vendor.id,status:'success'}
                })
                if(subscription && subscription.dataValues.id)
                {
                  var isSubscription = true
                }
                if(!subscription)
                {
                  var isSubscription = false
                }
                return h.response({
                  responseData: {
                    user:{
                    token: token,
                    isSubscription,
                    user_id: userProfile.user_id,
                    email: vendor.email,
                    firstName:userProfile.firstName,
                    lastName:userProfile.lastName,
                    description:userProfile.description,
                    mobile:userProfile.dataValues.mobile,
                    countryCode:userProfile.dataValues.countryCode,
                    country:userProfile.dataValues.country,
                    attachment:userProfile.attachment,
                    subscription,
                    stripeaccountEnable,
                    AccountSetupUrl
                    }
                  },
                });
        }
        catch(e)
        {
            console.log('SSSSSSSSSS',e)
        }
    }

    addImage = async(req,h)=>{
      try{
        var data = req.payload
        if(data.type=='event')
        {
        let eventGallaries = [];
        for (let i = 0; i < data.eventgalleries.length; i++) {
          let obj = {
            event_id: data.id,
            attachment_id: data.eventgalleries[i],
          };
          eventGallaries.push(obj);
        }
        if(data.id)
        {
          const already = await db.eventGallery.findAll({where:{event_id:data.id}})
          if(already)
          {
            for(var i=0;i<already.length;i++)
            {
              const deleteData = await db.eventGallery.destroy({where:{id:already[i].dataValues.id}})
            }
          }
        }
        var gallery = await db.eventGallery.bulkCreate(eventGallaries);
        console.log('SSSSSSSSS',gallery)
      }
      if(data.type=='activity')
      {
        let eventGallaries = [];
        for (let i = 0; i < data.eventgalleries.length; i++) {
          let obj = {
            activity_id: data.id,
            attachment_id: data.eventgalleries[i],
          };
          eventGallaries.push(obj);
        }
        if(data.id)
        {
          const already = await db.activityGallery.findAll({where:{activity_id:data.id}})
          if(already)
          {
            for(var i=0;i<already.length;i++)
            {
              const deleteData = await db.activityGallery.destroy({where:{id:already[i].dataValues.id}})
            }
          }
        }
        var gallery = await db.activityGallery.bulkCreate(eventGallaries);
      }
      if(data.type=='club')
      {
        let eventGallaries = [];
        for (let i = 0; i < data.eventgalleries.length; i++) {
          let obj = {
            club_id: data.id,
            attachment_id: data.eventgalleries[i],
          };
          eventGallaries.push(obj);
        }
          if(data.id)
          {
            const already = await db.clubGallery.findAll({where:{club_id:data.id}})
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.clubGallery.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          var gallery = await db.clubGallery.bulkCreate(eventGallaries);
      }
      if(data.type=='shops')
      {
        let eventGallaries = [];
        for (let i = 0; i < data.eventgalleries.length; i++) {
          let obj = {
            salon_id: data.id,
            attachment_id: data.eventgalleries[i],
          };
          eventGallaries.push(obj);
        }
          if(data.id)
          {
            const already = await db.salonGallery.findAll({where:{salon_id:data.id}})
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.salonGallery.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          var gallery = await db.salonGallery.bulkCreate(eventGallaries);
      }
      if(data.type=='restaurant')
      {
        let eventGallaries = [];
        for (let i = 0; i < data.eventgalleries.length; i++) {
          let obj = {
            restaurant_id: data.id,
            attachment_id: data.eventgalleries[i],
          };
          eventGallaries.push(obj);
        }
          if(data.id)
          {
            const already = await db.restaurantGallery.findAll({where:{restaurant_id:data.id}})
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.restaurantGallery.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          var gallery = await db.restaurantGallery.bulkCreate(eventGallaries);
      }
        return h.response({
          responseData:{
            gallery
          }
        })
      
      }
      catch(e)
      {
        console.log('SSSSSSS',e)
      }
    }

    vendorlogOut=async(req,h)=>{
      try{
          var authToken=req.auth.credentials.userData

          var logout = await db.userAccesses.destroy({
            where:{id:authToken.sessionId},
            force:true
          })

          if(logout)
          {
            return h.response({message:"Logout Successfull"})
          }
      }
      catch(e)
      {
        console.log('SSSSS',e)
      }
    }

    activityAvailability=async(request,h)=>{
      try{
        if(request.payload.type=='activity')
        {
        if (request.payload.Availability) {
          const newDate = new Date();
          const formatDate = moment(newDate).format("MM-DD-YYYY");
          var availabilities = [];
          for(var i=0; i<request.payload.Availability.length; i++){
              const startTime = moment(`${formatDate} ${request.payload.Availability[i].startTime}`).format('HH:mm:ss')
              const endTime = moment(`${formatDate} ${request.payload.Availability[i].endTime}`).format('HH:mm:ss');
              availabilities.push({
                activity_id:request.payload.id,
                days:request.payload.Availability[i].days,
                startTime: startTime,
                endTime: endTime,
              }) 
          } 
          if(request.payload.id)
          {
            const already = await db.activityAvailability.findAll({where:{activity_id:request.payload.id}});
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.activityAvailability.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          const result = await db.activityAvailability.bulkCreate(availabilities)
          return h.response({
            responseData:{
              result
            }
          })
        }
      }
      if(request.payload.type=='club')
      {
        if (request.payload.Availability) {
          const newDate = new Date();
          const formatDate = moment(newDate).format("MM-DD-YYYY");
          var availabilities = [];
          for(var i=0; i<request.payload.Availability.length; i++){
              const startTime = moment(`${formatDate} ${request.payload.Availability[i].startTime}`).format('HH:mm:ss')
              const endTime = moment(`${formatDate} ${request.payload.Availability[i].endTime}`).format('HH:mm:ss');
              availabilities.push({
                availableId:request.payload.id,
                days:request.payload.Availability[i].days,
                startTime: startTime,
                endTime: endTime,
              }) 
          } 
          if(request.payload.id)
          {
            const already = await db.availables.findAll({where:{availableId:request.payload.id}});
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.availables.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          const result = await db.availables.bulkCreate(availabilities)
          return h.response({
            responseData:{
              result
            }
          })
        }
      }
      if(request.payload.type=='shops')
      {
        if (request.payload.Availability) {
          const newDate = new Date();
          const formatDate = moment(newDate).format("MM-DD-YYYY");
          var availabilities = [];
          for(var i=0; i<request.payload.Availability.length; i++){
              const startTime = moment(`${formatDate} ${request.payload.Availability[i].startTime}`).format('HH:mm:ss')
              const endTime = moment(`${formatDate} ${request.payload.Availability[i].endTime}`).format('HH:mm:ss');
              availabilities.push({
                salon_id:request.payload.id,
                days:request.payload.Availability[i].days,
                startTime: startTime,
                endTime: endTime,
              }) 
          } 
          if(request.payload.id)
          {
            const already = await db.salonAvailability.findAll({where:{salon_id:request.payload.id}});
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.salonAvailability.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          const result = await db.salonAvailability.bulkCreate(availabilities)
          return h.response({
            responseData:{
              result
            }
          })
        }
      }
      if(request.payload.type=='restaurant')
      {
        if (request.payload.Availability) {
          const newDate = new Date();
          const formatDate = moment(newDate).format("MM-DD-YYYY");
          var availabilities = [];
          for(var i=0; i<request.payload.Availability.length; i++){
              const startTime = moment(`${formatDate} ${request.payload.Availability[i].startTime}`).format('HH:mm:ss')
              const endTime = moment(`${formatDate} ${request.payload.Availability[i].endTime}`).format('HH:mm:ss');
              availabilities.push({
                restaurant_id:request.payload.id,
                days:request.payload.Availability[i].days,
                startTime: startTime,
                endTime: endTime,
              }) 
          } 
          if(request.payload.id)
          {
            const already = await db.restaurantAvailability.findAll({where:{restaurant_id:request.payload.id}});
            if(already)
            {
              for(var i=0;i<already.length;i++)
              {
                const deleteData = await db.restaurantAvailability.destroy({where:{id:already[i].dataValues.id}})
              }
            }
          }
          const result = await db.restaurantAvailability.bulkCreate(availabilities)
          return h.response({
            responseData:{
              result
            }
          })
        }
      }
      }
      catch(e)
      {
        console.log('SSSSSSSSSS',e)
      }
    }
    
    getBusinessById=async(request,h)=>{
      try{
            var authToken = request.auth.credentials.userData
            if(request.query.type=='event')
            {
              var data = await db.event.findOne({
                attributes: [
                  "id",
                  "title",
                  "description",
                  "address",
                  "startDate",
                  "endDate",
                  "bookingUrl",
                  "refundTime",
                  "lat",
                  "capacity",
                  "showAddress",
                  "long",
                  "termsAndCondition",
                  "cancellationPolicy" 
                ],
                include: [
                  {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model: db.attachments,
                  },
                  {
                    
                      model:Models.eventCategory  ,
                      as:'businessCategory',
                      required:false          
                    },
                ],
                where: { id: request.params.id ,user_id:authToken.userId},
              });
            }
            if(request.query.type=='activity')
            {
              var data = await db.activity.findOne({
                attributes:[ "id","title", "address","capacity","description","capacity","lat","long","refundTime", "bookingUrl","termsAndCondition",
                "cancellationPolicy"],
                include: [
                  {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model: db.attachments,
                  },
                  {
                    
                      model:Models.activityCategory  ,
                      as:'businessCategory',
                      required:false          
                    },
                ],
                where: {
                  id: request.params.id,
                  user_id:authToken.userId
                },
              });
            }
            if(request.query.type=='club')
            {
              var data = await db.clubs.findOne({
                attributes:[ "id","title", "address","description","createdAt","lat","long","termsAndCondition","cancellationPolicy","capacity" ],
                include: [
                  {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model:db.attachments,
                  },
                  {
                      model:Models.clubCategory  ,
                      as:'businessCategory',
                      required:false          
                    },
                ],
                where: {
                  id: request.params.id,
                  user_id:authToken.userId
                },
              });
            }
            if(request.query.type=='shops')
            {
              var data = await db.salon.findOne({
                attributes:[ "id","title","showAddress", "address","description","createdAt","lat","long","serviceAvailableAtHome","serviceAvailableAtShop","termsAndCondition","cancellationPolicy" ],
                include: [
                  {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model: db.attachments,
                  },
                  {
                    
                      model:Models.salonCategory  ,
                      as:'businessCategory',
                      required:false          
                    },
                ],
                where: {
                  id: request.params.id,
                  user_id:authToken.userId
                },
              });
            }
            if(request.query.type=='restaurant')
            {
              var data = await db.restaurant.findOne({
                attributes: [
                  "id",
                  "title",
                  "address",
                  "description",
                  "rating",
                  "ratingCount",
                  "lat",
                  "long",
                  "active",
                  "mobile",
                  "isOrder",
                  "termsAndCondition",
                  "cancellationPolicy",
                  "serviceType" 
                ],
                include: [
                  {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        "id",
                        "originalName",
                        "fileName",
                      ],
                      model: db.attachments,
                  },
                  {
                    
                      model:Models.restaurantCategory  ,
                      as:'businessCategory',
                      required:false          
                    },
                ],
                where: {
                  id: request.params.id,
                  user_id:authToken.userId
                },
              });
            }

            return h.response({
              responseData:{
                  data
              }
            })

      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    vendorBusinessListing=async(req,h)=>{
      try{
            var isOrder= false 
            var authToken= req.auth.credentials.userData

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

            const query = req.query;
            const page = query.page ? query.page : 1;

            let whereEvent = {};
            whereEvent.status=[0,1,2]

            if (typeof query.title != "undefined" && query.title) {
              let append = { title: { [Op.like]: "%" + query.title + "%" }  };
              _.assign(whereEvent, append);
            } 

            if (typeof query.id != "undefined" && query.id) {
              let append = { id: { [Op.like]: "%" + query.id + "%" }  };
              _.assign(whereEvent, append);
            } 
            if (typeof query.status != "undefined" && query.status) {
              let append = { status: { [Op.like]: "%" + query.status + "%" }  };
              _.assign(whereEvent, append);
            } 

            if (typeof query.active != "undefined") {
              let append = { active:query.active};
              _.assign(whereEvent, append);
            } 


            whereEvent.user_id=authToken.userId
            
            
            
         
          if(req.query.type=='event')
          {
              var data = await db.event.findAndCountAll({
                attributes: [
                  "id",
                  "title",
                  "description",
                  "address",
                  "startDate",
                  "endDate",
                  "bookingUrl",
                  "refundTime",
                  "lat",
                  "status",
                  "long",
                  "active",
                  "capacity",
                  "termsAndCondition",
                  "cancellationPolicy" ,
                  "createdAt",
                  "showAddress"
                ],
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`attachment`.`thumbnailPath`)"
                        ),
                        "thumbnailPath",
                      ],
                      "id",
                      "originalName",
                      "fileName",
                    ],
                    model: db.attachments,
                  },
                ], 
                offset: (parseInt(page) - 1) * 10,
                distinct: true,
                order: [["createdAt", "DESC"]],
                /* order: [["id", "desc"]], */
                limit: 10,
                where:whereEvent/* {user_id:authToken.userId,status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}} */,
              });
              var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
            }

          if(req.query.type=='activity')
          {
            var data = await db.activity.findAndCountAll({
              attributes:[ "id","title", "status","active","address","description","capacity","lat","long","refundTime", "bookingUrl","termsAndCondition",
              "cancellationPolicy","createdAt"],
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: db.attachments,
                },
              ], 

              offset: (parseInt(page) - 1) * 10,
              distinct: true,
              order: [["createdAt", "DESC"]],
              limit: 10,
              where:whereEvent /* {
                user_id:authToken.userId,
                status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
              }, */
            });
            var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
          
          }
          if(req.query.type=='club')
          {
            var data = await db.clubs.findAndCountAll({
              attributes:[ "id","title", "address","active","description","createdAt","lat","long","status",],
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: db.attachments,
                },
              ], 
              offset: (parseInt(page) - 1) * 10,
              distinct: true,
              order: [["createdAt", "DESC"]],
              limit: 10,
              where:whereEvent /* {
                user_id:authToken.userId,
                status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
              }, */
            });
            var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
          }
          if(req.query.type=='shops')
          {
            var data = await db.salon.findAndCountAll({
              attributes:[ "id","title","showAddress", "address","active","description","createdAt","lat","long","status","serviceAvailableAtHome","serviceAvailableAtShop"],
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: db.attachments,
                },
              ], 
              offset: (parseInt(page) - 1) * 10,
              distinct: true,
              order: [["createdAt", "DESC"]],
              limit: 10,
              where:whereEvent /* {
                user_id:authToken.userId,
                status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
              }, */
            });
            var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
          }
          if(req.query.type=='restaurant')
          {
            var data = await db.restaurant.findAndCountAll({
              attributes: [
                "id",
                "title",
                "address",
                "description",
                "rating",
                "ratingCount",
                "lat",
                "long",
                "mobile",
                "active",
                "status",
                "isOrder",
                "serviceType"
              ],
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: db.attachments,
                },
              ], 
              offset: (parseInt(page) - 1) * 10,
              distinct: true,
               order: [["id", "desc"]], 
              limit: 10,
               where:whereEvent /* {   user_id:authToken.userId,
                status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}} */
            });
          }

          
          var adminCommission= await db.eventSetting.findOne({
            attributes:["adminCommission"]
          })

          return h.response({
            responseData:{
              data:data.rows,
              adminCommission,
              totalRecords: data.count,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 10,
              loadMoreFlag: data.rows.length < 10 ? 0 : 1,
              isOrder
            }
          })
      }
      catch(e)
      {
        console.log('sssss',e)
      }
    }

    vendorgetImageById=async(req,h)=>{
      try{
        if(req.query.type=='event')
        {
        var gallery = await db.eventGallery.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where:{event_id:req.query.id}
        })
      }
      if(req.query.type=='activity')
      {
        var gallery = await db.activityGallery.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where:{activity_id:req.query.id}
        })
      }
      if(req.query.type=='club')
      {
        var gallery = await db.clubGallery.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where:{club_id:req.query.id}
        })
      }
      if(req.query.type=='shops')
      {
        var gallery = await db.salonGallery.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where:{salon_id:req.query.id}
        })
      }
      if(req.query.type=='restaurant')
      {
        var gallery = await db.restaurantGallery.findAll({
          include: [
            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
          where:{restaurant_id:req.query.id}
        })
      }
      return h.response({
        responseData:{
          gallery
        }
      })
      }
      catch(e)
      {
          console.log('SSSSSSS',e)
      }
    }

    getactivityavailabilitybyId = async(req,h)=>{
      try{
        if(req.query.type=='activity')
        {
        const result = await db.activityAvailability.findAll({where:{activity_id:req.query.id}});
        return h.response({
          responseData:{
            result
          }
        });
      }
      if(req.query.type=='club')
      {
        const result = await db.availables.findAll({where:{availableId:req.query.id}});
        return h.response({
          responseData:{
            result
          }
        });
      }
      if(req.query.type=='shops')
      {
        const result = await db.salonAvailability.findAll({where:{salon_id:req.query.id}});
        return h.response({
          responseData:{
            result
          }
        });
      }
      if(req.query.type=='restaurant')
      {
        const result = await db.restaurantAvailability.findAll({where:{restaurant_id:req.query.id}});
        return h.response({
          responseData:{
            result
          }
        });
      }
      }
      catch(e)
      {
        console.log('SSSSSSSSSS',e)
      }
    }

    deleteBusiness=async(req,h)=>{
      try{
           var authToken=req.auth.credentials.userData
            if(req.query.type=='event')
            {
              var deleteData= await db.event.update({
                status:constant.BUSINESS_STATUS.DELETE,
              },{
                where:{id:req.query.id,user_id:authToken.userId}
              })
            }
            if(req.query.type=='activity')
            {
              var deleteData= await db.activity.update({
                status:constant.BUSINESS_STATUS.DELETE,
              },{
                where:{id:req.query.id,user_id:authToken.userId}
              })
            }
            if(req.query.type=='club')
            {
              var deleteData= await db.clubs.update({
                status:constant.BUSINESS_STATUS.DELETE,
              },{
                where:{id:req.query.id,user_id:authToken.userId}
              })
            }
            if(req.query.type=='shops')
            {
              var deleteData= await db.salon.update({
                status:constant.BUSINESS_STATUS.DELETE,
              },{
                where:{id:req.query.id,user_id:authToken.userId}
              })
            }
            if(req.query.type=='restaurant')
            {
              var deleteData= await db.restaurant.update({
                status:constant.BUSINESS_STATUS.DELETE,
              },{
                where:{id:req.query.id,user_id:authToken.userId}
              })
            }
            
            return h.response({message:"Deleted Successfully"})
      }
      catch(e)
      {
        console.log('SSSSSSSSs',e)
      }
    }

    paginate=(data,page) =>
     {
      
        var booking = data.slice((page - 1) * 20 , page*20);
    
        return booking
      }

    getBooking=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var orderData=[]
        var booking=[]
        var data
        var date =new Date();
        console.log('SSSSs',query.isBooking)

        let whereclubStatus={}
        let whereshopStatus={}
        let whererestaurantStatus={}

        let whereEvent = {};
        let whereUser={};
        let whereProfile={};
  

      
        whereclubStatus.type='pending'
        whereshopStatus.type='pending'
        whererestaurantStatus.status='pending'

       
        var filters={
          namesQuery: Sequelize.where(Sequelize.fn("concat", Sequelize.col("firstName"), " ",Sequelize.col("lastName"), ), {
            [Op.like]: query.userName,
            }),
          createdAt:{$between:[query.fromDate,query.toDate]}
        }
  
  
      /*   if (typeof query.id != "undefined" && query.id) {
          let append = { id: { [Op.like]: "%" + query.id + "%" } };
          _.assign(whereBooking, append);
        } */
         if (typeof query.userName != "undefined" && query.userName) {
          let append = { firstName: { [Op.like]: "%" + query.userName + "%" } };
          _.assign(whereProfile, append);
        }
        if (typeof query.mobile != "undefined" && query.mobile) {
          let append = { mobile: { [Op.like]: "%" + query.mobile + "%" } };
          _.assign(whereUser, append);
        }
        if (typeof query.title != "undefined" && query.title) {
          let append = { title: { [Op.like]: "%" + query.title + "%" }  };
          _.assign(whereEvent, append);
        }   
    /*     if (typeof query.paymentMode != "undefined" && query.paymentMode) {
          let append = {paymentMode: { [Op.like]: "%" + query.paymentMode + "%" } };
          _.assign(whereclubStatus, append);
        } */
        if(typeof query.fromDate!=="undefined" && query.fromDate && typeof query.toDate!=='undefined' && query.toDate)
        {
          let append = {createdAt: {[Op.between]:[query.fromDate,query.toDate]}  };
          console.log({append})
          _.assign(whereclubStatus, append);
          _.assign(whereshopStatus, append);
          _.assign(whererestaurantStatus, append);  
        }

        //sss

        if (typeof query.status != "undefined" && query.status) {
          let append = { type: { [Op.like]: "%" + query.status + "%" }  };
          _.assign(whereclubStatus, append);
          _.assign(whereshopStatus,append)
       
        } 
        if (typeof query.status != "undefined" && query.status) {
          let append = { status: { [Op.like]: "%" + query.status + "%" }  };
          _.assign(whererestaurantStatus, append);
         
       
        } 
       
        whereclubStatus.club_id=request.query.id
        whereshopStatus.salon_id=request.query.id
        whererestaurantStatus.restaurant_id=request.query.id
        
        

      if(query.type=='event' && typeof query.status == "undefined")
        {
          //get past event bookings id
          // let pastBookingIds = [];
          // var pastBookings = await db.eventBookingTimings.findAll({
          //   attributes:["booking_id",],
          //   where:{
          //     startDate: {
          //       [Op.lte]: new Date(),
          //     },
          //     status:{
          //       [Op.ne]: 'cancelled'
          //     }  
          //   }
          // })
          // console.log(pastBookings)

          // if(pastBookings && pastBookings.length){
          //   for(let i=0;i<pastBookings.length;i++)
          //   {
          //     pastBookingIds.push(pastBookings[i].dataValues.booking_id)
          //   }

          //   //cancelled past bookings
          //   await db.booking.update({
          //     status: 'cancelled'
          //   },{
          //     where:{
          //       id: {
          //         [Op.in]: pastBookingIds
          //       }
          //     }
          //   })
          //   await db.eventBookingTimings.update({
          //     status: 'CANCELLED'
          //   },{
          //     where:{
          //       booking_id: {
          //         [Op.in]: pastBookingIds
          //       }
          //     }
          //   })
          // }

        var booking = await db.booking.findAndCountAll({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.event,
            where:whereEvent 
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.eventBookingTimings,
              where:{ 
                startDate: {
                  [Op.gte]: moment().format('YYYY-MM-DD'),
                },
                // endTime: {
                //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                // }
              },
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.userBookingEventsTicket,
                  include:[
                    {
                      attributes:["ticketName","price",'originalPrice',"description"],
                      model:Models.ticket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              where:whereUser,
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                where:whereProfile
              }]
            }
          ],
          offset: (parseInt(page) - 1) * 20,
          limit: 20,
          distinct: true,
          where:{
            event_id:request.query.id,
            // status: {
            //   [Op.ne]: 'cancelled'
            // }
          } ,
          order: [["id", "DESC"]]
        });
        var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
        console.log('sss',booking)
       
      }

      if(query.type=='event' && query.status=='cancelled')
      {
        var booking = await db.booking.findAndCountAll({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.event,
            where:whereEvent 
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.eventBookingTimings,
              /* where:{status:'CANCELLED'}, */
              where:{
                /* startDate:{[Op.lt]:moment(date).format('YYYY-MM-DD')} , */
                // status:{[Op.eq]:null},
                startDate: {
                  [Op.gte]: moment().format('YYYY-MM-DD'),
                },
                endTime: {
                  [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                }
              },
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.userBookingEventsTicket,
                  include:[
                    {
                      attributes:["ticketName","price",'originalPrice',"description"],
                      model:Models.ticket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              where:whereUser,
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                where:whereProfile
              }]
            }
          ],
          offset: (parseInt(page) - 1) * 20,
          limit: 20,
          distinct: true,
          where:{event_id:request.query.id} ,
          order: [["id", "DESC"]]
        });
        var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
        
      }

      if(query.type=='activity' && typeof query.status == "undefined")
      {
        var booking = await db.activityBooking.findAndCountAll({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.activity,
             where:whereEvent 
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.activityBookingTimings,
              where:{
                /* startDate:{[Op.lt]:moment(date).format('YYYY-MM-DD')} , */
                // status:{[Op.eq]:null},
                startDate: {
                  [Op.gte]: moment().format('YYYY-MM-DD'),
                },
                // endTime: {
                //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                // }
              },
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.activityBookingTickets,
                  include:[
                    {
                      attributes:["ticketName","price",'originalPrice',"description"],
                      model:Models.activityTicket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
               where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
               where:whereProfile 
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{activity_id:request.query.id} ,
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);

          
      }

      if(query.type=='activity' && query.status=='cancelled')
      {
        var booking = await db.activityBooking.findAndCountAll({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.activity,
             where:whereEvent 
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.activityBookingTimings,
              where:{
                status:'CANCELLED',
                startDate: {
                  [Op.gte]: moment().format('YYYY-MM-DD'),
                },
                endTime: {
                  [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                }
              },
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.activityBookingTickets,
                  include:[
                    {
                      attributes:["ticketName","price",'originalPrice',"description"],
                      model:Models.activityTicket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
               where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
               where:whereProfile 
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{activity_id:request.query.id} ,
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      if(query.type=='club')
      {
        // let append = {
        //   status: {
        //     [Op.ne]: 'cancelled'
        //   }  
        // };
        // _.assign(whereclubStatus, append);

        // //cancelled booking that past
        // await db.clubBooking.update(
        //   {
        //     status: 'cancelled',
        //   },
        //   {
        //     where: {
        //       startDate: {
        //         [Op.lte]: moment().format('YYYY-MM-DD')
        //       },
        //       status: {
        //         [Op.ne]: 'cancelled'
        //       }  
        //     },
        //   }
        // );

        let append = {
          startDate: {
            [Op.gte]: moment().format('YYYY-MM-DD'),
          },
          endTime: {
            [Op.gte]: moment().format('HH:mm:ss'),
          }  
        };
        _.assign(whereclubStatus, append);

        var booking = await db.clubBooking.findAndCountAll({
          attributes:["id","totalAmount","startDate","noOfPerson","startTime","endTime","preferTime","type",'status',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.clubs,
            where:whereEvent
          },
            {
              attributes:["id",'ticketSold'], 
              model:Models.clubBookingServices,
              include:[
                {
                  model:Models.clubServices
                }
              ],
            },
            {
              attributes:["id","mobile","countryCode","country"],
              model:Models.users,
              where:whereUser,
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                where:whereProfile
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
          /*   distinct: true, */
            where:whereclubStatus,
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      if(query.type=='shops')
      {
        
        // let append = {
        //   status: {
        //     [Op.ne]: 'cancelled'
        //   }  
        // };
        // _.assign(whereshopStatus, append);

        // //cancelled booking that past
        // await db.salonBooking.update(
        //   {
        //     status: 'cancelled',
        //   },
        //   {
        //     where: {
        //       startDate: {
        //         [Op.lte]: moment().format('YYYY-MM-DD')
        //       },
        //       status: {
        //         [Op.ne]: 'cancelled'
        //       }  
        //     },
        //   }
        // );

        let append = {
          startDate: {
            [Op.gte]: moment().format('YYYY-MM-DD'),
          },
          endTime: {
            [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
          }  
        };
        _.assign(whereshopStatus, append);

        var booking = await db.salonBooking.findAndCountAll({
          attributes:["id","totalAmount","startDate","startTime","noOfPerson","endTime","preferTime","type",'status','serviceAt',"createdAt","address"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.salon,
            where:whereEvent 
          },
            {
              
              required:false,
              model:Models.salonBookingServices,
              include:[
                {
                  model:Models.salonServices
                }
              ],
             
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
               where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
               where:whereProfile 
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:whereshopStatus ,
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);

          
      }

      if(query.type=='restaurant' &&  typeof query.isBooking=='undefined')
      {
/*         var bookingData = await db.restaurantReservations.findAndCountAll({
          attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
          
          },
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
              
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                
              }]
            }
          ],
            distinct: true,
            where:{restaurant_id:request.query.id} ,
            order: [["id", "DESC"]]
          });
 */
          var order = await db.restaurantOrder.findAndCountAll({
            attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
            include:[
              {
                required:false,
                model:Models.userAddress,
                where:{isDeleted:false}
              },
              {
                attributes:["id","mobile","countryCode","country"],
                required:true,
                model:Models.users,
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                }]
              }
            ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:whererestaurantStatus,
            order: [["id", "DESC"]]
          });
          
  
          for(let i=0;i<order.rows.length;i++)
          {console.log('SSSSSSSSS',order.rows[i].dataValues)
            booking.push(JSON.parse(order.rows[i].dataValues.orderData)) 
            
           for(let j=0;j < booking.length;j++)
            {
              if(i==j){
              booking[j].status=order.rows[i].dataValues.status,
              booking[j].id=order.rows[i].dataValues.id;
              booking[j].createdAt=order.rows[i].dataValues.createdAt
              booking[j].isBooking = false
              booking[j].paymentMode=order.rows[i].dataValues.paymentMethod,
              booking[j].userAddress=order.rows[i].dataValues.userAddress
              booking[j].user=order.rows[i].dataValues.user
              }
              
            } 
            
          }

          
          var totalPages = await UniversalFunctions.getTotalPages(booking.length, 20);


          return h.response({
            responseData:{
              booking, 
              bookingType:query.type,
              totalRecords:booking.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 20,
              loadMoreFlag:booking.length <= 20 ? 0 : 1,
           }
         })
      }

      if(query.type=='restaurant' && query.isBooking==true)
      {
        
        //cancelled booking that past
        // await db.restaurantReservations.update(
        //   {
        //     status: 'cancelled',
        //   },
        //   {
        //     where: {
        //       startDate: {
        //         [Op.lte]: moment().format('YYYY-MM-DD')
        //       },
        //       status: {
        //         [Op.ne]: 'cancelled'
        //       }  
        //     },
        //   }
        // );
        
        console.log('SSSSSSSSSSSSSSSSSSSs','aagagag')
        var booking = await db.restaurantReservations.findAndCountAll({
          attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
            where:whereEvent 
          },
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
               where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                 where:whereProfile 
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{
              restaurant_id:request.query.id,
              startDate: {
                [Op.gte]: moment().format('YYYY-MM-DD'),
              },
              preferTime: {
                [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
              } 
            } ,
            order: [["id", "DESC"]]
        });

          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      if(query.type=='restaurant' && query.isBooking==false)
      {
        console.log('sss')
        var order = await db.restaurantOrder.findAndCountAll({
          attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
          include:[
            {
              required:false,
              model:Models.userAddress,
              where:{isDeleted:false}
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
               where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                where:whereProfile 
              }]
            }
          ],
          offset: (parseInt(page) - 1) * 20,
          limit: 20,
          distinct: true,
          where:whererestaurantStatus,
          order: [["id", "DESC"]]
        });

        for(let i=0;i<order.rows.length;i++)
        {
          booking.push(JSON.parse(order.rows[i].dataValues.orderData)) 
          
         for(let j=0;j < booking.length;j++)
          {
            if(i==j){
              booking[j].status=order.rows[i].dataValues.status,
              booking[j].id=order.rows[i].dataValues.id;
              booking[j].createdAt=order.rows[i].dataValues.createdAt
              booking[j].paymentMode=order.rows[i].dataValues.paymentMethod,
              booking[j].userAddress=order.rows[i].dataValues.userAddress,
              booking[j].user=order.rows[i].dataValues.user
            }
            
          } 
          
        }
        var totalPages = await UniversalFunctions.getTotalPages(order.count, 20);

        return h.response({
          responseData:{
          booking,
          totalRecords:order.count,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 20,
            loadMoreFlag: order.rows.length < 20 ? 0 : 1,
          }
        });

      }

      return h.response({
        responseData:{
        booking:booking.rows,
        bookingType:query.type,
        totalRecords:booking.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 20,
          loadMoreFlag: (booking.rows && booking.rows.length) < 20 ? 0 : 1,
        }
      });
      

      }
      catch(e)
      {
        console.log('ssssssssssss',e)
      }
    }

    getBookingById=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        /* const page = query.page ? query.page : 1; */
        var orderData=[]
        var data
     /*    console.log('SSSSs',query.isBooking)

        let whereclubStatus={}
        let whereshopStatus={}
        let whererestaurantStatus={}

      
        whereclubStatus.type='pending'
        whereshopStatus.type='pending'
        whererestaurantStatus.status='pending'

        if (typeof query.status != "undefined" && query.status) {
          let append = { type: { [Op.like]: "%" + query.status + "%" }  };
          _.assign(whereclubStatus, append);
          _.assign(whereshopStatus,append)
       
        } 
        if (typeof query.status != "undefined" && query.status) {
          let append = { status: { [Op.like]: "%" + query.status + "%" }  };
          _.assign(whererestaurantStatus, append);
         
       
        } 
       
        whereclubStatus.club_id=request.query.id
        whereshopStatus.salon_id=request.query.id
        whererestaurantStatus.restaurant_id=request.query.id */
        
        

        if(query.type=='event')
        {
        var booking = await db.booking.findOne({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.event,
          /*   where:whereEvent */
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.eventBookingTimings,
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.userBookingEventsTicket,
                  include:[
                    {
                      attributes:["ticketName","price","description","originalPrice"],
                      model:Models.ticket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                /* where:whereProfile */
              }]
            }
          ],
        /*   offset: (parseInt(page) - 1) * 10,
          limit: 20, */
          distinct: true,
          where:{id:request.query.id} ,
          order: [["id", "DESC"]]
        });
        /* var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20); */

       
      }

      if(query.type=='activity')
      {
        var booking = await db.activityBooking.findOne({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.activity,
            /* where:whereEvent */
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.activityBookingTimings,
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.activityBookingTickets,
                  include:[
                    {
                      attributes:["ticketName","price","description","originalPrice"],
                      model:Models.activityTicket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]]
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
             /*  where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
               /*  where:whereProfile */
              }]
            }
          ],
          /*   offset: (parseInt(page) - 1) * 10,
            limit: 20, */
            distinct: true,
            where:{id:request.query.id} ,
            order: [["id", "DESC"]]
          });
          /* var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20); */

          
      }

      if(query.type=='club')
      {
        var booking = await db.clubBooking.findOne({
          attributes:["id","totalAmount","startDate","noOfPerson","startTime","endTime","preferTime","type",'status',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.clubs,
          },
            {
              attributes:["id",'ticketSold'], 
              model:Models.clubBookingServices,
              include:[
                {
                  model:Models.clubServices
                }
              ],
            },
            {
              attributes:["id","mobile","countryCode","country"],
              model:Models.users,
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
              }]
            }
          ],
            /* offset: (parseInt(page) - 1) * 10,
            limit: 20, */
            distinct: true, 
            where:{id:request.query.id},
            order: [["id", "DESC"]]
          });
          /* var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20); */
      }

      if(query.type=='shops')
      {
        var booking = await db.salonBooking.findOne({
          attributes:["id","totalAmount","startDate","startTime","noOfPerson","endTime","preferTime","type",'status','serviceAt',"createdAt","address"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.salon,
           /*  where:whereEvent */
          },
            {
              
              required:false,
              model:Models.salonBookingServices,
              include:[
                {
                  model:Models.salonServices
                }
              ],
             
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
              /*   where:whereProfile */
              }]
            }
          ],
            /* offset: (parseInt(page) - 1) * 10,
            limit: 20, */
            distinct: true,
            where:{id:request.query.id },
            order: [["id", "DESC"]]
          });
         /*  var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20); */

          
      }

      if(query.type=='restaurant' )
      {
        var booking = await db.restaurantReservations.findOne({
          attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
          /*   where:whereEvent */
          },
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                /* where:whereProfile */
              }]
            }
          ],
           /*  offset: (parseInt(page) - 1) * 10,
            limit: 10, */
            distinct: true,
            where:{id:request.query.id} ,
            order: [["id", "DESC"]]
        });
        if(booking){
          booking.dataValues.isBooking = true;
        }

        /*   var order = await db.restaurantOrder.findAndCountAll({
            attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
            include:[
              {
                required:false,
                model:Models.userAddress,
                where:{isDeleted:false}
              }
            ],
             offset: (parseInt(page) - 1) * 10,
            limit: 20, 
            distinct: true,
            where:whererestaurantStatus,
            order: [["id", "DESC"]]
          });
           */
  
        /*   for(let i=0;i<order.rows.length;i++)
          {console.log('SSSSSSSSS',order.rows[i].dataValues)
            orderData.push(JSON.parse(order.rows[i].dataValues.orderData)) 
            
           for(let j=0;j < orderData.length;j++)
            {
              if(i==j){
                orderData[j].status=order.rows[i].dataValues.status,
              orderData[j].id=order.rows[i].dataValues.id;
              orderData[j].createdAt=order.rows[i].dataValues.createdAt
              orderData[j].isBooking = false
              orderData[j].userAddress=order.rows[i].dataValues.userAddress
              }
              
            } 
            
          } */

          /* data=bookingData.rows */
          
         /*  var totalPages = await UniversalFunctions.getTotalPages(data.length, 20); */

          /* let booking = await this.paginate(data,page) */

          return h.response({
            responseData:{
              booking, 
              bookingType:query.type,
              /* totalRecords:data.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 20,
              loadMoreFlag: booking.length <= 20 ? 0 : 1, */
           }
         })
      }



     

      return h.response({
        responseData:{
        booking:booking,
        bookingType:query.type,
       /*  totalRecords:booking.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 20,
          loadMoreFlag: booking.rows.length < 20 ? 0 : 1, */
        }
      });
      

      }
      catch(e)
      {
        console.log('ssssssssssss',e)
      }
    }

    getOrder=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var id=[]
        var orderData= []

        var vendorEvent = await db.restaurant.findAll({
          atrributes:["id"],
          where:{user_id:authToken.userId}
        })
        for(var i=0;i<vendorEvent.length;i++)
        {
            id.push(vendorEvent[i].dataValues.id)
        }

        var order = await db.restaurantOrder.findAndCountAll({
          attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
          offset: (parseInt(page) - 1) * 10,
          limit: 10,
          distinct: true,
          where:{id:id} ,
          order: [["id", "DESC"]]
        });

        for(let i=0;i<order.rows.length;i++)
        {
          orderData.push(JSON.parse(order.rows[i].dataValues.orderData)) 
          
         for(let j=0;j < orderData.length;j++)
          {
            if(i==j){
              orderData[j].status=order.rows[i].dataValues.status,
            orderData[j].id=order.rows[i].dataValues.id;
            orderData[j].createdAt=order.rows[i].dataValues.createdAt
            }
            
          } 
          
        }
        
        var totalPages = await UniversalFunctions.getTotalPages(order.count, 10);
        
        return h.response({
          responseData:{
          orderData,
          totalRecords:order.count,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 10,
            loadMoreFlag: order.rows.length < 10 ? 0 : 1,
          }
        });
      }
      catch(e)
      {
        console.log('SSSSSSSSS',e)
      }
    }

    getOrderById=async(request,h)=>{
      try{
        var authToken= request.auth.credentials.userData
      
        const data = await db.restaurantOrder.findOne({
          include:[
             {
              required:false,
              model:Models.userAddress,
              where:{isDeleted:false}
            }, 
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
              /*  where:whereUser,  */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
               /*  where:whereProfile  */
              }]
            }
          ],
          where:{id:request.query.id}})
        if(!data)
        {
          return h.response({message:'Order Not Found'})
        }
        console.log(data.dataValues)
        var orderData= JSON.parse(data.dataValues.orderData)

        
  /*    var address = await db.userAddress.findOne({
          attributes:["id","userLatitude","userLongitude",'address','houseNo','buildingName','other','type'],
          where:{id:data.dataValues.address_id,user_id:authToken.userId}})
          console.log(address) */
          
         orderData.userAddress=data.dataValues.userAddress 
         orderData.user=data.dataValues.user
         orderData.status=data.dataValues.status
         orderData.id=data.dataValues.id
         orderData.isBooking=false
        
        var booking={...orderData}

        return h.response({
          responseData:{
            booking,
            bookingType:'restaurant'
          },
        })
   
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    getvendorProfile=async(request,h)=>{
      try{

          var authToken = request.auth.credentials.userData
          var userProfile = await Models.userProfiles.findOne({
            where: { user_id: authToken.userId },
            attributes: [
              "user_id",
              "firstName",
              "lastName",
              "email",
              "description",
              "address",
              "referralCode",
              "isDeleted",
              "createdAt",
              "updatedAt",
              [Sequelize.col("user.mobile"), "mobile"],
              [Sequelize.col("user.countryCode"), "countryCode"],
              [Sequelize.col("user.country"), "country"],
            ],

            include: [
              {
                required: true,
                model: Models.users,
                attributes: [],
              },

              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: Models.attachments,
              },
            ],
          });

          var responseData=userProfile
  
         return h.response({
           responseData
         })

      }
      catch(e)
      {
        console.log('SSSSSS',e)
      }
    }

    businessStatus=async(request,h)=>{
      try{
           var authToken=request.auth.credentials.userData

           if(request.payload.type=='event')
           {
             var active = await db.event.update({
               active:request.payload.active
             },{
               where:{id:request.payload.id,user_id:authToken.userId}
             }) 
           }
           if(request.payload.type=='activity')
           {
             var active = await db.activity.update({
               active:request.payload.active
             },{
               where:{id:request.payload.id,user_id:authToken.userId}
             }) 
           }
           if(request.payload.type=='shops')
           {
             var active = await db.salon.update({
               active:request.payload.active
             },{
               where:{id:request.payload.id,user_id:authToken.userId}
             }) 
           }
           if(request.payload.type=='club')
           {
             var active = await db.clubs.update({
               active:request.payload.active
             },{
               where:{id:request.payload.id,user_id:authToken.userId}
             }) 
           }
           if(request.payload.type=='restaurant')
           {
             var active = await db.restaurant.update({
               active:request.payload.active
             },{
               where:{id:request.payload.id,user_id:authToken.userId}
             }) 
           }

           return h.response({message:'Successfull'}).code(200)
      }
      catch(e)
      {
        console.log('SSSSSSSSs',e)
      }
    }

    restaurantorderStatus=async(request,h)=>{ 
      try{
            var authToken=request.auth.credentials.userData
            const gateway = await new braintree.BraintreeGateway({
              environment: braintree.Environment.Sandbox,
              merchantId: "35y8p9yjr3vfh2bn",
              publicKey: "xnth54rqpr4fzgmn",
              privateKey: "d217d871d3ef2845cff15c2b0ce3b577"
            });

            if(request.payload.type=='restaurant')
            {
              var userId = await db.restaurantOrder.findOne({where:{id:request.payload.id}})
             
              if(userId.dataValues.status=='cancelled')
              {
                return h.response({message:"Already Cancelled"}).code(400)
              }

                var status = await db.restaurantOrder.update({
                  status:request.payload.status
                },{
                  where:{id:request.payload.id}
                })
              }
            
          if(request.payload.type=='shops')
          {
            var userId = await db.salonBooking.findOne({where:{id:request.payload.id}})
            if(userId.dataValues.type=='cancelled')
            {
              return h.response({message:"Already Cancelled"}).code(400)
            }
          var status = await db.salonBooking.update({
           type:request.payload.status
          },{
            where:{id:request.payload.id}
          })
        }
        
        if(request.payload.type=='club')
        {
          var userId = await db.clubBooking.findOne({where:{id:request.payload.id}})
          if(userId.dataValues.type=='cancelled')
          {
            return h.response({message:"Already Cancelled"}).code(400)
          }
          var status = await db.clubBooking.update({
          type:request.payload.status
          },{
            where:{id:request.payload.id}
          })
        }

      var Fcm =  await db.userAccesses.findAll({
        where:{user_id:userId.dataValues.user_id,fcmToken:{[Op.ne]:null}}
      })

      var m = Fcm.length - 1

      if(status)
      {
            switch (request.payload.status) {
              case 'cancelled': {
                if(request.payload.type=='restaurant')
                {
                  const amount = await db.restaurantOrder.findOne({where:{id:request.payload.id}})
                  if(!amount){
                    return h.response({message:'enter valid orderId' })
                  }
                  var amountValue = amount.dataValues.totalCost
                  
          
                 var transaction = await db.transaction.findOne({
                    attributes:["transaction_id"],
                    where:{order_id:request.payload.id,type:'restaurant'}
                  })
          
                  if(amount.dataValues.paymentMethod=="CARD")
                  {
                    if(!transaction)
                    {
                      return h.response({message:'no transaction '})
                    }
                    var refundData = await stripe.refunds.create({
                      amount:amountValue * 100,
                      charge:transaction.dataValues.transaction_id,
                    });
                    if(refundData)
                    {
                      let notificationData ={
                        title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.title.replace('{}','Restaurant'),
                        body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.body,
                        notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.type),
                        type:request.payload.type,
                        actionId:JSON.stringify(request.payload.id),
                        user_id:JSON.stringify(userId.dataValues.user_id)
                      }
      
                      if(Fcm && Fcm.length){
                        var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
                      }

                      const create = await db.notifications.create({
                        user_id:userId.dataValues.user_id,
                        title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.title.replace('{}','Restaurant'),
                        body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.body,
                        notificationType:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.type,
                        type:'restaurant',
                        order_id:request.payload.id,
                        notificationTo:constant.NOTIFICATION_TO.USER
                      })


                    }
                  }
                  if(amount.dataValues.paymentMethod=="PAYPAL")
                  {
                    var refundData = await gateway.transaction.refund(`${transaction.dataValues.transaction_id}`) 
                    console.log('refundDataPaypal',refundData)
          
                    if(refundData)
                    {
          
                      let notificationData ={
                        title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.title.replace('{}','Restaurant'),
                        body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.body,
                        notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.type),
                        type:request.payload.type,
                        actionId:request.payload.id,
                        user_id:userId.dataValues.user_id
                      }
      
                      if(Fcm && Fcm.length){
                        var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
                      }
                      
                      const create = await db.notifications.create({
                        user_id:userId.dataValues.user_id,
                        title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.title.replace('{}','Restaurant'),
                        body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.body,
                        notificationType:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_ORDER.type,
                        type:'restaurant',
                        order_id:request.payload.id,
                        notificationTo:constant.NOTIFICATION_TO.USER
                      })
                    }
                  }
         
                console.log('notofu',send)

                return h
                .response({
                  message: "CANCELLED_SUCCESSFULLY",
                })
                .code(200);
              }
              var a = request.payload.type
              var businessType =a.charAt(0).toUpperCase() + a.slice(1)
              
              let notificationData ={
                title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.title.replace('{}',businessType),
                body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.body,
                notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.type),
                type:request.payload.type,
                actionId:JSON.stringify(request.payload.id),
                user_id:JSON.stringify(userId.dataValues.user_id)
              }

              if(Fcm && Fcm.length){
                var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
              }

              const create = await db.notifications.create({
                user_id:userId.dataValues.user_id,
                title:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.title.replace('{}',businessType),
                body:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.body,
                notificationType:constant.NOTIFICATION_TYPE.VENDOR_CANCELLED_BOOKING.type,
                type:request.payload.type,
                booking_id:request.payload.id,
                notificationTo:constant.NOTIFICATION_TO.USER
              })
              

                return h
                  .response({
                    message: "CANCELLED_SUCCESSFULLY",
                  })
                  .code(200);
              }
              case 'confirmed': {
                if(request.payload.type=='restaurant')
                {
                let notificationData ={
                  title:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.title.replace('{}','Restaurant'),
                  body:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.body,
                  notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.type),
                  type:request.payload.type,
                  actionId:JSON.stringify(request.payload.id),
                  user_id:JSON.stringify(userId.dataValues.user_id)
                }

                if(Fcm && Fcm.length){
                  let send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
                }

                const create = await db.notifications.create({
                  user_id:userId.dataValues.user_id,
                  title:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.title.replace('{}','Restaurant'),
                  body:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.body,
                  notificationType:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_ORDER.type,
                  type:request.payload.type,
                  order_id:request.payload.id,
                  notificationTo:constant.NOTIFICATION_TO.USER
                })

                return h
                .response({
                  message: "CONFIRMED_SUCCESSFULLY",
                })
                .code(200);
              }
              var a = request.payload.type
              var businessType =a.charAt(0).toUpperCase() + a.slice(1)
              
              let notificationData ={
                title:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.title.replace('{}',businessType),
                body:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.body,
                notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.type),
                type:request.payload.type,
                actionId:JSON.stringify(request.payload.id),
                user_id:JSON.stringify(userId.dataValues.user_id)
              }

              if(Fcm && Fcm.length){
                var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
              }

              const create = await db.notifications.create({
                user_id:userId.dataValues.user_id,
                title:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.title.replace('{}',businessType),
                body:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.body,
                notificationType:constant.NOTIFICATION_TYPE.VENDOR_ACCEPTED_BOOKING.type,
                type:request.payload.type,
                booking_id:request.payload.id,
                notificationTo:constant.NOTIFICATION_TO.USER
              })
                return h
                  .response({
                    message: "CONFIRMED_SUCCESSFULLY",
                  })
                  .code(200);
              }
              case 'delivered':{

                let notificationData ={
                  title:constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.title.replace('{}','Restaurant'),
                  body:constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.body,
                  notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.type),
                  type:request.payload.type,
                  actionId:JSON.stringify(request.payload.id),
                  user_id:JSON.stringify(userId.dataValues.user_id)
                }

                if(Fcm && Fcm.length){
                  var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
                }

                const create = await db.notifications.create({
                  user_id:userId.dataValues.user_id,
                  title:constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.title.replace('{}','Restaurant'),
                  body:constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.body,
                  notificationType:constant.NOTIFICATION_TYPE.VENDOR_DELIVERED_ORDER.type,
                  type:request.payload.type,
                  order_id:request.payload.id,
                  notificationTo:constant.NOTIFICATION_TO.USER
                })

                return h
                .response({
                  message: "DELIVERED_SUCCESSFULLY",
                })
                .code(200);
              }
            }
          }

      }
      catch(e)
      {
        console.log('sssss',e)
      }
    }

    vendorallBusiness=async(request,h)=>{
      try{
        var authToken= request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var data=[]
        var shopData=[]
        var isSubscription
        var isExpiry=false
        var event = await db.event.findAndCountAll({
          attributes: [
            "id",
            "title",
            "type"
          ],
         /*  offset: (parseInt(page) - 1) * 10, */ 
          distinct: true,
          order: [["createdAt", "DESC"]],
          /* order: [["id", "desc"]], */
          limit: 50,
          where: {user_id:authToken.userId,active:1,status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}},
        });
        var activity = await db.activity.findAndCountAll({
          attributes:[ "id","title", "type"],
         /*  offset: (parseInt(page) - 1) * 10, */
          distinct: true,
          order: [["createdAt", "DESC"]],
          limit: 50,
          where: {
            user_id:authToken.userId,
            active:1,
            status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
          },
        });
        var club = await db.clubs.findAndCountAll({
          attributes:[ "id","title", "type"],
         /*  offset: (parseInt(page) - 1) * 10, */
          distinct: true,
          order: [["createdAt", "DESC"]],
          limit: 50,
          where: {
            user_id:authToken.userId,
            active:1,
            status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
          },
        });
        var shop = await db.salon.findAndCountAll({
          attributes:[ "id","title", "type"],
          /* offset: (parseInt(page) - 1) * 10, */
          distinct: true,
          order: [["createdAt", "DESC"]],
          limit: 50,
          where: {
            user_id:authToken.userId,
            active:1,
            status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
          },
        });
        for(var i=0;i<shop.count;i++)
        {
          shopData.push({
            id:shop.rows[i].dataValues.id,
            title:shop.rows[i].dataValues.title,
            type:'shops'
          })
        }


        var restaurant=await db.restaurant.findAndCountAll({
          attributes:["id","title","type"],
          distinct: true,
          order: [["createdAt", "DESC"]],
          limit: 50,
          where: {
            user_id:authToken.userId,
            active:1,
            status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE],
           
          }
          },
        })
        data=event.rows.concat(activity.rows).concat(club.rows).concat(shopData).concat(restaurant.rows)
        var totalPages = await UniversalFunctions.getTotalPages(data.length, 10);

        var subscription = await Models.vendorsubscriptionplanBooking.findOne({
          attributes:["id","expiryDate"],
          include:[{
            attributes:["id","title","description","duration","price"],
              model:Models.subscriptionPlan,
              required:false
          }],
          order: [["createdAt", "DESC"]],
          where:{user_id:authToken.userId,status:'success'}
        })
        
        if(subscription)
        {
        
           isSubscription = true
           var currentDate = moment(new Date()).format('YYYY-MM-DD')
           var expiryplan = moment(subscription.dataValues.expiryDate).format('YYYY-MM-DD')
           var nearDate = moment(subscription.dataValues.expiryDate).subtract(7,'d').format('YYYY-MM-DD')
           console.log('SSSSS1',currentDate,"ssssssssssd",nearDate)
           if(currentDate > nearDate)
              {
                  isExpiry=true
              }

              if(currentDate <= nearDate)
              {
                 isExpiry=false
              }
        }
        if(!subscription)
        {
          console.log('SSSSS2')
           isSubscription = false
        }

    

      

        return h.response({
          responseData:{
            data, 
            subscription,
            isSubscription,
            isExpiry
          /*   totalRecords:data.length,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 10,
            loadMoreFlag: result.length < 10 ? 0 : 1, */
         }
       })
      }
      catch(e)
      {
        console.log('ssss',e)
      }
    }

    vendorupdateProfile=async(request,h)=>{
      try{
        const payload = request.payload;
        /*   const encodedAuth = req.auth.credentials.payload.data;
              const decodedAuth =  await UniversalFunctions.decryptData(encodedAuth); */
        const authToken = request.auth.credentials.userData;
        const firstName = payload.firstName;
        const lastName = payload.lastName;
        const mobile = payload.mobile;
        const profileImage =typeof payload.profileImage_id != "undefined"? payload.profileImage_id: null;
        const countryCode= payload.countryCode;
        const country= payload.country;
        const description = payload.description
        
  
        let profile = {
          firstName: firstName,
          lastName: lastName,
          mobile: mobile,
          countryCode: countryCode,
          country : country,
          profileImage_id: profileImage,
          description: description
        };
        let checkExistProfile = await Models.userProfiles.findOne({
          where: {
            user_id: authToken.userId,
            isDeleted: 0,
          },
        });

        if (checkExistProfile && checkExistProfile.dataValues.id) {
          var updateProfile = await Models.userProfiles.update(profile, {
            where: { user_id: authToken.userId },
          });

          var updateUser= await Models.users.update(profile,{
            where:{id:authToken.userId}
          })
        } 

        var userProfile = await Models.userProfiles.findOne({
          where: { user_id: authToken.userId },
          attributes: [
            "user_id",
            "firstName",
            "lastName",
            "email",
            "description",
            "address",
            "referralCode",
            "isDeleted",
            "createdAt",
            "updatedAt",
            [Sequelize.col("user.mobile"), "mobile"],
            [Sequelize.col("user.countryCode"), "countryCode"],
            [Sequelize.col("user.country"), "country"],
          ],

          include: [
            {
              required: true,
              model: Models.users,
              attributes: [],
            },

            {
              attributes: [
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`filePath`)"
                  ),
                  "filePath",
                ],
                [
                  Sequelize.literal(
                    "CONCAT('" +
                      process.env.NODE_SERVER_API_HOST +
                      "','/',`attachment`.`thumbnailPath`)"
                  ),
                  "thumbnailPath",
                ],
                "id",
                "originalName",
                "fileName",
              ],
              model: Models.attachments,
            },
          ],
        });

        var responseData=userProfile

       return h.response({
         responseData
       })
      }
      catch(e)
      {
        console.log('SSSSSSSSSS',e)
      }
    }

    vendorChangePassword = async (req, h) => {
      try {
        const authToken = req.auth.credentials.userData;
        const payload = req.payload;
  
        if (payload.oldPassword && payload.newPassword) {
          /* let rounds = parseInt(process.env.HASH_ROUNDS); */
          let oldPassword = UniversalFunctions.encrypt(req.payload.oldPassword);
          let newPassword = UniversalFunctions.encrypt(req.payload.newPassword);
          const verificationMatch = await Models.users.findOne({
            where: {
              id: authToken.userId,
            },
          });
  
          let passwordVerification = Bcrypt.compareSync(
            payload.oldPassword,
            verificationMatch.dataValues.password
          );
         
  
          if (oldPassword!=verificationMatch.dataValues.password) {
            return Boom.badRequest(req.i18n.__("UNABLE_TO_VERIFY_OLD_PASSWORD"));
          }
  
          if (oldPassword==verificationMatch.dataValues.password) {
            var updatePassword = await Models.users.update(
              {
                password: newPassword,
              },
              { where: { id: authToken.userId } }
            );

          }
        }
        if(updatePassword)
        {
  
        return h
          .response({
            message: req.i18n.__("PASSWORD_HAS_BEEN_UPDATED_SUCCESSFULLY"),
          })
          .code(200);
        }
      } catch (e) {
        return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
      }
    };

    vendorBookingHistory=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var date =new Date();
        var booking=[]
        console.log('SSSSSSs',date)

         if(query.type=='event')
        {  
        var booking = await db.booking.findAndCountAll({
          attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
          include:[
            {
            attributes:['id','title','address'],
            required:true,
            model:Models.event,
          /*   where:whereEvent */
          },
            {
              attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
              required:true,
              model:Models.eventBookingTimings,
               where:{startDate:{[Op.lt]:moment(date).format('YYYY-MM-DD')} ,status:{[Op.is]:null} },
              include:[
                {
                  attributes:["ticketSold"],
                  model:Models.userBookingEventsTicket,
                  include:[
                    {
                      attributes:["ticketName","price","description","originalPrice"],
                      model:Models.ticket
                    }
                  ]
                }
              ],
              order: [["startDate", "ASC"]] 
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                /* where:whereProfile */
              }]
            }
          ],
          offset: (parseInt(page) - 1) * 10,
          limit: 20,
          distinct: true,
          where:{event_id:request.query.id } ,
          order:[["id", "DESC"]]
        });
         var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20) 

        } 
        
        if(query.type=='activity')
        {
          var booking = await db.activityBooking.findAndCountAll({
            attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
            include:[
              {
              attributes:['id','title','address'],
              required:true,
              model:Models.activity,
              /* where:whereEvent */
            },
              {
                attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                required:true,
                model:Models.activityBookingTimings,
                where:{startDate:{[Op.lt]:moment(date).format('YYYY-MM-DD')} , status:{[Op.is]:null} },
                include:[
                  {
                    attributes:["ticketSold"],
                    model:Models.activityBookingTickets,
                    include:[
                      {
                        attributes:["ticketName","price","description","originalPrice"],
                        model:Models.activityTicket
                      }
                    ]
                  }
                ],
                order: [["startDate", "ASC"]]
              },
              {
                attributes:["id","mobile","countryCode","country"],
                required:true,
                model:Models.users,
               /*  where:whereUser, */
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                 /*  where:whereProfile */
                }]
              }
            ],
              offset: (parseInt(page) - 1) * 10,
              limit: 20,
              distinct: true,
              where:{activity_id:request.query.id,status:{[Op.is]:null}} ,
              order: [["id", "DESC"]]
            });
            var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
        }

        if(query.type=='club')
        {
          var booking = await db.clubBooking.findAndCountAll({
            attributes:["id","totalAmount","startDate","noOfPerson","startTime","endTime","preferTime","type",'status',"createdAt"],
            include:[
              {
              attributes:['id','title','address'],
              required:false,
              model:Models.clubs,
            },
              {
                attributes:["id",'ticketSold'], 
                model:Models.clubBookingServices,
                include:[
                  {
                    model:Models.clubServices
                  }
                ],
              },
              {
                attributes:["id","mobile","countryCode","country"],
                model:Models.users,
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                }]
              }
            ],
              offset: (parseInt(page) - 1) * 10,
              limit: 20,
            /*   distinct: true, */
            where:{club_id:request.query.id,type:'confirmed'},
              order: [["id", "DESC"]]
            });
            var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
        }

        if(query.type=='shops')
        {
          var booking = await db.salonBooking.findAndCountAll({
            attributes:["id","totalAmount","startDate","startTime","noOfPerson","endTime","preferTime","type",'status','serviceAt',"createdAt","address"],
            include:[
              {
              attributes:['id','title','address'],
              required:false,
              model:Models.salon,
             /*  where:whereEvent */
            },
              {
                
                required:false,
                model:Models.salonBookingServices,
                include:[
                  {
                    model:Models.salonServices
                  }
                ],
               
              },
              {
                attributes:["id","mobile","countryCode","country"],
                required:true,
                model:Models.users,
                /* where:whereUser, */
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                /*   where:whereProfile */
                }]
              }
            ],
              offset: (parseInt(page) - 1) * 10,
              limit: 20,
              distinct: true,
              where:{salon_id:request.query.id,type:'confirmed'}, 
              order: [["id", "DESC"]]
            });
            var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
        }

        if(query.type=='restaurant')
        {
          var order = await db.restaurantOrder.findAndCountAll({
            attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData',['createdAt', 'dateComepare']],
            include:[
              {
                required:false,
                model:Models.userAddress,
                where:{isDeleted:false}
              },
              {
                attributes:["id","mobile","countryCode","country"],
                required:false,
                model:Models.users,
                /* where:whereUser, */
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                  /* where:whereProfile */
                }]
              }
            ],
            offset: (parseInt(page) - 1) * 10,
            limit: 20,
            distinct: true,
            where:{restaurant_id:request.query.id,status:'delivered'},
            order: [["id", "DESC"]]
          });
  
          for(let i=0;i<order.rows.length;i++)
          {
            booking.push(JSON.parse(order.rows[i].dataValues.orderData)) 
            
           for(let j=0;j < booking.length;j++)
            {
              if(i==j){
                booking[j].status=order.rows[i].dataValues.status,
                booking[j].id=order.rows[i].dataValues.id;
                booking[j].createdAt=order.rows[i].dataValues.createdAt
                booking[j].isBooking = false
                booking[j].paymentMode=order.rows[i].dataValues.paymentMethod,
                booking[j].userAddress=order.rows[i].dataValues.userAddress,
                booking[j].user=order.rows[i].dataValues.user
                booking[j].dateComepare=order.rows[i].dataValues.dateComepare
              }
              
            } 
            
          }
          var totalPages = await UniversalFunctions.getTotalPages(order.count, 20);

          var reservation = await db.restaurantReservations.findAndCountAll({
            attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt",['startDate', 'dateComepare']],
            include:[
              {
              attributes:['id','title','address'],
              required:false,
              model:Models.restaurant,
              // where:whereEvent 
            },
              {
                attributes:["id","mobile","countryCode","country"],
                required:false,
                model:Models.users,
                //  where:whereUser, 
                include:[{
                  attributes:["firstName","lastName","email"],
                  model:Models.userProfiles,
                  //  where:whereProfile 
                }]
              }
            ],
              offset: (parseInt(page) - 1) * 20,
              limit: 20,
              distinct: true,
              where:{
                restaurant_id:request.query.id,
                startDate: {
                  [Op.lte]: moment().format('YYYY-MM-DD'),
                },
                // preferTime: {
                //   [Op.lte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                // } 
              } ,
              order: [["id", "DESC"]]
          });
          if(reservation.count){
            for(let i=0;i < reservation.rows.length; i++){
              reservation.rows[i].dataValues.isBooking = true
              booking.push(reservation.rows[i].dataValues)
            }
          }

          booking.sort(function compare(a, b) {
            var dateA = new Date(a.dateComepare);
            var dateB = new Date(b.dateComepare);
            return dateB - dateA;
          });

          return h.response({
            responseData:{
            booking,
            bookingType:query.type,
            totalRecords:order.count,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 20,
              loadMoreFlag: order.rows.length < 20 ? 0 : 1,
            }
          });
        }

        return h.response({
          responseData:{
          booking:booking.rows,
          bookingType:query.type,
          totalRecords:booking.count,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 20,
            loadMoreFlag: booking.rows.length < 20 ? 0 : 1,
          }
        });
    }
      catch(e)
      {
        console.log('SSSSSSSSSS',e)
      }
    }

    vendorTotalEarning=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var date =new Date();
        var orderData=[]
        var id1=[]
        var id2=[]
        var id3=[]
        var currentTime;
        var startTime;
        var total1=0;
        var total2=0;
        var total3=0;
      
      

      if(query.day==1)
      {
        console.log('SSSSSSSs')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).startOf('date').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==7)
      {
        console.log('ss')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).subtract(7,'d').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==30)
      {
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm')
        startTime = moment(currentTime).subtract(30,'d').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==365)
      {
        console.log('Areeb')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).subtract(1,'y').format('YYYY-MM-DD HH:mm:ss')
      }


      console.log('SSSSSsStart',startTime,'sssseeCurr',currentTime)
   


      /*    if(query.type=='event')
        {  
           */
          var vendorEvent = await db.event.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          
          for(var i=0;i<vendorEvent.length;i++)
          {
              id1.push(vendorEvent[i].dataValues.id)
          }
          var booking = await db.booking.findAndCountAll({
            attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
            include:[
              {
                attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                required:true,
                model:Models.eventBookingTimings,
                where:{status:{[Op.is]:null},refundStatus:{[Op.is]:null} },
              },
          
            ],
            where:{createdAt:{[Op.between]:[startTime,currentTime]},event_id:id1},
            order:[["id", "DESC"]]
          });
          for(var i=0;i<booking.rows.length;i++)
          {/* 
            console.log('SSSSSSS',booking.rows[i]) */
            var total1 = total1 + booking.rows[i].dataValues.hostAmount
          }
          var bookingcancel = await db.booking.findAndCountAll({
            attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
            include:[
              {
                attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                required:true,
                model:Models.eventBookingTimings,
                where:{status:'CANCELLED'},
                order: [["startDate", "ASC"]]
              },
            ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{event_id:id1,createdAt:{[Op.between]:[startTime,currentTime]}} ,
            order: [["id", "DESC"]]
          });
         /* }  */

       /*   if(query.type=='activity')
         { */
          var vendorActivity = await db.activity.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          
          for(var i=0;i<vendorActivity.length;i++)
          {
              id2.push(vendorActivity[i].dataValues.id)
          }
          var activitybooking = await db.activityBooking.findAndCountAll({
            attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
            include:[
              {
                attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                required:true,
                model:Models.activityBookingTimings,
                where:{status:{[Op.is]:null},refundStatus:{[Op.is]:null}},
            
              },
            ],
             /*  offset: (parseInt(page) - 1) * 10,
              limit: 20,
              distinct: true, */
              where:{activity_id:id2,status:{[Op.is]:null},createdAt:{[Op.between]:[startTime,currentTime]}} ,
              order: [["id", "DESC"]]
            });

            for(var i=0;i<activitybooking.rows.length;i++)
            {
              var total2 = total2 + activitybooking.rows[i].dataValues.hostAmount
            }

            var activitybookingcancel = await db.activityBooking.findAndCountAll({
              attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
              include:[
                {
                  attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                  required:true,
                  model:Models.activityBookingTimings,
                  where:{status:'CANCELLED'},
                  order: [["startDate", "ASC"]]
                },
            
              ],
                offset: (parseInt(page) - 1) * 20,
                limit: 20,
                distinct: true,
                where:{activity_id:id2,createdAt:{[Op.between]:[startTime,currentTime]}} ,
                order: [["id", "DESC"]]
              });
         /* } */

        /*  if(query.type=='restaurant')
         { */
          var vendorRestaurant = await db.restaurant.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
         
          for(var i=0;i<vendorRestaurant.length;i++)
          {
              id3.push(vendorRestaurant[i].dataValues.id)
          }
          var order = await db.restaurantOrder.findAndCountAll({
            attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
            where:{restaurant_id:id3,status:'delivered',createdAt:{[Op.between]:[startTime,currentTime]}/* ,status:'pending' */},
            order: [["id", "DESC"]]
          });
          var orderCancel = await db.restaurantOrder.findAndCountAll({
            where:{
              restaurant_id:id3,
              createdAt:{[Op.between]:[startTime,currentTime]},
              status:'cancelled'
            }
          }
            )
  
          for(let i=0; i<order.rows.length;i++)
          {
            console.log('SSSSSSSs',order.rows[i].dataValues.totalCost)
            var total3 = total3 + order.rows[i].dataValues.totalCost
            
          }

          var total = total1 + total2 + total3

          var transactionData=[]

          var transaction1 = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
                model:Models.booking,
                required:false,
                include:[
                  {
                    attributes:['id','title','address'],
                    required:true,
                    model:Models.event,
                  /*   where:whereEvent */
                  },
                    {
                      attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                      required:true,
                      model:Models.eventBookingTimings,
                      /* where:{status:{[Op.eq]:null}}, */
                      include:[
                        {
                          attributes:["ticketSold"],
                          model:Models.userBookingEventsTicket,
                          include:[
                            {
                              attributes:["ticketName","originalPrice","description"],
                              model:Models.ticket
                            }
                          ]
                        }
                      ],
                      order: [["startDate", "ASC"]]
                    },
                    {
                      attributes:["id","mobile","countryCode","country"],
                      required:true,
                      model:Models.users,
                      /* where:whereUser, */
                      include:[{
                        attributes:["firstName","lastName","email"],
                        model:Models.userProfiles,
                        /* where:whereProfile */
                      }]
                    }
                ]
              }
            ],
            limit:5,
            where:{business_id:id1,type:'event',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

          var transaction2 = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
                model:Models.activityBooking,
                required:false,
                include:[
                  {
                  attributes:['id','title','address'],
                  required:true,
                  model:Models.activity,
                  /* where:whereEvent */
                },
                  {
                    attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                    required:true,
                    model:Models.activityBookingTimings,
                    /* where:{status:{[Op.eq]:null}}, */
                    include:[
                      {
                        attributes:["ticketSold"],
                        model:Models.activityBookingTickets,
                        include:[
                          {
                            attributes:["ticketName","originalPrice","description"],
                            model:Models.activityTicket
                          }
                        ]
                      }
                    ],
                    order: [["startDate", "ASC"]]
                  },
                  {
                    attributes:["id","mobile","countryCode","country"],
                    required:true,
                    model:Models.users,
                   /*  where:whereUser, */
                    include:[{
                      attributes:["firstName","lastName","email"],
                      model:Models.userProfiles,
                     /*  where:whereProfile */
                    }]
                  }
                ],
              }
            ],
            limit:5,
            where:{business_id:id2,type:'activity',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

          var transaction3 = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
                model:Models.restaurantOrder,
                required:true,
                where:{status:'delivered'},
                include:[
                  {
                    required:false,
                    model:Models.userAddress,
                    where:{isDeleted:false}
                  },
                  {
                    attributes:["id","mobile","countryCode","country"],
                    required:false,
                    model:Models.users,
                     /* where:whereUser,  */
                    include:[{
                      attributes:["firstName","lastName","email"],
                      model:Models.userProfiles,
                      /* where:whereProfile  */
                    }]
                  }
                ],
              }
            ],
            limit:5,
            where:{business_id:id3,type:'restaurant',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

          for(let i=0;i<transaction3.rows.length;i++)
          {
            console.log('TTTTTTTTTTT', transaction3.rows[i].dataValues.restaurantOrder.dataValues)
            var data ={}
            /* var userAddress = transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.userAddress  */
            var data =JSON.parse(transaction3.rows[i].dataValues.restaurantOrder && transaction3.rows[i].dataValues.restaurantOrder.dataValues.orderData)
            
            orderData.push({
              id:transaction3.rows[i].dataValues.id,
              transaction_id:transaction3.rows[i].dataValues.transaction_id,
              totalAmount:transaction3.rows[i].dataValues.totalAmount,
              type:transaction3.rows[i].dataValues.type,
              status:transaction3.rows[i].dataValues.status,
              restaurantOrder:data,
              createdAt:transaction3.rows[i].dataValues.restaurantOrder && transaction3.rows[i].dataValues.restaurantOrder.dataValues.createdAt,
              order_id:transaction3.rows[i].dataValues.restaurantOrder && transaction3.rows[i].dataValues.restaurantOrder.dataValues.id,
              userAddress:transaction3.rows[i].dataValues.restaurantOrder && transaction3.rows[i].dataValues.restaurantOrder.dataValues.userAddress ,
              user:transaction3.rows[i].dataValues.restaurantOrder && transaction3.rows[i].dataValues.restaurantOrder.dataValues.user 
            })
          }


          transactionData = transaction1.rows.concat(transaction2.rows).concat(orderData)
          let result = transactionData.slice(0,5)
          

          return h.response({
            responseData:{
            totalEarning:total,
            orderCompleted:booking.count + activitybooking.count + order.count,
            orderCancelled:bookingcancel.count + activitybookingcancel.count + orderCancel.count,
            transactions:result,
            hasMore:transactionData.length > 5 ? true :false
            }
          })
         /* } */

     /*    return h.response({
          totalEarning:total,
        }) */
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    vendorTransaction=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var id=[]
        var id2=[]
        var id3=[]
        var currentTime;
        var startTime;
        var orderData=[]
        var transactionData

        if(query.day==1)
        {
          console.log('SSSSSSSs')
          currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          startTime = moment(currentTime).subtract(1,'d').format('YYYY-MM-DD HH:mm:ss')
        }
  
        if(query.day==7)
        {
          console.log('ss')
          currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          startTime = moment(currentTime).subtract(7,'d').format('YYYY-MM-DD HH:mm:ss')
        }
  
        if(query.day==30)
        {
          currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm')
          startTime = moment(currentTime).subtract(30,'d').format('YYYY-MM-DD HH:mm:ss')
        }
  
        if(query.day==365)
        {
          console.log('Areeb')
          currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          startTime = moment(currentTime).subtract(1,'y').format('YYYY-MM-DD HH:mm:ss')
        }

      
          var vendorEvent = await db.event.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorEvent.length;i++)
          {
              id.push(vendorEvent[i].dataValues.id)
          }

          var transaction1 = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
                model:Models.booking,
                required:true,
                include:[
                  {
                    attributes:['id','title','address'],
                    required:true,
                    model:Models.event,
                  /*   where:whereEvent */
                  },
                    {
                      attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                      required:true,
                      model:Models.eventBookingTimings,
                      /* where:{status:{[Op.eq]:null}}, */
                      include:[
                        {
                          attributes:["ticketSold"],
                          model:Models.userBookingEventsTicket,
                          include:[
                            {
                              attributes:["ticketName","originalPrice","description"],
                              model:Models.ticket
                            }
                          ]
                        }
                      ],
                      order: [["startDate", "ASC"]]
                    },
                    {
                      attributes:["id","mobile","countryCode","country"],
                      required:true,
                      model:Models.users,
                      /* where:whereUser, */
                      include:[{
                        attributes:["firstName","lastName","email"],
                        model:Models.userProfiles,
                        /* where:whereProfile */
                      }]
                    }
                ]
              }
            ],
            distinct:true,
            where:{business_id:id,type:'event',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

        

      

    
          var vendorActivity = await db.activity.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorActivity.length;i++)
          {
              id2.push(vendorActivity[i].dataValues.id)
          }

          var transaction2 = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
                model:Models.activityBooking,
                required:true,
                include:[
                  {
                  attributes:['id','title','address'],
                  required:true,
                  model:Models.activity,
                  /* where:whereEvent */
                },
                  {
                    attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                    required:true,
                    model:Models.activityBookingTimings,
                    /* where:{status:{[Op.eq]:null}}, */
                    include:[
                      {
                        attributes:["ticketSold"],
                        model:Models.activityBookingTickets,
                        include:[
                          {
                            attributes:["ticketName","originalPrice","description"],
                            model:Models.activityTicket
                          }
                        ]
                      }
                    ],
                    order: [["startDate", "ASC"]]
                  },
                  {
                    attributes:["id","mobile","countryCode","country"],
                    required:true,
                    model:Models.users,
                   /*  where:whereUser, */
                    include:[{
                      attributes:["firstName","lastName","email"],
                      model:Models.userProfiles,
                     /*  where:whereProfile */
                    }]
                  }
                ],
              }
            ],
            distinct:true,
            where:{business_id:id2,type:'activity',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

          

        

          var vendorRestaurant = await db.restaurant.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorRestaurant.length;i++)
          {
              id3.push(vendorRestaurant[i].dataValues.id)
          }

          var transaction = await db.transaction.findAndCountAll({
            attributes:["id","transaction_id","totalAmount","type","status"],
            include:[
              {
                attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
                model:Models.restaurantOrder,
                required:true,
                where:{status:'delivered'},

                include:[
                  {
                    required:false,
                    model:Models.userAddress,
                    where:{isDeleted:false}
                  },
                  {
                    attributes:["id","mobile","countryCode","country"],
                    required:false,
                    model:Models.users,
                    include:[{
                      attributes:["firstName","lastName","email"],
                      model:Models.userProfiles,
                    }]
                  } 
                ],
              }
            ],
            distinct:true,
            where:{business_id:id3,type:'restaurant',createdAt:{[Op.between]:[startTime,currentTime]}},
            order: [["id", "DESC"]]
          })

          
          for(let i=0;i<transaction.rows.length;i++)
          {
            var data ={}
            /* var userAddress = transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.userAddress  */
            var data =JSON.parse(transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.orderData)
            orderData.push({
              id:transaction.rows[i].dataValues.id,
              transaction_id:transaction.rows[i].dataValues.transaction_id,
              totalAmount:transaction.rows[i].dataValues.totalAmount,
              type:transaction.rows[i].dataValues.type,
              status:transaction.rows[i].dataValues.status,
              restaurantOrder:data,
              createdAt:transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.createdAt,
              order_id:transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.id,
              userAddress:transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.userAddress,
              user:transaction.rows[i].dataValues.restaurantOrder && transaction.rows[i].dataValues.restaurantOrder.dataValues.user 
            })
            
        }
        console.log('SSSSSSSSSTransaction',transaction1.count,"dddddddddddddddd",transaction2.count,orderData.length)

        transactionData = transaction1.rows.concat(transaction2.rows).concat(orderData)
        console.log('SSSSSSSSSS',transactionData)

        var totalPages = await UniversalFunctions.getTotalPages(transactionData.length, 20);

        let result = await this.paginate(transactionData,page)

        return h.response({
          responseData:{
            transaction:result,
            totalRecords:transactionData.length,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 20,
              loadMoreFlag: result.length < 20 ? 0 : 1,
            }
        })

      }
      catch(e)
      {
        console.log('ssssssssss',e)
      }
    }

    vendorGetRatingReview=async(request,h)=>{
      try{

        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var id=[]


        if(query.type=='event')
        {
            var vendorEvent = await db.event.findAll({
              attributes:["id"],
              where:{user_id:authToken.userId}
            })
            for(var i=0;i<vendorEvent.length;i++)
            {
                id.push(vendorEvent[i].dataValues.id)
            }
          var review = await db.eventRating.findAndCountAll({
            attributes:["id","review","rating","status","createdAt"],
            include:[
              {
                attributes:["id"],
                required: false,
                model: Models.users,
                include: [
                  {
                    attributes: ["firstName", "lastName"],
                    required: false,
                    model: Models.userProfiles,
                    include: [
                      {
                        attributes: [
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`filePath`)"
                            ),
                            "filePath",
                          ],
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                            ),
                            "thumbnailPath",
                          ],
                          ["id", "data"],
                          "originalName",
                          "filename",
                        ],
                        model: Models.attachments,
                      },
                    ],
                  },
                
                ],
              },
                {
                  attributes:["id"],
                  required: false,
                  model: Models.eventRatingGallery,
                  as:'reviewAttachment',
                  include: [
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        /* ["id", "data"], */
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                }
            ],  
            limit:10,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["id", "DESC"]], 
            where: {event_id:id ,booking_id:null , status:{[Op.ne]:3}},
          })

          var totalPages = await UniversalFunctions.getTotalPages(review.count, 10) 

      }

      if(query.type=='activity')
      {
          var vendorEvent = await db.activity.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorEvent.length;i++)
          {
              id.push(vendorEvent[i].dataValues.id)
          }

          var review = await db.activityRating.findAndCountAll({
            attributes:["id","review","rating","status","createdAt"],
            include:[
              {
                attributes:["id"],
                required: false,
                model: Models.users,
                include: [
                  {
                    attributes: ["firstName", "lastName"],
                    required: false,
                    model: Models.userProfiles,
                    include: [
                      {
                        attributes: [
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`filePath`)"
                            ),
                            "filePath",
                          ],
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                            ),
                            "thumbnailPath",
                          ],
                          ["id", "data"],
                          "originalName",
                          "filename",
                        ],
                        model: Models.attachments,
                      },
                    ],
                  },
                 
                ],
              },
                {
                   attributes:["id"],
                  required: false,
                  model: Models.activityRatingGallery,
                  as:'reviewAttachment',
                  include: [
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        /* ["id", "data"], */
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                }
            ],  
            limit:10,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["id", "DESC"]], 
            where: { activity_id:id,status:{[Op.ne]:3} },
          })

          var totalPages = await UniversalFunctions.getTotalPages(review.count, 10) 
         
        }

        if(query.type=='club')
      {
          var vendorEvent = await db.clubs.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorEvent.length;i++)
          {
              id.push(vendorEvent[i].dataValues.id)
          }

          var review = await db.clubRating.findAndCountAll({
            attributes:["id","review","rating","status","createdAt"],
            include:[
              {
                attributes:["id"],
                required: false,
                model: Models.users,
                include: [
                  {
                    attributes: ["firstName", "lastName"],
                    required: false,
                    model: Models.userProfiles,
                    include: [
                      {
                        attributes: [
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`filePath`)"
                            ),
                            "filePath",
                          ],
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                            ),
                            "thumbnailPath",
                          ],
                          ["id", "data"],
                          "originalName",
                          "filename",
                        ],
                        model: Models.attachments,
                      },
                    ],
                  },
                 
                ],
              },
                {
                  attributes:["id"],
                  required: false,
                  model: Models.clubRatingGallery,
                  as:'reviewAttachment',
                  include: [
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        /* ["id", "data"],  */
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                }
            ],  
            limit:10,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["id", "DESC"]], 
            where: { club_id:id , status:{[Op.ne]:3}},
          })

          var totalPages = await UniversalFunctions.getTotalPages(review.count, 10) 
        }

        if(query.type=='shops')
      {
          var vendorEvent = await db.salon.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorEvent.length;i++)
          {
              id.push(vendorEvent[i].dataValues.id)
          }

          var review = await db.salonRating.findAndCountAll({
            attributes:["id","review","rating","status","createdAt"],
            include:[
              {
                attributes:["id"],
                required: false,
                model: Models.users,
                include: [
                  {
                    attributes: ["firstName", "lastName"],
                    required: false,
                    model: Models.userProfiles,
                    include: [
                      {
                        attributes: [
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`filePath`)"
                            ),
                            "filePath",
                          ],
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                            ),
                            "thumbnailPath",
                          ],
                          ["id", "data"],
                          "originalName",
                          "filename",
                        ],
                        model: Models.attachments,
                      },
                    ],
                  },
                 
                ],
              },
                {
                   attributes:["id"],
                  required: false,
                  model: Models.salonRatingGallery,
                  as:'reviewAttachment',
                  include: [
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        /* ["id", "data"], */
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                }
            ],  
            limit:10,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["id", "DESC"]], 
            where: { salon_id:id ,status:{[Op.ne]:3}},
          })

          var totalPages = await UniversalFunctions.getTotalPages(review.count, 10) 
        }

        if(query.type=='restaurant')
      {
          var vendorEvent = await db.restaurant.findAll({
            attributes:["id"],
            where:{user_id:authToken.userId}
          })
          for(var i=0;i<vendorEvent.length;i++)
          {
              id.push(vendorEvent[i].dataValues.id)
          }
          var review = await db.restaurantRating.findAndCountAll({
            attributes:["id","review","rating","status","createdAt"],
            include:[
              {
                attributes:["id"],
                required: false,
                model: Models.users,
                include: [
                  {
                    attributes: ["firstName", "lastName"],
                    required: false,
                    model: Models.userProfiles,
                    include: [
                      {
                        attributes: [
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`filePath`)"
                            ),
                            "filePath",
                          ],
                          [
                            Sequelize.literal(
                              "CONCAT('" +
                                process.env.NODE_SERVER_API_HOST +
                                "','/',`user->userProfile->attachment`.`thumbnailPath`)"
                            ),
                            "thumbnailPath",
                          ],
                          ["id", "data"],
                          "originalName",
                          "filename",
                        ],
                        model: Models.attachments,
                      },
                    ],
                  },
                 
                ],
              },
                {
                  attributes:["id"],
                  required: false,
                  model: Models.restaurantRatingGallery,
                  as:'reviewAttachment',
                  include: [
                    {
                      attributes: [
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`filePath`)"
                          ),
                          "filePath",
                        ],
                        [
                          Sequelize.literal(
                            "CONCAT('" +
                              process.env.NODE_SERVER_API_HOST +
                              "','/',`reviewAttachment->attachment`.`thumbnailPath`)"
                          ),
                          "thumbnailPath",
                        ],
                        /* ["id", "data"],  */
                        "originalName",
                        "filename",
                      ],
                      model: Models.attachments,
                    },
                  ],
                }
            ],  
            limit:10,
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["id", "DESC"]], 
            where: { restaurant_id:id ,status:{[Op.ne]:3}},
          })

          var totalPages = await UniversalFunctions.getTotalPages(review.count, 10) 
        }

        return h.response({
          responseData:{
            review:review.rows,
            /* bookingType:query.type, */
            totalRecords:review.count,
              page: page,
              nextPage: page + 1,
              totalPages: totalPages,
              perPage: 10,
              loadMoreFlag: review.rows.length < 10 ? 0 : 1,
            }
        })

      }
      catch(e)
      {
        console.log('sssssss',e)
      }
    }

    vendormanageRating=async(request,h)=>{
      try{
            var authToken=request.auth.credentials.userData
            const payload=request.payload

            if(payload.type=='event')
            {
                var action=await db.eventRating.update({
                  status:payload.status
                },{
                  where:{id:payload.id}
                })
            }
            if(payload.type=='activity')
            {
                var action=await db.activityRating.update({
                  status:payload.status
                },{
                  where:{id:payload.id}
                })
            }
            if(payload.type=='club')
            {
                var action=await db.clubRating.update({
                  status:payload.status
                },{
                  where:{id:payload.id}
                })
            }
            if(payload.type=='shops')
            {
                var action=await db.salonRating.update({
                  status:payload.status
                },{
                  where:{id:payload.id}
                })
            }
            if(payload.type=='restaurant')
            {
                var action=await db.restaurantRating.update({
                  status:payload.status
                },{
                  where:{id:payload.id}
                })
            }

            if(action)
            {
              return h.response({message:'Successfully'})
            }
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    vendorGetSubscriptionPlan=async(request,h)=>{
      try{
            var authToken = request.auth.credentials.userData

            var plans = await db.subscriptionPlan.findAll({
              where:{isDeleted:false}
            })

            if(!plans)
            {
              return h.response({message:'No plans found'})
            }

            var subscription = await Models.vendorsubscriptionplanBooking.findOne({
              attributes:["id","expiryDate"],
              include:[{
                attributes:["id","title","description","duration","price"],
                  model:Models.subscriptionPlan,
                  required:false
              }],
              order: [["createdAt", "DESC"]],
              where:{user_id:authToken.userId,status:'success'}
            })

            return h.response({
              responseData:{
                plans,
                subscription
              }
            })
      }
      catch(e)
      {
        console.log('SSSSSSSSs',e)
      }
    }

    vendorGetAmenitiesAttachment=async(request,h)=>{
      try{
            var images = await db.businessamenitiesImages.findAll({
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
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
            })

            return h.response({
              responseData:{
                images
              }
            })
      }
      catch(e)
      {
        console.log('SSSSSSSSs',e)
      }
    }

    vendorPurchaseSubscription=async(request,h)=>{
      try{
        var authToken = request.auth.credentials.userData
        var stripeCustomerId=null;
        var token=null;

        if(request.payload.cardId){
          const check = await db.userCardDetail.findOne({
            where:{id:request.payload.cardId,user_id:authToken.userId}
          })
          if(!check){
            return h.response({message:"Enter Valid CardID"}).code(400)
          }
          stripeCustomerId=check.dataValues.stripCustomerId
          token=check.dataValues.token
        }

        if(request.payload.subscriptionPlan_id)
        {
          var plan = await db.subscriptionPlan.findOne({
            where:{id:request.payload.subscriptionPlan_id}
          })

          if(plan.dataValues.duration)
          {
          var currentTime=moment(new Date()).format('YYYY-MM-DD HH:mm')
          var expiryDate = moment(currentTime).add(plan.dataValues.duration,'d').format('YYYY-MM-DD HH:mm:ss')
          }

          console.log('SSSSSSSS',expiryDate)
        }

        var previousPlan = await db.vendorsubscriptionplanBooking.findOne({
          where:{user_id:authToken.userId,status:'success'},
          order: [["createdAt", "DESC"]],
        })

        if(previousPlan)
        {
            var time=moment(new Date()).format('YYYY-MM-DD')
            var previousPlanExpiryDate = moment(previousPlan.dataValues.expiryDate).format('YYYY-MM-DD')

           var day= moment(previousPlanExpiryDate).diff(moment(time),'d');
           console.log(day)
           if(day >0)
           {
             var expiryDate = moment(expiryDate).add(day,'d').format('YYYY-MM-DD HH:mm:ss')
           }
        }

        
      const addbook = await db.vendorsubscriptionplanBooking.create({
        user_id:authToken.userId,
        subscriptionPlan_id:request.payload.subscriptionPlan_id,
        totalAmount: plan.dataValues.price,
        expiryDate:expiryDate,
        status:'pending',
        isDeleted:false,
      }); 


       if(stripeCustomerId!==null )
            {
            var stripeChargeParam = {
                amount: Math.floor(plan.dataValues.price * 100),
                currency: 'usd',
                description : 'Purchasing Subscription',
                payment_method_types: ["card"],
                customer:stripeCustomerId,
                payment_method:token,
                metadata:{
                  userId:authToken.userId,
                  planId:request.payload.subscriptionPlan_id,
                  type:'subscription',
                  amount:plan.dataValues.price,
                  expiryDate:expiryDate,
                  subscriptionbookingId:addbook.dataValues.id
                }
              }
            }
            else{
            var stripeChargeParam = {
              amount:Math.floor(plan.dataValues.price * 100),
              currency: 'usd',
              description : 'Purchasing Subscription',
              payment_method_types: ["card"],
              metadata:{
                userId:authToken.userId,
                planId:request.payload.subscriptionPlan_id,
                type:'subscription',
                amount:plan.dataValues.price,
                expiryDate:expiryDate,
                subscriptionbookingId:addbook.dataValues.id
              }
            }
          }

          var payement= await stripe.paymentIntents.create(stripeChargeParam) 
          
          return h.response({
            responseData: {
               paymentIntent:payement, 
              bookingId:addbook.dataValues.id
            },
          });
      }
      catch(e)
      {
        console.log('SSSSSSSSS',e)
      }
    }

    vendorForgetPassword=async(request,h)=>{
      try{


            var verifyEmail = await db.users.findOne({where:{email:request.payload.email}})

            if(!verifyEmail)
            {
              return h.response({message:'Email Does not Exist'}).code(400)
            }

           var verificationCode = Math.floor(1000 + Math.random() * 9000)
          
           let Contentdata={
            otp:verificationCode
           }
           
           let completeHtml = handlebars.compile(forgetPasswordTemplate.forgetPassword)(Contentdata) 
           console.log('ssss',completeHtml)
          
             let templateData={
              content:completeHtml,
              type:'Forget Password'
            }
         
            
            var htmlToSend = handlebars.compile(emailTemplate.header)(templateData)
            let sendEmail = await sendEmailReceipt.sendEmail(constant.EMAIL_FROM.FROM,request.payload.email,'Reset Password',htmlToSend)
             console.log('ssendEmail',sendEmail)

             const otp = await db.users.update({
               resetpasswordOtp:Contentdata.otp
             },{
               where:{id:verifyEmail.dataValues.id}
             })  

             return h.response({message:'Email sent'})


      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    vendorVerifyResetPasswordOtp=async(request,h)=>{
      try{
        var verifyEmail = await db.users.findOne({where:{email:request.payload.email}})

        console.log('SSSSSSSS',verifyEmail)
        if(!verifyEmail)
        {
          return h.response({message:'Email Does not Exist'}).code(400)
        }

        if(request.payload.otp == verifyEmail.dataValues.resetpasswordOtp)
        {
          return h.response({message:'Otp verify'})
        }

        return h.response({message:'Invalid Otp'}).code(400)

      }
      catch(e)
      {
        console.log('SSSSSSss',e)
      }
    }

    vendorResetPassword = async(request,h)=>{
    try{
          const otp = await db.users.findOne({where:{resetpasswordOtp:request.payload.otp}})

          if(otp)
          {
            var pass = UniversalFunctions.encrypt(request.payload.newPassword)
            var password = await db.users.update({
              password:pass
            },{
              where:{id:otp.dataValues.id}
            })
            if(password)
            {
              return h.response({message:'Password Changed Successfully'})
            }
          }

          return h.response({message:'Enter Valid Otp'}).code(400)


    }
    catch(e)
    {
      console.log('SSSSS',e)
    }
  }

    vendorPendingOrderCount=async(request,h)=>{
      try{
          var authToken=request.auth.credentials.userData
          var id=[]
          var id1=[]
          var id2=[]

          var club = await db.clubs.findAll({where:{user_id:authToken.userId}})
          for(var i=0;i<club.length;i++)
          {
              id.push(club[i].dataValues.id)
          }

          var shop = await db.salon.findAll({where:{user_id:authToken.userId}})
          for(var i=0;i<shop.length;i++)
          {
              id1.push(shop[i].dataValues.id)
          }

          var restaurant = await db.restaurant.findAll({where:{user_id:authToken.userId}})
          for(var i=0;i<restaurant.length;i++)
          {
              id2.push(restaurant[i].dataValues.id)
          }

          var clubBooking = await db.clubBooking.findAndCountAll({
            attributes:["id","totalAmount","startDate","noOfPerson","startTime","endTime","preferTime","type",'status',"createdAt"],
            distinct:true,
            where:{
              club_id:id,type:'pending',
              startDate: {
                [Op.gte]: moment().format('YYYY-MM-DD'),
              },
              // preferTime: {
              //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
              // } 
            }
            });

            var shopbooking = await db.salonBooking.findAndCountAll({
              attributes:["id","totalAmount","startDate","startTime","noOfPerson","endTime","preferTime","type",'status','serviceAt',"createdAt","address"],
              distinct: true,
              where:{
                salon_id:id1 ,type:'pending',
                startDate: {
                  [Op.gte]: moment().format('YYYY-MM-DD'),
                },
                // preferTime: {
                //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                // } 
              } 
              });

              var order = await db.restaurantOrder.findAndCountAll({
                attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
                distinct: true,
                where:{restaurant_id:id2 ,status:'pending'},
              });

              var restaurantReservations = await db.restaurantReservations.findAndCountAll({
                attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt"],
                distinct: true,
                where:{
                  restaurant_id:id2,
                  startDate: {
                    [Op.gte]: moment().format('YYYY-MM-DD'),
                  },
                  preferTime: {
                    [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
                  } 
                },
              });

              var totalpending = clubBooking.count + shopbooking.count + order.count + restaurantReservations.count

              return h.response({
                responseData:{
                  totalpending,
                  shopCount:shopbooking.count,
                  clubCount:clubBooking.count,
                  restaurantCount:order.count,
                  restaurantReservationCount: restaurantReservations.count
                }
              })


      }
      catch(e)
      {
        console.log('SSSSSSSSSs',e)
      }
    }

    vendorBookingByType=async(request,h)=>{
      try{
        var authToken=request.auth.credentials.userData
        const query = request.query;
        const page = query.page ? query.page : 1;
        var id=[]
        var id1=[]
        var id2=[]
        var orderData=[]

        if(request.query.type=='club')
        {
        var club = await db.clubs.findAll({where:{user_id:authToken.userId}})
        for(var i=0;i<club.length;i++)
        {
            id.push(club[i].dataValues.id)
        }

        var booking = await db.clubBooking.findAndCountAll({
          attributes:["id","totalAmount","startDate","noOfPerson","startTime","endTime","preferTime","type",'status',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.clubs,
          },
            {
              attributes:["id",'ticketSold'], 
              model:Models.clubBookingServices,
              include:[
                {
                  model:Models.clubServices
                }
              ],
            },
            {
              attributes:["id","mobile","countryCode","country"],
              model:Models.users,
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
          /*   distinct: true, */
            where:{
              club_id:id ,type:'pending',
              startDate: {
                [Op.gte]: moment().format('YYYY-MM-DD'),
              },
              // preferTime: {
              //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
              // } 
            },
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      if(request.query.type=='shops')
      {

        var shop = await db.salon.findAll({where:{user_id:authToken.userId}})
        for(var i=0;i<shop.length;i++)
        {
            id1.push(shop[i].dataValues.id)
        }

        var booking = await db.salonBooking.findAndCountAll({
          attributes:["id","totalAmount","startDate","startTime","noOfPerson","endTime","preferTime","type",'status','serviceAt',"createdAt","address"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.salon,
          /*  where:whereEvent */
          },
            {
              
              required:false,
              model:Models.salonBookingServices,
              include:[
                {
                  model:Models.salonServices
                }
              ],
            
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
              /*   where:whereProfile */
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{
              salon_id:id1,type:'pending',
              startDate: {
                [Op.gte]: moment().format('YYYY-MM-DD'),
              },
              // preferTime: {
              //   [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
              // } 
            } ,
            order: [["id", "DESC"]]
          });
          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      if(request.query.type=='restaurant' && query.isBooking==false)
      {
        var restaurant = await db.restaurant.findAll({where:{user_id:authToken.userId}})
        for(var i=0;i<restaurant.length;i++)
        {
            id2.push(restaurant[i].dataValues.id)
        }
        
        var booking = await db.restaurantOrder.findAndCountAll({
          attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
          include:[
            {
              required:false,
              model:Models.userAddress,
              where:{isDeleted:false}
            },
            {
              attributes:["id","mobile","countryCode","country"],
              required:true,
              model:Models.users,
              /* where:whereUser, */
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
              /*   where:whereProfile */
              }]
            }
          ],
          offset: (parseInt(page) - 1) * 20,
          limit: 20,
          distinct: true,
          where:{
            restaurant_id:id2,status:'pending'
          },
          order: [["id", "DESC"]]
        });
        

        for(let i=0;i<booking.rows.length;i++)
        {
          console.log('SSSSSSSSS',booking.rows[i].dataValues)
          orderData.push(JSON.parse(booking.rows[i].dataValues.orderData)) 
          
        for(let j=0;j < orderData.length;j++)
          {
            if(i==j){
              orderData[j].status=booking.rows[i].dataValues.status,
            orderData[j].id=booking.rows[i].dataValues.id;
            orderData[j].createdAt=booking.rows[i].dataValues.createdAt
            orderData[j].isBooking = false
            orderData[j].paymentMode=booking.rows[i].dataValues.paymentMethod,
            orderData[j].userAddress=booking.rows[i].dataValues.userAddress
            orderData[j].user=booking.rows[i].dataValues.user
            }
            
          } 
          
        }

        var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);

        return h.response({
          responseData:{
          booking:orderData,
          bookingType:query.type,
          totalRecords:booking.count,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 20,
            loadMoreFlag: booking.rows.length < 20 ? 0 : 1,
          }
        });

      }
      if(query.type=='restaurant' && query.isBooking==true)
      {
        
        //cancelled booking that past
        // await db.restaurantReservations.update(
        //   {
        //     status: 'cancelled',
        //   },
        //   {
        //     where: {
        //       startDate: {
        //         [Op.lte]: moment().format('YYYY-MM-DD')
        //       },
        //       status: {
        //         [Op.ne]: 'cancelled'
        //       }  
        //     },
        //   }
        // );

        var restaurant = await db.restaurant.findAll({where:{user_id:authToken.userId}})
        for(var i=0;i<restaurant.length;i++)
        {
            id2.push(restaurant[i].dataValues.id)
        }
        
        console.log('SSSSSSSSSSSSSSSSSSSs','aagagag')
        var booking = await db.restaurantReservations.findAndCountAll({
          attributes:["id","startDate","startTime","endTime","noOfPerson","preferTime","specialRequest",'firstName','lastName','email','phoneNumber','countryCode',"createdAt"],
          include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
            // where:whereEvent 
          },
            {
              attributes:["id","mobile","countryCode","country"],
              required:false,
              model:Models.users,
              //  where:whereUser, 
              include:[{
                attributes:["firstName","lastName","email"],
                model:Models.userProfiles,
                //  where:whereProfile 
              }]
            }
          ],
            offset: (parseInt(page) - 1) * 20,
            limit: 20,
            distinct: true,
            where:{
              restaurant_id:id2,
              startDate: {
                [Op.gte]: moment().format('YYYY-MM-DD'),
              },
              preferTime: {
                [Op.gte]: moment().utcOffset("+05:30").format('HH:mm:ss'),
              } 
            } ,
            order: [["id", "DESC"]]
          });

          var totalPages = await UniversalFunctions.getTotalPages(booking.count, 20);
      }

      return h.response({
        responseData:{
        booking:booking.rows,
        bookingType:query.type,
        totalRecords:booking.count,
          page: page,
          nextPage: page + 1,
          totalPages: totalPages,
          perPage: 20,
          loadMoreFlag: booking.rows.length < 20 ? 0 : 1,
        }
      });

      }
      catch(e)
      {
          console.log('SSSSSSSs',e)
      }
    }

    vendorDashboardPanel =async(request,h)=>{
      try{
        var authToken = request.auth.credentials.userData
        const query = request.query;
        var eventData=[]
        var activityData=[]
        var restaurantData=[]
        var currentTime;
        var startTime;
        var total1=0;
        var total2=0;
        var total3=0;
      
      

      if(query.day==1)
      {
        console.log('SSSSSSSs')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).subtract(1,'d').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==7)
      {
        console.log('ss')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).subtract(7,'d').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==30)
      {
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm')
        startTime = moment(currentTime).subtract(30,'d').format('YYYY-MM-DD HH:mm:ss')
      }

      if(query.day==365)
      {
        console.log('Areeb')
        currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        startTime = moment(currentTime).subtract(1,'y').format('YYYY-MM-DD HH:mm:ss')
      }

  
          //event
          var vendorEvent = await db.event.findAll({
            attributes:["id","title","description","type","address","category_id"],
            include:[
              {
                      
                model:Models.eventCategory  ,
                as:'businessCategory',
                required:false          
              },
            ],
            where:{user_id:authToken.userId,status:constant.BUSINESS_STATUS.ACCEPT}
          })
          
          for(var i=0;i<vendorEvent.length;i++)
          {
              
              var booking = await db.booking.findAndCountAll({
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
                include:[
                  {
                    attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                    required:true,
                    model:Models.eventBookingTimings,
                    where:{status:{[Op.is]:null},refundStatus:{[Op.is]:null} },
                  },
              
                ],
                distinct:true,
                where:{createdAt:{[Op.between]:[startTime,currentTime]},event_id:vendorEvent[i].dataValues.id},
                order:[["id", "DESC"]]
              });
              console.log('SSSSSS',booking.count)
              var cancelBooking = await db.booking.findAndCountAll({
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","event_id"],
                include:[
                  {
                    attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                    required:true,
                    model:Models.eventBookingTimings,
                    where:{status:'CANCELLED'},
                  },
                ],
                distinct:true,
                where:{createdAt:{[Op.between]:[startTime,currentTime]},event_id:vendorEvent[i].dataValues.id},
                order:[["id", "DESC"]]
              })
            if(booking.count==0)
            {
              var total1=0
            }
            if(booking.count!==0)
            {
              for(var j=0;j<booking.rows.length;j++)
              {
                
                var total1 = total1 + booking.rows[j].dataValues.totalAmount 
            
              }  
            }
              eventData.push({
                id:vendorEvent[i].dataValues.id,
                title:vendorEvent[i].dataValues.title,
                description:vendorEvent[i].dataValues.description,
                address:vendorEvent[i].dataValues.address,
                type:vendorEvent[i].dataValues.type,
                totalEarning:total1, 
                bookingComplete:booking.count,
                bookingCancelled:cancelBooking.count,
                category:vendorEvent[i].dataValues.businessCategory
            })
      
          }
        
        //activity
          var vendorActivity = await db.activity.findAll({
            attributes:["id","title","description","type","address","category_id"],
            include:[
              {
                      
                model:Models.activityCategory  ,
                as:'businessCategory',
                required:false          
              },
            ],
            where:{user_id:authToken.userId,status:constant.BUSINESS_STATUS.ACCEPT}
          })
          
          for(var i=0;i<vendorActivity.length;i++)
          {
            
              var activitybooking = await db.activityBooking.findAndCountAll({
                attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type"],
                include:[
                  {
                    attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                    required:true,
                    model:Models.activityBookingTimings,
                    where:{status:{[Op.is]:null},refundStatus:{[Op.is]:null}},
                
                  },
                ],
                  distinct: true, 
                  where:{activity_id:vendorActivity[i].dataValues.id,status:{[Op.is]:null},createdAt:{[Op.between]:[startTime,currentTime]}} ,
                  order: [["id", "DESC"]]
                });

                var cancelactivityBooking = await db.activityBooking.findAndCountAll({
                  attributes:["id","totalAmount","createdAt","serviceTax","adminCommission","adminCommissionAmount","hostAmount",'paymentMode',"type","activity_id"],
                  include:[
                    {
                      attributes:["id","startDate","startTime","endTime","status",'ticketBooked','refundStatus'], 
                      required:true,
                      model:Models.activityBookingTimings,
                      where:{status:'CANCELLED'},
                    },
                  ],
                  distinct:true,
                  where:{createdAt:{[Op.between]:[startTime,currentTime]},activity_id:vendorActivity[i].dataValues.id},
                  order:[["id", "DESC"]]
                })

                if(activitybooking.count==0)
                {
                  var total2=0
                }

                if(activitybooking.count!==0){
                  for(var j=0;j<activitybooking.rows.length;j++)
                  {
                    var total2 = total2 + activitybooking.rows[j].dataValues.totalAmount
                  
                  } 
                }

                activityData.push({
                  id:vendorActivity[i].dataValues.id,
                  title:vendorActivity[i].dataValues.title,
                  description:vendorActivity[i].dataValues.description,
                  address:vendorActivity[i].dataValues.address,
                  type:vendorActivity[i].dataValues.type,
                  totalEarning:total2,
                  bookingComplete:activitybooking.count,
                  bookingCancelled:cancelactivityBooking.count,
                  category:vendorActivity[i].dataValues.businessCategory
              })
          }
        

        //restaurant
          var vendorRestaurant = await db.restaurant.findAll({
            attributes:["id","title","description","type","address","category_id"],
            include:[
              {
                      
                model:Models.restaurantCategory  ,
                as:'businessCategory',
                required:false          
              },
            ],
            where:{user_id:authToken.userId,status:constant.BUSINESS_STATUS.ACCEPT}
          })
        
          for(var i=0;i<vendorRestaurant.length;i++)
          {
            var order = await db.restaurantOrder.findAndCountAll({
              attributes:["id","totalCost","createdAt",'paymentMethod',"status","orderPlaced","refundStatus",'orderData'],
              distinct:true,
              where:{restaurant_id:vendorRestaurant[i].dataValues.id,status:'delivered',createdAt:{[Op.between]:[startTime,currentTime]}},
              order: [["id", "DESC"]]
            });
            var orderCancel = await db.restaurantOrder.findAndCountAll({
              distinct:true,
              where:{
                restaurant_id:vendorRestaurant[i].dataValues.id,
                createdAt:{[Op.between]:[startTime,currentTime]},
                status:'cancelled'
              }
            }
              )
            
              if(order.count==0)
              {
                var total3=0
              }
              if(order.count!==0)
              {
                for(let j=0;j<order.rows.length;j++)
                {
                  var total3 = total3 + order.rows[j].dataValues.totalCost
                }
              }
      
            
            restaurantData.push({
              id:vendorRestaurant[i].dataValues.id,
              title:vendorRestaurant[i].dataValues.title,
              description:vendorRestaurant[i].dataValues.description,
              address:vendorRestaurant[i].dataValues.address,
              type:vendorRestaurant[i].dataValues.type,
              totalEarning:total3,
              bookingComplete:order.rows.length,
              bookingCancelled:orderCancel.rows.length,
              category:vendorRestaurant[i].dataValues.businessCategory
          })
          }
        

          

          return h.response({
            responseData:{
              eventData,
              activityData,
              restaurantData
            }
          })
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

    vendorClaimBusiness = async(req,h)=>{
      try{
            const query = req.query;
            const page = query.page ? query.page : 1;

            let whereEvent = {};
            whereEvent.status=[1]

            if (typeof query.title != "undefined" && query.title) {
              let append = { title: { [Op.like]: "%" + query.title + "%" }  };
              _.assign(whereEvent, append);
            } 

            whereEvent.user_id=null


        if(req.query.type=='event')
        {
            var data = await db.event.findAndCountAll({
              attributes: [
                "id",
                "title",
                "description",
                "address",
                "startDate",
                "endDate",
                "bookingUrl",
                "refundTime",
                "lat",
                "status",
                "long",
                "active",
                "capacity",
                "termsAndCondition",
                "cancellationPolicy" ,
                "createdAt"
              ],
              include: [
                {
                  attributes: [
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`filePath`)"
                      ),
                      "filePath",
                    ],
                    [
                      Sequelize.literal(
                        "CONCAT('" +
                          process.env.NODE_SERVER_API_HOST +
                          "','/',`attachment`.`thumbnailPath`)"
                      ),
                      "thumbnailPath",
                    ],
                    "id",
                    "originalName",
                    "fileName",
                  ],
                  model: db.attachments,
                },
              ], 
              offset: (parseInt(page) - 1) * 10,
              distinct: true,
              order: [["createdAt", "DESC"]],
              /* order: [["id", "desc"]], */
              limit: 10,
              where:whereEvent/* {user_id:authToken.userId,status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}} */,
            });
            var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
          }

        if(req.query.type=='activity')
        {
          var data = await db.activity.findAndCountAll({
            attributes:[ "id","title", "status","active","address","description","capacity","lat","long","refundTime", "bookingUrl","termsAndCondition",
            "cancellationPolicy","createdAt"],
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ], 

            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["createdAt", "DESC"]],
            limit: 10,
            where:whereEvent /* {
              user_id:authToken.userId,
              status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
            }, */
          });
          var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
        
        }
        if(req.query.type=='club')
        {
          var data = await db.clubs.findAndCountAll({
            attributes:[ "id","title", "address","active","description","createdAt","lat","long","status",],
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ], 
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["createdAt", "DESC"]],
            limit: 10,
            where:whereEvent /* {
              user_id:authToken.userId,
              status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
            }, */
          });
          var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
        }
        if(req.query.type=='shops')
        {
          var data = await db.salon.findAndCountAll({
            attributes:[ "id","title", "address","active","description","createdAt","lat","long","status","serviceAvailableAtHome","serviceAvailableAtShop"],
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ], 
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            order: [["createdAt", "DESC"]],
            limit: 10,
            where:whereEvent /* {
              user_id:authToken.userId,
              status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}
            }, */
          });
          var totalPages = await UniversalFunctions.getTotalPages(data.count, 10);
        }
        if(req.query.type=='restaurant')
        {
          var data = await db.restaurant.findAndCountAll({
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
              "lat",
              "long",
              "active",
              "status",
              "isOrder",
              "serviceType"
            ],
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: db.attachments,
              },
            ], 
            offset: (parseInt(page) - 1) * 10,
            distinct: true,
            /* order: [["id", "desc"]], */
            limit: 10,
             where:whereEvent /* {   user_id:authToken.userId,
              status:{[Op.notIn]:[constant.BUSINESS_STATUS.DELETE]}} */
          });
        }

        return h.response({
          responseData:{
            data:data.rows,
            totalRecords: data.count,
            page: page,
            nextPage: page + 1,
            totalPages: totalPages,
            perPage: 10,
            loadMoreFlag: data.rows.length < 10 ? 0 : 1,
          }
        })

      }
      catch(e)
      {
        console.log('SSSSSSSSSS',e)
      }
    }

    vendorClaim = async(request,h)=>{
      try{
              var authToken = request.auth.credentials.userData
              var data = await db.businessclaimInfo.create({
                firstName:request.payload.firstName,
                lastName:request.payload.lastName,
                countryCode:request.payload.countryCode,
                email:request.payload.email,
                mobile:request.payload.mobile,
                business_id:request.payload.id,
                user_id:authToken.userId,
                type:request.payload.type,
                documentAttachment:request.payload.attachment_id,
                status:constant.CLAIM_BUSINESS.PENDING

              })

              if(data)
              {
                return h.response({
                  message:'Claim request suuccessfully sent'
                })
              }    
      }
      catch(e)
      {
        console.log('SSSSSSSS',e)
      }
    }

}


module.exports = new vendor();


