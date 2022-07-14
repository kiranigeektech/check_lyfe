const db = require("../models/index");
const stripe = require('stripe')(process.env.STRIPE_KEY);
const moment = require("moment");
const constant = require('../config/constant')
const braintree = require("braintree");
const sendNotification = require('../notifications/notifications')
const gateway =  new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "35y8p9yjr3vfh2bn",
  publicKey: "xnth54rqpr4fzgmn",
  privateKey: "d217d871d3ef2845cff15c2b0ce3b577"
});

class Restaurant {
  // Write your functions here

  addRestaurant = async (request) => {
    try {
      const data = {
        title: request.payload.title,
        address: request.payload.address,
        description: request.payload.description,
        bookmarked: false,
        type: "restaurant",
        featured: request.payload.featured,
        capacity: request.payload.capacity,
        attachment_id: request.payload.attachment_id,
        category_id: request.payload.category_id,
        restaurantgalleries: request.payload.restaurantgalleries,
        restaurantMenuCategories: request.payload.restaurantMenuCategories,
        serviceType: request.payload.serviceType
      };
      if (request.payload.restaurantAvailability) {
        const newDate = new Date();
        const formatDate = moment(newDate).format("MM-DD-YYYY");
        data.restaurantAvailabilities = [];
        for (
          var i = 0;
          i < request.payload.restaurantAvailability.length;
          i++
        ) {
          const startTime = moment(
            `${formatDate} ${request.payload.restaurantAvailability[i].startTime}`
          ).format("HH:mm:ss");
          const endTime = moment(
            `${formatDate} ${request.payload.restaurantAvailability[i].endTime}`
          ).format("HH:mm:ss");
          data.restaurantAvailabilities[i] =
            request.payload.restaurantAvailability[i];
          data.restaurantAvailabilities[i].startTime = startTime;
          data.restaurantAvailabilities[i].endTime = endTime;
        }
        console.log("sssssssssss", data.restaurantAvailabilities);
      }
      const result = await db.restaurant.create(data, {
        include: [
          {
            model: db.restaurantAvailability,
          },
          {
            model: db.attachments,
          },
          {
            model: db.restaurantMenuCategory,
            include: [{ model: db.restaurantMenuCategoryItem }],
          },
        ],
      });

      let uniqueAminites = [];
      var checkAlreadyExist;
      var finalData = [];
      var alreadyExistData = [];
      if (request.payload.amenities) {
        for (let i = 0; i < request.payload.amenities.length; i++) {
          checkAlreadyExist = await db.restaurantAmenities.findOne({
            where: {
              amenitiesItem: request.payload.amenities[i].amenitiesItem,
            },
          });
          if (checkAlreadyExist /* [0] */) {
            alreadyExistData.push(checkAlreadyExist /* [0] */);
            finalData.push(checkAlreadyExist.dataValues.id);
          }
          if (!checkAlreadyExist /* [0] */) {
            uniqueAminites.push({
              amenitiesItem: request.payload.amenities[i].amenitiesItem,
              attachment_id: request.payload.amenities[i].attachment_id,
            });
          }
        }

        const adddata = await db.restaurantAmenities.bulkCreate(uniqueAminites);
        for (var i = 0; i < adddata.length; i++) {
          finalData.push(adddata[i].dataValues.id);
        }
        result.setAminitiesLists(finalData);
      }

      let restaurantGallaries = [];
      for (let i = 0; i < request.payload.restaurantgalleries.length; i++) {
        let obj = {
          restaurant_id: result.dataValues.id,
          attachment_id: request.payload.restaurantgalleries[i],
        };
        restaurantGallaries.push(obj);
      }
      await db.restaurantGallery.bulkCreate(restaurantGallaries);
      return result;
    } catch (e) {
      console.log("______err", e);
      return e;
    }
  };

