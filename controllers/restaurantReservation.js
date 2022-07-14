const db = require("../models/index");
const sendNotification = require("../notifications/notifications")
var constant = require("../config/constant")

class restaurantReservation {
  addrestaurantReservation = async (req, h) => {
    try {
      const authToken = req.auth.credentials.userData;
    
      var data = req.payload;
      const restaurant = await db.restaurant.findOne({
        where: { id: data.id },
      });
      if (!restaurant) {
        return h.response({ message: "Enter a valid id" });
      }
      const reservation = await db.restaurantReservations.create({
        user_id: authToken.userId,
        restaurant_id: data.id,
        noOfPerson: data.noOfPerson,
        specialRequest: data.specialRequest,
        startTime: data.startTime,
        endTime: data.endTime,
        preferTime: data.preferTime,
        startDate: data.startDate,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        isDeleted: false,
      });

      if(reservation)
      {
        var Fcm =  await db.userAccesses.findAll({
          where:{user_id:restaurant.dataValues.user_id,fcmToken:{[Op.ne]:null}}
        })
  
        var m = Fcm.length - 1
            
        let notificationData ={
          title:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RECEIVE_RESERVATION.title,
          body:constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RECEIVE_RESERVATION.body,
          notificationType:JSON.stringify(constant.VENDOR_NOTIFICATION_TYPE.VENDOR_RECEIVE_RESERVATION.type),
          type:'restaurant',
          actionId:JSON.stringify(reservation.dataValues.id),
          user_id:JSON.stringify(authToken.userId)
        }

        var send = await sendNotification.sendMessage(Fcm[m].dataValues.fcmToken,notificationData)
      }

      return h.response({
        responseData: {
          bookingId: reservation.dataValues.id,
        },
      });
    } catch (e) {
      console.log("SSSSSSSSSSS", e);
    }
  };

  getReservationDetail = async (request, h) => {
    try {
      var authToken = request.auth.credentials.userData;
      var data = await db.restaurantReservations.findOne({
        attributes: [
          "restaurant_id",
          "id",
          "noOfPerson",
          "startDate",
          "endTime",
          "startTime",
          "preferTime",
          "specialRequest",
          "firstName",
          "lastName",
          "email",
          "phoneNumber",
        ],
        where: { id: request.params.id, user_id: authToken.userId },
      });
      if (!data) {
        return h.response({ message: "Enter Valid Id" }).code(400);
      }

      const restaurant = await db.restaurant.findOne({
        attributes: ["title", "address", "lat", "long", "mobile", "user_id"],
        where: { id: data.dataValues.restaurant_id },
      });

      const user = await db.users.findOne({
        attributes:["mobile","countryCode"],
        where:{id:restaurant.user_id},
      })

      return h.response({
        responseData: {
          data,
          restaurant,
          supportEmail:'syed@illuminz.com',
          supportNumber:'9090909098',
          user
        },
      });
    } catch (e) {
      console.log("SSSSSSSGetReservationDetails", e);
    }
  };
}

module.exports = new restaurantReservation();