  getMenu = async (request, h) => {
    try {
      const data = await db.restaurant.findOne({
        where: { id: request.query.id },
      });
      if (!data) {
        return h.response({ message: "Enter Valid id" });
      }
      var restaurant=await db.restaurant.findOne({
        attributes:["id","title","address"],
        where:{id:request.query.id}})
      var menu = await db.restaurantMenuCategory.findAll({
        attributes: ["id", "name"],
        include: [
          {
            attributes: ["id", "itemName", "itemDescription", "price","isVeg","maxLimit","minLimit"],
            model: db.restaurantMenuCategoryItem,
            include: [
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`restaurantMenuCategoryItems->attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`restaurantMenuCategoryItems->attachment`.`thumbnailPath`)"
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
            where:{isDeleted:false,isActive:true}
          },
        ],
        where: { restaurant_id: request.query.id ,isDeleted:false},
      });
      let menuData = [];
      var menuid;
      for (let i = 0; i < menu.length; i++) {
        menuData.push({
          id: menu[i].dataValues.id,
          name: menu[i].dataValues.name,
          itemCount: menu[i].dataValues.restaurantMenuCategoryItems.length,
          menuItem: menu[i].dataValues.restaurantMenuCategoryItems,
        });
       
      }
    let recommendedData;
      const recommended = await db.restaurantMenuCategoryItem.findAll({
        attributes: ["id", "itemName", "itemDescription", "price","isVeg","maxLimit","minLimit"],
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
            model: Models.attachments,
          },
        ],

        where: {
          isRecommended: true,
           restaurant_id:request.query.id 
        },
      });
     recommendedData={
        name: "Recommended",
        itemCount: recommended.length,
        menuItem: recommended,
      }; 

      return h.response({
        responseData: {
          restaurant,
          menu: menuData,
          recommended:recommendedData.length!==0 ? recommendedData : null 
        },
      });
    } catch (e) {
      console.log("SSSSSSSSSSSSS", e);
    }
  };

  addMenuCategory = async (request, h) => {
    try {
      var menu=[]
      var authToken=request.auth.credentials.userData ;
      const restaurant = await db.restaurant.findOne({
        where: { id: request.payload.restaurantId , user_id:authToken.userId },
      });
      if (!restaurant) {
        return h.response({ message: "Enter Valid Id" });
      }

      for(let i=0;i< request.payload.name.length;i++)
      {
        menu.push({
          restaurant_id: request.payload.restaurantId,
          name:request.payload.name[i]
        })
      }
      const add = await db.restaurantMenuCategory.bulkCreate(menu);
      return add
    } catch (e) {
      console.log("ssssssssssssss", e);
    }
  };

  getMenuCategory=async(request,h)=>{
    try{
        var authToken=request.auth.credentials.userData

        var menuCategeory = await db.restaurantMenuCategory.findAndCountAll({
          where:{restaurant_id:request.query.id,isDeleted:false}
        })
        if(!menuCategeory)
        {
          return h.response({message:'enter valid restaurant'}).code(400)
        }

        return h.response({
          responseData:{
            menuCategory:menuCategeory.rows
          }
        })
    }
    catch(e)
    {
      console.log('SSSSSSS',e)
    }
  }

  editMenuCategory=async(request,h)=>{
    try{
      var authToken;
   /*    const restaurant = await db.restaurantMenuCategory.findOne({
        where: { restaurant_id:request.payload.restaurantId },
      });
      if (!restaurant) {
        return h.response({ message: "Enter Valid restaurantId" });
      } */
      const edit = await db.restaurantMenuCategory.update({
        name:request.payload.name
      },{
        where:{/* restaurant_id:request.payload.restaurantId, */id:request.params.id}
      })

      return h.response({message:'Edit Successfully'}).code(200)
    }
    catch(e)
    {

    }
  }

  deleteMenuCategory=async(request,h)=>{
    try{
        var authToken
        const edit = await db.restaurantMenuCategory.update({
          isDeleted:request.payload.isDeleted
        },{
          where:{id:request.payload.id}
        })
        if(edit)
        {
        return h.response({message:'Delete Successfully'}).code(200)
        }

    }
    catch(e)
    {
      console.log('sss',e)
    }
  }

  addMenuCategoryItem = async(request,h)=>{
    try{
      var items=[]
      var authToken=request.auth.credentials.userData ;
      const restaurant = await db.restaurant.findOne({
        where: { id: request.payload.restaurant_id , user_id:authToken.userId },
      });
      if (!restaurant) {
        return h.response({ message: "Enter Valid Id" });
      }

      for(let i=0;i< request.payload.items.length;i++)
      {
        items.push({
            restaurant_id: request.payload.restaurant_id,
            menuCategory_id:request.payload.menuCategory_id,
            price:request.payload.items[i].price ,
					  itemName: request.payload.items[i].itemName,
					  itemDescription:request.payload.items[i].itemDescription ,
					  attachment_id:request.payload.items[i].attachment_id,	  
					  isVeg:request.payload.items[i].isVeg,
            isRecommended:request.payload.items[i].isRecommended,
					  minLimit:request.payload.items[i].minLimit,
					  maxLimit:request.payload.items[i].maxLimit,
        })
      }
    /*   if(request.payload.restaurant_id)
      {
        var already= await db.restaurantMenuCategoryItem.findAll({
          where:{restaurant_id:request.payload.restaurant_id,menuCategory_id:request.payload.menuCategory_id}
        })
        if(already)
        {
          for(var i=0 ;i< already.length;i++)
          {
            const deleteItem = await db.restaurantMenuCategoryItem.destroy({
              where:{id:already[i].dataValues.id}
            })
          }
        }
      } */
      const add = await db.restaurantMenuCategoryItem.bulkCreate(items);
      return add
    }
    catch(e)
    {
      console.log('SSSS',e)
    }
  }

  getMenuCategoryItem = async(request,h)=>{
    try{
          var authToken=request.auth.credentials.userData

          const data = await db.restaurant.findOne({
            where: { id: request.query.id ,user_id:authToken.userId },
          });
          if (!data) {
            return h.response({ message: "Enter Valid id" });
          }

      /*     var restaurant=await db.restaurant.findOne({
            attributes:["id","title","address"],
            where:{id:request.query.id}}) */

          var menu = await db.restaurantMenuCategory.findAll({
            attributes: ["id", "name"],
            include: [
              {
                model: db.restaurantMenuCategoryItem,
                where:{isDeleted:0},
                include: [
                  {
                    attributes: [
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`restaurantMenuCategoryItems->attachment`.`filePath`)"
                        ),
                        "filePath",
                      ],
                      [
                        Sequelize.literal(
                          "CONCAT('" +
                            process.env.NODE_SERVER_API_HOST +
                            "','/',`restaurantMenuCategoryItems->attachment`.`thumbnailPath`)"
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
              },
            ],
            where: { restaurant_id: request.query.id ,isDeleted:false},
          });
          let menuData = [];
          var menuid;
          for (let i = 0; i < menu.length; i++) {
            menuData.push({
              id: menu[i].dataValues.id,
              name: menu[i].dataValues.name,
              itemCount: menu[i].dataValues.restaurantMenuCategoryItems.length,
              menuItem: menu[i].dataValues.restaurantMenuCategoryItems,
            });
           
          }
  
          return h.response({
            responseData:{
              menu: menuData,
            }
          })


    }
    catch(e)
    {
      console.log('SSSSS',e)
    }
  }

  getMenuCategoryItembyId=async(request,h)=>{
    try{
         var authToken;

          const item = await db.restaurantMenuCategoryItem.findOne({
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
                model: Models.attachments,
              },
            ],
            where:{id:request.query.id}
          })
          if(item)
          {
            return h.response({
              responseData:{
                item
              }
            })
          }
    }
    catch(e)
    {
        console.log('SSSSSSS',e)
    }
  }

  editMenuCategoryItem=async(request,h)=>{
    try{
      var authToken
      const edit = await db.restaurantMenuCategoryItem.update({
        price:request.payload.price ,
        itemName: request.payload.itemName,
        itemDescription:request.payload.itemDescription ,
        attachment_id:request.payload.attachment_id,	  
        isVeg:request.payload.isVeg,
        isRecommended:request.payload.isRecommended,
        minLimit:request.payload.minLimit,
        maxLimit:request.payload.maxLimit,
      },{
        where:{id:request.params.id}
      })

      return h.response({message:'Edit Successfully'}).code(200)
    }
    catch(e)
    {
      console.log('SSSSSSS',e)
    }
  }

  deleteMenuCategoryItem=async(request,h)=>{
    try{
      var authToken
      const edit = await db.restaurantMenuCategoryItem.update({
        isDeleted:request.payload.isDeleted
      },{
        where:{id:request.payload.id}
      })
      if(edit)
      {
      return h.response({message:'Delete Successfully'}).code(200)
      }
    }
    catch(e)
    {
      console.log('SSSSSSSS',e)
    }
  }

  changeMenuCategoryItemStatus=async(request,h)=>{
    try{
      var authToken
      const edit = await db.restaurantMenuCategoryItem.update({
        isActive:request.payload.isActive
      },{
        where:{id:request.payload.id}
      })
      if(edit)
      {
      return h.response({message:'Changes Successfully'}).code(200)
      }
    }
    catch(e)
    {
      console.log('sss',e)
    }
  }

  getCart=async(request,h)=>{
    try{
        var authToken=request.auth.credentials ? request.auth.credentials.userData :null
        var items=[];
        var itemTotalPrice=0;
        if(authToken==null)
        {
          var restaurant = await db.restaurant.findOne({
            attributes: [
              "id",
              "title",
              "address",
              "description",
              "rating",
              "ratingCount",
              "mobile",
              "lat",
              "long",
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
            where:{id:request.payload.restaurantId}
          })
          if(!restaurant)
          {
            return h.response({message:'enter valid restaurantId'}).code(400)
          }
          for(let i=0;i<request.payload.items.length;i++)
          {
            var item = await db.restaurantMenuCategoryItem.findOne({
              where:{id:request.payload.items[i].itemId}
            })
            if(!item)
            {
              return h.response({message:'No item Exist'})
            }
            console.log('SSSSSSSSS',item)
            items.push({
              /* cartItemId:itemData[i].dataValues.id */
              id:item.dataValues.id,
              price:item.dataValues.price,
              itemName:item.dataValues.itemName,
              itemDescription:item.dataValues.itemDescription,
              itemQuantity:request.payload.items[i].itemQuantity
            })
            var cost = request.payload.items[i].itemQuantity * item.dataValues.price
            itemTotalPrice =cost + itemTotalPrice
          }
          var restaurantChargesData = await db.restaurantCharges.findAll({
            where:{restaurant_id:request.payload.restaurantId}
          })
         var restaurantCharges=[];
         var totalTax = 0 
      
          for(let i=0;i<restaurantChargesData.length;i++ )
          {
               var amount =(restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice
               amount =amount.toFixed(1)
              
               totalTax = (restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice + totalTax
              restaurantCharges.push({
                taxName:restaurantChargesData[i].dataValues.taxName,
                percentage:restaurantChargesData[i].dataValues.percentage,
                amount:Number(amount)
              })  
            
          }
           var totalPrice = itemTotalPrice+totalTax
            /*   const updateAmount = await db.cart.update({
                totalCost:totalPrice
              },{
                where:{id:cartid}
              }) */

              return h.response({
                responseData:{
                  restaurant,
                  items,
                  tax:totalTax,
                  itemTotalPrice,
                  restaurantCharges,
                  totalPrice
                  
                }
              })
        }
       const user = await db.userProfiles.findOne({where:{user_id:authToken.userId}})
       var name = user.dataValues.firstName + " "+user.dataValues.lastName
       var cartid;
        var cart = await db.cart.findOne({
          where:{user_id:authToken.userId}
        })
        cartid=cart ? cart.dataValues.id :''
        if(!cart)
        {
          var add = await db.cart.create({
            name:name,
            user_id:authToken.userId
          })
         
          cartid=add.dataValues.id
        }
        var data=[]
        for(let i=0;i<request.payload.items.length;i++)
        {
          var Itemprice = await db.restaurantMenuCategoryItem.findOne({where:{id:request.payload.items[i].itemId}})
          var itemPriceTotal = request.payload.items[i].itemQuantity * Itemprice.dataValues.price
          data.push({
            cart_id:cartid,
            restaurant_id:request.payload.restaurantId,
            item_id:request.payload.items[i].itemId,
            itemQuantity:request.payload.items[i].itemQuantity,
            itemPrice:Itemprice.dataValues.price,
            cost:itemPriceTotal
          })
        }
        const cartItemExist = await db.cartItems.findAll({where:{cart_id:cartid,restaurant_id:request.payload.restaurantId}})
        if(cartItemExist)
        {
          var id=[]
          for(let i=0;i<cartItemExist.length;i++)
          {
              id.push(cartItemExist[i].dataValues.id)
          }
          const deleteEntry = await db.cartItems.destroy({
            where:{id:id}
          })
        }
        console.log('SSSSSS',data)

        var cartItem = await db.cartItems.bulkCreate(data)
        
        if(cartItem)
        {
            var restaurant = await db.restaurant.findOne({
              attributes: [
                "id",
                "title",
                "address",
                "description",
                "rating",
                "ratingCount",
                "termsAndCondition",
                "cancellationPolicy",
                "mobile",
                "lat",
                "long",
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
              where:{id:request.payload.restaurantId}
            })
            if(!restaurant)
            {
              return h.response({message:'enter valid restaurantId'}).code(400)
            }
            var itemData = await db.cartItems.findAll({
            where:{cart_id:cartid,restaurant_id:request.payload.restaurantId}})
            for(let i=0;i<itemData.length;i++)
            {
              var item = await db.restaurantMenuCategoryItem.findOne({
                where:{id:itemData[i].dataValues.item_id}
              })
              if(!item)
              {
                return h.response({message:'No item Exist'})
              }
             
              items.push({
                cartItemId:itemData[i].dataValues.id,
                id:item.dataValues.id,
                price:item.dataValues.price,
                itemName:item.dataValues.itemName,
                itemDescription:item.dataValues.itemDescription,
                maxLimit:item.dataValues.maxLimit,
                minLimit:item.dataValues.minLimit,
                itemQuantity:itemData[i].dataValues.itemQuantity
              })
              itemTotalPrice = itemData[i].dataValues.cost + itemTotalPrice
            }
            var restaurantChargesData = await db.restaurantCharges.findAll({
              where:{restaurant_id:request.payload.restaurantId}
            })
            console.log("ressssssssssssss",restaurantChargesData)
           var restaurantCharges=[];
           var totalTax = 0 
           if(restaurantChargesData.length==0)
           {
            const updateAmount = await db.cart.update({
              totalCost:itemTotalPrice
            },{
              where:{id:cartid}
            })
            return h.response({
              responseData:{
                restaurant,
                items,
                tax:0,
                itemTotalPrice,
                totalPrice:itemTotalPrice
              }
            })
           }
            for(let i=0;i<restaurantChargesData.length;i++ )
            {
                 var amount =(restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice
                 amount =amount.toFixed(1)
                
                 totalTax = (restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice + totalTax
                restaurantCharges.push({
                  taxName:restaurantChargesData[i].dataValues.taxName,
                  percentage:restaurantChargesData[i].dataValues.percentage,
                  amount:Number(amount)
                })  
              
            }
            console.log('resssssssssssssssssssssss',restaurantCharges,"ddddddddddddddddddddddd",totalTax)
             var totalPrice = itemTotalPrice+totalTax
           /*  var totalPrice =Math.floor(totalPrice) */
                const updateAmount = await db.cart.update({
                  totalCost:totalPrice
                },{
                  where:{id:cartid}
                })
         
        }

        return h.response({
          responseData:{
            restaurant,
            items,
            restaurantCharges,
            tax:totalTax,
            itemTotalPrice,
            totalPrice
            
          }
        })
    }
    catch(e){
      console.log('SSSSSSSSSSS',e)
    }
  }

 update=async(request,h)=>{
    try{
      var items=[]
      var itemTotalPrice =0
        var authToken=request.auth.credentials.userData
        const data = await db.cartItems.findOne({
          where:{id:request.payload.cartItemId}
        })

        const update=await db.cartItems.update({
          itemQuantity:request.payload.itemQuantity,
          cost:request.payload.itemQuantity*data.dataValues.itemPrice
        },{
          where:{id:request.payload.cartItemId}
        })

        var restaurant = await db.restaurant.findOne({
          attributes: [
            "id",
            "title",
            "address",
            "description",
            "rating",
            "ratingCount",
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
          where:{id:data.dataValues.restaurant_id}
        })
        var itemData = await db.cartItems.findAll({
        where:{cart_id:data.dataValues.cart_id}})
        for(let i=0;i<itemData.length;i++)
        {
          var item = await db.restaurantMenuCategoryItem.findOne({
            where:{id:itemData[i].dataValues.item_id}
          })
         
          items.push({
            cartItemId:itemData[i].dataValues.id,
            id:item.dataValues.id,
            price:item.dataValues.price,
            itemName:item.dataValues.itemName,
            itemDescription:item.dataValues.itemDescription,
            itemQuantity:itemData[i].dataValues.itemQuantity
          })
           itemTotalPrice = itemData[i].dataValues.cost + itemTotalPrice
        }
        var restaurantChargesData = await db.restaurantCharges.findAll({
          where:{restaurant_id:data.dataValues.restaurant_id}
        })
       var restaurantCharges=[];
       var totalTax = 0 
        for(let i=0;i<restaurantChargesData.length;i++ )
        {
             var amount =(restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice
             amount =amount.toFixed(1)
            
             totalTax = (restaurantChargesData[i].dataValues.percentage/100)*itemTotalPrice + totalTax
            restaurantCharges.push({
              taxName:restaurantChargesData[i].dataValues.taxName,
              percentage:restaurantChargesData[i].dataValues.percentage,
              amount:Number(amount)
            })  
          
        }
        var totalPrice = itemTotalPrice+totalTax
        const updateAmount = await db.cart.update({
          totalCost:totalPrice
        },{
          where:{id:data.dataValues.cart_id}
        })
     

        return h.response({
          responseData:{
            restaurant,
            items,
            restaurantCharges,
            itemTotalPrice,
            totalPrice 
          }
        })
    }
    catch(e){
      console.log('SSSSSSSSs',e)
    }
  }

 addCharges=async(request,h)=>{
   try{
    var authToken=request.auth.credentials.userData ;
    const restaurant = await db.restaurant.findOne({
      where: { id: request.payload.restaurantId },
    });
    if (!restaurant) {
      return h.response({ message: "Enter Valid Id" });
    }
    var charges=[]
    for(let i=0;i<request.payload.taxes.length;i++)
    {
        charges.push({
          restaurant_id: request.payload.restaurantId,
          taxName:request.payload.taxes[i].taxName,
          percentage:request.payload.taxes[i].percentage
        })
    }
    const already= await db.restaurantCharges.findAll({
      where:{restaurant_id:request.payload.restaurantId}
    })
    if(already)
    {
      for(var i=0 ;i<already.length;i++)
      {
        const deleteTax = await db.restaurantCharges.destroy({where:{
          id:already[i].dataValues.id
        }})
      }
    }
     const add = await db.restaurantCharges.bulkCreate(charges); 
    return add
   }
   catch(e)
   {
     console.log('charges',e)
   }
 }

 getCharges=async(request,h)=>{
   try{
        var authToken=request.auth.credentials.userData;
        const restaurant = await db.restaurant.findOne({
          where: { id: request.query.id ,user_id:authToken.userId},
        });
        if (!restaurant) {
          return h.response({ message: "Enter Valid Id" });
        }
        var charges = await db.restaurantCharges.findAll({
          where:{restaurant_id:request.query.id}
        })

        return h.response({
          responseData:{
           charges
          }
        })

   }
   catch(e){
     console.log('SSgetcharges',e)
   }
 }

 editCharges=async(request,h)=>{
   try{
      var check = await db.restaurantCharges.findOne({where:{id:request.params.id}})
      if(!check)
      {
        return h.response({message:'Enter valid id'})
      }
      var edit = await db.restaurantCharges.update({
        taxName:request.payload.taxName,
        percentage:request.payload.percentage
      },{
        where:{
          id:request.params.id
        }
      })
      if(edit)
      {
        return h.response({message:edit})
      }
   }
   catch(e)
   {
     console.log('SSSSSSSSS',e)
   }
 }

 addOrder= async(request,h)=>{
   try{
      if(request.payload.restaurantId==''|| request.payload.restaurantId==0 && request.payload.addressId==''|| request.payload.addressId==0 && request.payload.items.length==0 )
      {
        return h.response({message:'Enter all the input payload'}).code(400)
      }
      var authToken = request.auth.credentials.userData
      var stripeCustomerId=null;
      var token=null;
      const fcmToken = await db.userAccesses.findAll({
        where:{user_id:authToken.userId,fcmToken:{[Op.ne]:null}}
      })

      var n = fcmToken.length - 1

       if(request.payload.cardId){
        const check = await db.userCardDetail.findOne({
          where:{id:request.payload.cardId,user_id:authToken.userId}
        })
        if(!check){
          return h.response({message:"Enter Valid CardID"}).code(400)
        }
        stripeCustomerId=check.dataValues.stripCustomerId
        token=check.dataValues.token
        console.log('sssssssss',stripeCustomerId,token)
      }
      
      const addressCheck = await db.userAddress.findOne({
        where:{
          id:request.payload.addressId,
          user_id:authToken.userId
        }})
        const location = await db.restaurant.findOne({
          where:{id:request.payload.restaurantId}
        }) 
        var locationData = await Models.sequelize.query(`select id from restaurant where st_distance_sphere(Point((${addressCheck.dataValues.userLongitude}),(${addressCheck.dataValues.userLatitude})), Point((${location.dataValues.long}),(${location.dataValues.lat})) ) < 20000 `)
        console.log('sssssss',locationData,"ssssssssssssssss",locationData.length)
        var locationArr = [];
        for(let eachLocation of locationData[0]){
          locationArr.push(eachLocation.id)
        }
        if(locationArr.length==0)
        {
          return h.response({message:'We are not deleiver orders in this location'}).code(400)
        }
        console.log('locationDataXXXXFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',locationData)

        if(!addressCheck)
        {
          return h.response({message:'Address Not Found'}).code(400)
        }

      const data = await this.getCart(request,h)
      if(data)
      {
           var addOrderData = await db.restaurantOrder.create({
            user_id:authToken.userId,
            address_id:request.payload.addressId,
            restaurant_id:request.payload.restaurantId,
            status:'pending',
            orderPlaced:'pending',
            paymentMethod:request.payload.paymentMethod,
            orderData:JSON.stringify(data.source.responseData),
            totalCost:Math.floor(data.source.responseData.totalPrice)
          })
          var orderItemData=[]
          if(addOrderData)
          {
             for(let i=0;i<data.source.responseData.items.length;i++)
             {
               orderItemData.push({
                restaurantOrder_id:addOrderData.dataValues.id,
                restaurant_id:request.payload.restaurantId,
                item_id:data.source.responseData.items[i].id,
                itemQuantity:data.source.responseData.items[i].itemQuantity,
                itemPrice:data.source.responseData.items[i].price,
                cost:data.source.responseData.items[i].itemQuantity * data.source.responseData.items[i].price
               })
             }
             
             const itemorder = await db.restaurantOrderItems.bulkCreate(orderItemData)
            
          }

          if(request.payload.paymentMethod=='CARD')
          {
          if(stripeCustomerId!==null)
          {
            
           var stripeChargeParam = {
              amount: Math.floor(data.source.responseData.totalPrice * 100),
              currency: 'usd',
              description : 'Order Food',
              payment_method_types: ["card"],
              customer:stripeCustomerId,
              payment_method:token,
              metadata:{
                userId:authToken.userId,
                orderId: addOrderData.dataValues.id,
                type:'restaurant',
                amount:data.source.responseData.totalPrice,
                businessId:request.payload.restaurantId,
                addressId:request.payload.addressId
              }
            }
          }
          else{
          
           var stripeChargeParam = {
            amount:Math.floor(data.source.responseData.totalPrice * 100),
            currency: 'usd',
            description : 'Order Food',
            payment_method_types: ["card"],
            metadata:{
              userId:authToken.userId,
              orderId: addOrderData.dataValues.id,
              type:'restaurant',
              amount:data.source.responseData.totalPrice,
              businessId:request.payload.restaurantId,
              addressId:request.payload.addressId
            }
          }
        }
    
         var payement= await stripe.paymentIntents.create(stripeChargeParam)
         return h.response({
          responseData:{
            orderId:addOrderData.dataValues.id,
            paymentIntent:payement,
          }
        })
           }

           if(request.payload.paymentMethod=='PAYPAL' ||  request.payload.paymentMethod=="APPLEPAY")
           {
            const payment = await gateway.transaction.sale({
              amount: data.source.responseData.totalPrice,
              paymentMethodNonce: request.payload.paymentNonce,
              deviceData: request.payload.deviceData,
              options: {
                submitForSettlement: true
              }
            });
    
            if(payment.transaction!='undefined')
            {
              console.log('SSSSSSSSSSS',payment.transaction)
              let data = await db.restaurantOrder.update({
                orderPlaced:"success"
                },{
                  where:{id:addOrderData.dataValues.id}
                }) 
    
                const dataTransaction = await db.transaction.create({
                  transaction_id:payment.transaction.id,
                  user_id:authToken.userId,
                  order_id:addOrderData.dataValues.id,
                  business_id:request.payload.restaurantId,
                  totalAmount:payment.transaction.amount,
                  type:'restaurant',
                  status:'succeeded',
                  isDeleted:false
                })
    
                let notificationData ={
                  title:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.title,
                  body:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.body,
                  notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.type),
                  type:'restaurant',
                  actionId:JSON.stringify(addOrderData.dataValues.id),
                  user_id:JSON.stringify(authToken.userId)
                }

                console.log('SSSSSSSSSSSSS',fcmToken[n])
                if(fcmToken[n])
                {
               var send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
                }
               console.log('SSSSSSSSendNotification',send)
               const create = await db.notifications.create({
                user_id:authToken.userId,
                title:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.title,
                body:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.body,
                notificationType:constant.NOTIFICATION_TYPE.ORDER_SUCCESSFULL.type,
                type:'restaurant',
                order_id:addOrderData.dataValues.id,
                notificationTo:constant.NOTIFICATION_TO.USER
              })
    
               return h.response({
                responseData: {
                  orderId:addOrderData.dataValues.id
                },
              });
            }  
           }

      }

 


   }
   catch(e)
   {
     console.log('SSSSSSSSSSorder',e)
   }
 }

 cancelOrder=async(request,h)=>{
   try{
        var authToken=request.auth.credentials.userData
        const fcmToken = await db.userAccesses.findAll({
          where:{user_id:authToken.userId,fcmToken:{[Op.ne]:null}}
        })
  
        var n = fcmToken.length - 1
       
      
        if(request.payload.orderId==0 || request.payload.orderId=='')
        {
          return h.response({message:'enter valid order id'})
        }

        var alreadyCancelled = await db.restaurantOrder.findOne({
         where:{user_id:authToken.userId,id:request.payload.orderId,status:'cancelled'}
        })
        if(alreadyCancelled)
        {
          return h.response({message:'Already cancelled'}).code(400)
        }

        var alreadyDelivered = await db.restaurantOrder.findOne({
          where:{user_id:authToken.userId,id:request.payload.orderId,status:'delivered'}
         })
         if(alreadyDelivered)
         {
           return h.response({message:'Your order is delivered already'}).code(400)
         }

         
        var alreadyConfirmed = await db.restaurantOrder.findOne({
          where:{user_id:authToken.userId,id:request.payload.orderId,status:'confirmed'}
         })

         if(alreadyConfirmed)
         {
           return h.response({message:'Your order is already confirmed by restaurant'}).code(400)
         }


        const amount = await db.restaurantOrder.findOne({where:{user_id:authToken.userId,id:request.payload.orderId}})
        if(!amount){
          return h.response({message:'enter valid orderId' })
        }
        var amountValue = amount.dataValues.totalCost
        

       var transaction = await db.transaction.findOne({
          attributes:["transaction_id"],
          where:{order_id:request.payload.orderId,type:'restaurant'}
        })

        if(amount.dataValues.paymentMethod=="CARD")
        {
          if(!transaction)
          {
            return h.response({message:'no transaction '})
          }
          var refundData = await stripe.refunds.create({
            amount:Math.floor(amountValue * 100),
            charge:transaction.dataValues.transaction_id,
          });
          if(refundData)
          {
            const cancel = await db.restaurantOrder.update({
              status:'cancelled',
              refundStatus:'SUCCESS'
            },{
              where:{user_id:authToken.userId,id:request.payload.orderId}
            })

            let notificationData ={
              title:constant.NOTIFICATION_TYPE.ORDER_REFUND.title,
              body:constant.NOTIFICATION_TYPE.ORDER_REFUND.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_REFUND.type),
              type:'restaurant',
              actionId:JSON.stringify(request.payload.orderId),
              user_id:JSON.stringify(authToken.userId)
            }
            
            if(fcmToken[n])
                {
                  let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)
                }

            const create = await db.notifications.create({
              title:constant.NOTIFICATION_TYPE.ORDER_REFUND.title,
              body:constant.NOTIFICATION_TYPE.ORDER_REFUND.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_REFUND.type),
              type:'restaurant',
              order_id:request.payload.orderId,
              user_id:authToken.userId,
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
            const cancel = await db.restaurantOrder.update({
              status:'cancelled',
              refundStatus:'SUCCESS'
            },{
              where:{user_id:authToken.userId,id:request.payload.orderId}
            })

            let notificationData ={
              title:constant.NOTIFICATION_TYPE.ORDER_REFUND.title,
              body:constant.NOTIFICATION_TYPE.ORDER_REFUND.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_REFUND.type),
              type:'restaurant',
              actionId:JSON.stringify(request.payload.orderId),
              user_id:JSON.stringify(authToken.userId)
            }
            
            let send = await sendNotification.sendMessage(fcmToken[n].dataValues.fcmToken,notificationData)

            const create = await db.notifications.create({
              title:constant.NOTIFICATION_TYPE.ORDER_REFUND.title,
              body:constant.NOTIFICATION_TYPE.ORDER_REFUND.body,
              notificationType:JSON.stringify(constant.NOTIFICATION_TYPE.ORDER_REFUND.type),
              type:'restaurant',
              order_id:request.payload.orderId,
              user_id:authToken.userId,
              notificationTo:constant.NOTIFICATION_TO.USER
            })


          }
        }
      return h.response({message:'Your order is cancelled successfully'})
        
   }
   catch(e)
   {
     console.log('SSSSSSSSSSS',e)
   }
 }

 getOrder = async(request,h)=>{
  try {
        const query = request.query;
        const page = query.page ? query.page : 1;
        var authToken=request.auth.credentials.userData
        var orderData= []
        const order = await db.restaurantOrder.findAndCountAll({
          attributes:["orderData","status","id","createdAt"],
        /*   include:[
            {
            attributes:['id','title','address'],
            required:false,
            model:Models.restaurant,
            include:[
              {
                attributes: [
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`restaurant->attachment`.`filePath`)"
                    ),
                    "filePath",
                  ],
                  [
                    Sequelize.literal(
                      "CONCAT('" +
                        process.env.NODE_SERVER_API_HOST +
                        "','/',`restaurant->attachment`.`thumbnailPath`)"
                    ),
                    "thumbnailPath",
                  ],
                  "id",
                  "originalName",
                  "fileName",
                ],
                model: Models.attachments,
              }
            ]
            },
        ], */
          offset: (parseInt(page) - 1) * 10,
          limit: 10,
          distinct: true,
          order: [["id", "DESC"]],
          where:{user_id:authToken.userId,orderPlaced:{[Op.ne]:'pending'}}
        })
      
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
      console.log('SSSSSSSSorder',e)
   }
 }

 getOrderById=async(request,h)=>{
   try{
        var authToken= request.auth.credentials.userData
        var isCancelled;
        const data = await db.restaurantOrder.findOne({
          where:{id:request.query.id,user_id:authToken.userId}})
        if(!data)
        {
          return h.response({message:'Order Not Found'})
        }
        var orderData= JSON.parse(data.dataValues.orderData)

        if(data.dataValues.status=='pending')
        {
           isCancelled=true
        }
        else{
          isCancelled=false
        }
        
        var address = await db.userAddress.findOne({
          attributes:["id","userLatitude","userLongitude",'address','houseNo','buildingName','other','type'],
          where:{id:data.dataValues.address_id,user_id:authToken.userId}})
         orderData.address=address
         orderData.status=data.dataValues.status
         orderData.id=data.dataValues.id
         orderData.isCancelled=isCancelled
         orderData.text="Are you sure you want to cancel"
        
        var responseData={...orderData}

        return h.response({
          responseData,
          supportEmail:'syed@illuminz.com',
          supportNumber:'9090909098'
        })
   }
   catch(e)
   {
     console.log('SSSSSSSSSSSS,orderById',e)
   }
 }

 repeatOrder=async(request,h)=>{
   try{
     var authToken= request.auth.credentials.userData
        const item = await db.restaurantOrder.findOne({
          where:{user_id:authToken.userId,id:request.params.orderId}
        })
        if(!item)
        {
          return h.return({message:"no order"})
        }
        var data = JSON.parse(item.dataValues.orderData)
        console.log('sssssss',data)
        var restaurant = data.restaurant
        var itemData = data.items

        return h.response({
          responseData:{
            restaurant,
            items:itemData
          }
        })
         }
   catch(e)
   {
      console.log('SSSSS',e)
   }
 }
}

module.exports = new Restaurant();
