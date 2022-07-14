const db = require("../models");
const notification = require("../notifications/notifications")
 const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid,authToken); 
var constant = require("../config/constant")

class User {
  /**
   * PreFunction
   */
  prefunction = async () => {
    return true;
  };

  /**
   * VerifyMobile number of the user
   * @argument payload
   */
  verifyMobile = async (payload) => {
    try {
      let data = await Models.users.findOne({
        where: {
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          country: payload.country,
          status: {
            [Op.in]: [1,3]
          },
        },
      });
      console.log("verifyMobile", data);
      if (data) {
        return data.dataValues;
      } else {
        return false;
      }
    } catch (e) {
      console.log("SSSSSSSSSSSSS", e);
      return e;
      //return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Verify the email of the user
   * @argument payload
   */
  verifyEmail = async (payload) => {
    try {
      let data = await Models.users.findOne({
        where: {
          email: payload.email,
          status: 1,
        },
      });

      if (data && data.dataValues.id) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return e;
      //return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * create a user entry in the database
   * @argument payload
   */
  insertUser = async (payload) => {
    try {
      let data;
      if (payload.email) {
        data = await Models.users.create({
          email: payload.email,
          password: payload.password,
          status: Constants.VERIFICATION_STATUS.UNVERIFIED,
          profileStatus: Constants.PROFILE_STATUS.INCOMPLETE,
          role_id: Constants.ROLES.USER_ROLE,
        });
      }
      if (payload.mobile) {
        data = await Models.users.create({
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          country: payload.country,
          status: Constants.VERIFICATION_STATUS.UNVERIFIED,
          profileStatus: Constants.PROFILE_STATUS.INCOMPLETE,
          role_id: Constants.ROLES.USER_ROLE,
        });
        console.log(data)

        let adminData = await Models.users.findOne({
          where: {
            role_id: constant.ROLES.ADMIN_ROLE,
          },
        });
        if(adminData){
          //send notification to admin
          const create = await Models.notifications.create({
            title:constant.ADMIN_NOTIFICATION_TYPE.USER_CREATED.title,
            body:constant.ADMIN_NOTIFICATION_TYPE.USER_CREATED.body,
            notificationType:constant.ADMIN_NOTIFICATION_TYPE.USER_CREATED.type,
            user_id:adminData.dataValues.id,
            notificationTo:constant.NOTIFICATION_TO.ADMIN
          })
        }
      }
      return data;
    } catch (e) {
      console.log("@@@@@@@@@@insert", e);
      return e;
    }
  };

  /**
   * delete Unverified User in the database
   * @argument payload
   */
  deleteUnVerifiedUser = async (payload) => {
    try {
      let data;
      let userId;

      if (payload.email) {
        userId = await Models.users.findOne({
          where: {
            mobile: payload.email,
            status: 2,
          },
        });

        userId = userId.dataValues.id;

        await Models.userProfiles.destroy({
          where: {
            user_id: userId,
          },
          force: true,
        });

        data = await Models.users.destroy({
          where: {
            email: payload.email,
            status: Constants.VERIFICATION_STATUS.UNVERIFIED,
          },
          force: true,
        });
      }
      if (payload.mobile) {
        userId = await Models.users.findOne({
          where: {
            mobile: payload.mobile,
            status: 2,
          },
        });
        console.log("userId", userId);
        userId = userId.dataValues.id;
        console.log("userId", userId);

        await Models.userProfiles.destroy({
          where: {
            user_id: userId,
          },
          force: true,
        });

        data = await Models.users.destroy({
          where: {
            mobile: payload.mobile,
            status: Constants.VERIFICATION_STATUS.UNVERIFIED,
          },
          force: true,
        });

        console.log("DDDDDDDDDDDD", data);
      }

      return data;
    } catch (e) {
      console.log("error", e);
      return e;
    }
  };

  /**
   * create entry in the userVerificartion table
   * @argument {payload, userId}
   */
  insertVerifyUser = async (payload, userId, pinId) => {
    try {
      let dataEmail, dataMobile;
      let verificationCodeEmail, verificationCodeMob;
      if (payload.mobile) {
        if (process.env.ENABLE_MASTER_CODE) {
          verificationCodeMob = process.env.MASTER_CODE;
        } else {
          verificationCodeMob = pinId;
        }
      }

      verificationCodeEmail = Math.floor(100000 + Math.random() * 900000);

      if (payload.email) {
        dataEmail = await Models.userVerifications.create({
          user_id: userId,
          verificationEntityType: Constants.VERIFICATION_ENTITY_TYPES.EMAIL,
          verificationEntityValue: payload.email,
          verificationCodeRef: verificationCodeEmail,
          verificationStatus: 0,
        });
      }
      if (payload.mobile) {
        dataMobile = await Models.userVerifications.create({
          user_id: userId,
          verificationEntityType: Constants.VERIFICATION_ENTITY_TYPES.MOBILE,
          verificationEntityValue: payload.mobile,
          countryCode: payload.countryCode,
          verificationCodeRef: verificationCodeMob,
          verificationStatus: 0,
        });
      }
      return { dataEmail, dataMobile };
    } catch (e) {
      return e;
    }
  };

  insertLoginOTP = async (payload, userId, pinId) => {
    try {
      let verificationCodeMob, dataMobile, verificationCodeEmail;
      if (payload.mobile) {
        if (process.env.ENABLE_MASTER_CODE) {
          verificationCodeMob = process.env.MASTER_CODE;
        } else {
          verificationCodeMob = pinId;
        }
      }

      verificationCodeEmail = Math.floor(100000 + Math.random() * 900000);

      if (payload.mobile) {
        dataMobile = await Models.userVerifications.update(
          {
            user_id: userId,
            verificationEntityType: Constants.VERIFICATION_ENTITY_TYPES.MOBILE,
            verificationEntityValue: payload.mobile,
            countryCode: payload.countryCode,
            verificationCodeRef: verificationCodeMob,
            verificationStatus: 1,
          },
          {
            where: {
              verificationEntityValue: payload.mobile,
              countryCode: payload.countryCode,
              verificationStatus: 1,
            },
          }
        );
      }
      return dataMobile;
    } catch (e) {
      return e;
    }
  };

  /**
   *
   */
  insertUserProfile = async (userId, name) => {
    try {
      const refCode = "REF-" + userId;
      let data = await Models.userProfiles.create({
        user_id: userId,
        name: name,
        referralCode: refCode,
      });
      return data;
    } catch (e) {
      return e;
    }
  };

  loginSignup = async (payload, h, req) => {
    try {
      let user = await this.getUser(payload);
      if (!user) {
        return Boom.badRequest(req.i18n.__("NO_SUCH_USER_EXIST"));
      }
      user = user.dataValues;
      const userId = user.id;
      const identifier = "mobile";
      if (payload.verificationCode) {
        const verifyingCode = await this.verifyCodes(
          userId,
          payload.verificationCode,
          identifier,
          payload.pinId
        );

        if (!verifyingCode) {
          return Boom.badRequest(
            req.i18n.__("VERIFICATION_CODE_DOES_NOT_MATCH")
          );
        }
      } else if (payload.password) {
        const compareResult = await Bcrypt.compare(
          payload.password,
          user.password
        );
        if (!compareResult) {
          return Boom.badRequest(req.i18n.__("INVALID_PASSWORD"));
        }
      }
      const role = Constants.ROLES.USER_ROLE;
      let ip;
      if (req.headers["x-forwarded-for"]) {
        ip = req.headers["x-forwarded-for"];
      } else {
        console.log("SSSSSSSSSSSSS", req.headers);
        ip = req.info.host;
      }
      let userProfile = await Models.userProfiles.findOne({
        where: { user_id: userId },
        attributes: [
          "user_id",
          "firstName",
          "lastName",
          "email",
          "address",
          "referralCode",
          "isDeleted",
          "createdAt",
          "updatedAt",
          [Sequelize.col("user.mobile"), "mobile"],
          [Sequelize.col("user.countryCode"), "countryCode"],
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

      var verificationCode = Math.floor(1000 + Math.random() * 9000)
      //static otp
      console.log(payload.mobile == '9779781130')
      if(payload.mobile == '9779781130'){
        verificationCode = 4444
      }

      var otpsent = await client.messages.create({
        body: `${verificationCode} is the OTP for accessing your Lyfe account        Mvd7Jq9qU6s`,
        from: '+18582392003',
        to: `${payload.countryCode}${payload.mobile}`
      })
      console.log("otpsent",otpsent)
      if(otpsent)
      {
            const otp = await Models.userVerifications.update({
              verificationCode:verificationCode
            },{
              where:{user_id:userId}
            })
          }

      return {
        userId: userId,
        alreadyExists: 1,
      };
    } catch (e) {
      console.log(e);
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  verifyStatus = async (payload) => {
    try {
      let data = await Models.users.findOne({
        where: {
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          status: 2,
        },
      });

      if (data && data.dataValues.id) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("SSSSSSS", e);
      return e;
      //return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * SignUp user with the given Mobile
   */
  signUpWithMobile = async (req, h) => {
    try {
      const payload = req.payload;
      let verifyMobileData = await this.verifyMobile(payload);
      /*  let verifyMobile = await this.verifyStatus(payload); */
      /*  if(verifyMobile){
        console.log("FFFFFFFFFFFF",verifyMobile)
        await this.deleteUnVerifiedUser(payload);
      } */
      console.log("SSSSSSSS---->", verifyMobileData);
      if (verifyMobileData) {
        if(verifyMobileData.status == 3){
          return h.response({
            message: "Your account blocked by admin, please contact support team",
          }).code(400);
        }
        let data = await this.loginSignup(payload, h, req);
        console.log(data)
        return h.response({
          responseData: data,
          message: "Succesfull",
        });
      }
      if (!verifyMobileData) {
        // await this.deleteUnVerifiedUser(payload);
      }

      let insertUser = await this.insertUser(payload);
      /*  console.log('EEEEEEEEEEE',insertUser) */
      let userId = insertUser.dataValues.id;
      let pinId = 101;
      await this.insertVerifyUser(payload, userId, pinId);
      //await this.insertUserProfile(userId, payload.name);
      var verificationCode = Math.floor(1000 + Math.random() * 9000)

      var dataSent = await client.messages.create({
        body: `${verificationCode} is the OTP for accessing your Lyfe account        Mvd7Jq9qU6s`,
        from: '+18582392003',
        to: `${payload.countryCode}${payload.mobile}`
      })

      const otp = await Models.userVerifications.update({
        verificationCode:verificationCode
      },{
        where:{user_id:userId}
      }) 

      return h.response({
        responseData: {
          userId: userId,
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          country: payload.country,
          alreadyExists: 0,
        },
        message: "Succesfull",
      });
    } catch (e) {
      console.log("@@@@@@@@signup", e);
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Sign Up User With given Email
   */
  signUpWithEmail = async (req, h) => {
    try {
      const payload = req.payload;
      let verifyEmailData = await this.verifyEmail(payload);

      if (verifyEmailData) {
        return Boom.badRequest(req.i18n.__("USER_EXIST_WITH_GIVEN_EMAIL"));
      }
      if (!verifyEmailData) {
        await this.deleteUnVerifiedUser(payload);
      }

      let rounds = parseInt(process.env.HASH_ROUNDS);
      payload.password = await Bcrypt.hashSync(payload.password, rounds);
      let insertUser = await this.insertUser(payload);
      let userId = insertUser.dataValues.id;

      await this.insertVerifyUser(payload, userId);
      await this.insertUserProfile(userId, payload.name);
      return h.response({
        responseData: {
          userId: userId,
          email: payload.email,
        },
      });
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Verify the Code that the user uses
   * @argument {userId, verificationCode, identifier}
   */
  verifyCode = async (userId, verificationCode, identifier, pinId) => {
    try {
      let data;
      var otp = await Models.userVerifications.findOne({
        where:{user_id: userId}
      })
      if (otp) {
        if ( otp && verificationCode == /* parseInt(process.env.MASTER_CODE) */otp.dataValues.verificationCode) 
        {
          console.log(1);
          data = await Models.userVerifications.findOne({
            where: {
              verificationEntityType: identifier,
              user_id: userId,
              // verificationStatus: Constants.VERIFY_STATUS.UNVERIFIED,
            },
          });
        } else {
          console.log(2);
          data = await Models.userVerifications.findOne({
            where: {
              user_id: userId,
              verificationEntityType: identifier,
              verificationCode: verificationCode,
              //verificationStatus: Constants.VERIFY_STATUS.UNVERIFIED,
              /* verificationCode: pinId, */
            },
          });
        }
      } else {
        console.log(3);
        data = await Models.userVerifications.findOne({
          where: {
            verificationEntityType: identifier,
            user_id: userId,
            verificationCode:verificationCode,
          },
        });
      }

      if (data && data.dataValues.id) {
        return data;
      } else {
        return false;
      }
    } catch (e) {
      console.log('SSSSSSSs',e)
      return e;
    }
  };

  verifyCodes = async (userId, verificationCode, identifier, pinId) => {
    try {
      let data;
      if (
        parseInt(process.env.MASTER_CODE) &&
        verificationCode == parseInt(process.env.MASTER_CODE)
      ) {
        data = await Models.userVerifications.findOne({
          where: {
            verificationEntityType: identifier,
            user_id: userId,
          },
        });
      } else {
        data = await Models.userVerifications.findOne({
          where: {
            user_id: userId,
            verificationEntityType: identifier,
            verificationCodeRef: pinId,
          },
        });
      }

      if (data && data.dataValues.id) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return e;
    }
  };

  /**
   * Update user Verification status in the user table
   */
  updateUserVerification = async (userId, entityType) => {
    try {
      let data = await Models.userVerifications.update(
        {
          verificationStatus: 1,
        },
        {
          where: {
            user_id: userId,
            verificationEntityType: entityType,
            verificationStatus: Constants.VERIFY_STATUS.UNVERIFIED,
          },
        }
      );
      return data;
    } catch (e) {
      return e;
    }
  };

  /**
   * Update the user Status in the user table
   */
  updateUserStatus = async (userId) => {
    try {
      let data = await Models.users.update(
        {
          status: 1,
        },
        {
          where: {
            id: userId,
            status: Constants.STATUS.INACTIVE,
          },
        }
      );
      return data;
    } catch (e) {
      return e;
    }
  };

  updateUserEmail = async (userId, email) => {
    try {
      let data = await Models.users.update(
        {
          email: email,
        },
        {
          where: {
            id: userId,
          },
        }
      );
      return data;
    } catch (e) {
      return e;
    }
  };

  /**
   * Verify Account of the User with either email or mobile Number
   */
  verifyAccount = async (req, h) => {
    try {
      const payload = req.payload;

      let verifyingCode = await this.verifyCode(
        payload.userId,
        payload.verificationCode,
        payload.identifier,
        payload.pinId
      );

      console.log(verifyingCode, "verifyingCode");

      if (!verifyingCode) {
        return Boom.badRequest(req.i18n.__("VERIFICATION_CODE_DOES_NOT_MATCH"));
      }

      if (payload.identifier == "email") {
        await this.updateUserEmail(
          payload.userId,
          verifyingCode.dataValues.verificationEntityValue
        );
      }
      await this.updateUserVerification(payload.userId, payload.identifier);
      /* await this.updateUser(payload.userId) */
      let user = await this.updateUserStatus(payload.userId);
      var userProfile;
      if (user[0] === 0) {
        userProfile = await Models.userProfiles.findOne({
          where: { user_id: payload.userId },
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

        if (user[0] === 1) {
          userProfile = {};
        }
      }

      const deleteSession = await Models.userAccesses.findAll({
        where:{user_id:payload.userId},
        force: true,
      })

      if(deleteSession.length!==0)
      {
      for(var i=0;i<deleteSession.length;i++)
      {
        var data = await Models.userAccesses.destroy({
          where:{id:deleteSession[i].dataValues.id}
        }) 
      }
    }

      let ip;
      if (req.headers["x-forwarded-for"]) {
        ip = req.headers["x-forwarded-for"];
      } else {
        ip = req.info.host;
      }

      const role = Constants.ROLES.USER_ROLE;
      let sessionData = await this.createSession(payload.userId, role, ip,payload.token);
      console.log('SSSSSSSSSS',sessionData)
      let userScope = [];
      userScope.push("user");
      // assign Token to the user
      const tokenData = {
        userId: payload.userId,
        scope: userScope,
        sessionId: sessionData.dataValues.id,
      };
      const token = UniversalFunctions.signToken(tokenData);
     /*  await this.createSession(payload.userId, role, ip,payload.token); */

       let userStatus = await Models.users.findOne({
         attributes:['status'],
        where:{
          id:payload.userId
        }
      })
      console.log('sssssssssss',userStatus)
      if(userStatus.dataValues && userStatus.dataValues.status==2)
      {
        return h.response({
          message: "BLOCKED BY THE ADMIN",
        }).code(400);
      }

     var userAddress= await Models.userAddress.findAll({
       attributes:['id','address','houseNo','buildingName','type','other','userLatitude','userLongitude'],
       where:{user_id:payload.userId,isDeleted:false}
     })
     console.log('sss',userAddress,"ddd",payload.userId)
     if(userAddress.length!==0)
     {
       userProfile.address= userAddress ? userAddress : null
     }

     /* let notificationdata={
      type:"",
      title:'ddddddddd',
      message:'GGGSVJV'
    }

    let send = await notification.sendMessage(tokense,notificationdata)

     console.log('sendnotif',send)
 */

      

      return h.response({
        responseData: {
          token: token,
          userProfile,
        },
        message: "Otp verify Succesfully",
      });
    } catch (e) {
      console.log("jjjjjjjjjjjjj", e);
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Retreive the user details
   * @argument payload
   */
  getUser = async (payload) => {
    try {
      let data;
      if (payload.email) {
        data = await Models.users.findOne({
          where: {
            email: payload.email,
            status: 1,
          },
        });
      }
      if (payload.mobile) {
        data = await Models.users.findOne({
          where: {
            mobile: payload.mobile,
            countryCode: payload.countryCode,
            status: 1,
          },
        });
      }
      return data;
    } catch (e) {
      return e;
    }
  };

  /**
   * Create Session for the Users
   * @argument {userId, role, ip}
   */
  createSession = async (userId, role, ip , token) => {
    try {
      console.log('SSSSSSS',token)
      let data = await Models.userAccesses.create({
        user_id: userId,
        ip: ip,
        role: role,
        fcmToken : token 
      });
      return data;
    } catch (e) {
      console.log('SSSSSSSSSSSSSSerror',e)
    }
  };

  /**
   * Login With Email
   */
  loginWithEmail = async (req, h) => {
    try {
      const payload = req.payload;
      let user = await this.getUser(payload);
      if (!user) {
        return Boom.badRequest(req.i18n.__("NO_SUCH_USER_EXIST"));
      }
      //console.log(user);
      user = user.dataValues;
      const compareResult = await Bcrypt.compare(
        payload.password,
        user.password
      );
      if (!compareResult) {
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

      const role = Constants.ROLES.USER_ROLE;
      let sessionData = await this.createSession(user.id, role, ip);
      let userScope = [];
      userScope.push("user");
      const tokenData = {
        userId: user.id,
        scope: userScope,
        sessionId: sessionData.dataValues.id,
      };
      const token = UniversalFunctions.signToken(tokenData);

      return h.response({
        responseData: {
          token: token,
          email: user.email,
        },
      });
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Login With Mobile
   */
  loginWithMobile = async (req, h) => {
    try {
      const payload = req.payload;
      let user = await this.getUser(payload);
      if (!user) {
        return Boom.badRequest(req.i18n.__("NO_SUCH_USER_EXIST"));
      }
      user = user.dataValues;
      const userId = user.id;
      const identifier = "mobile";
      if (payload.verificationCode) {
        const verifyingCode = await this.verifyCodes(
          userId,
          payload.verificationCode,
          identifier,
          payload.pinId
        );

        if (!verifyingCode) {
          return Boom.badRequest(
            req.i18n.__("VERIFICATION_CODE_DOES_NOT_MATCH")
          );
        }
      } else if (payload.password) {
        const compareResult = await Bcrypt.compare(
          payload.password,
          user.password
        );
        if (!compareResult) {
          return Boom.badRequest(req.i18n.__("INVALID_PASSWORD"));
        }
      }

      const role = Constants.ROLES.USER_ROLE;
      let ip;
      if (req.headers["x-forwarded-for"]) {
        ip = req.headers["x-forwarded-for"];
      } else {
        ip = req.info.host;
      }
      let userProfile = await Models.userProfiles.findOne({
        where: { user_id: userId },
      });

      let sessionData = await this.createSession(user.id, role, ip);
      let userScope = [];
      userScope.push("user");
      const tokenData = {
        userId: user.id,
        scope: userScope,
        sessionId: sessionData.dataValues.id,
      };

      // const role = 2
      const token = UniversalFunctions.signToken(tokenData);

      return h.response({
        responseData: {
          userId: userId,
          token: token,
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          name: userProfile.dataValues.name,
        },
      });
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  loginWithOTP = async (req, h) => {
    try {
      const payload = req.payload;
      let user = await this.getUser(payload);
      if (!user) {
        return Boom.badRequest(req.i18n.__("NO_SUCH_USER_EXIST"));
      }
      user = user.dataValues;
      const userId = user.id;
      let pinId = 101;
      await this.insertLoginOTP(payload, userId, pinId);

      return h
        .response({
          message: req.i18n.__("OTP_SEND_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Update User Verification Code
   * @argument payload
   */
  updateUserVerificationCode = async (payload) => {
    try {
      let verificationCode;
      if (process.env.ENABLE_MASTER_CODE) {
        verificationCode = process.env.MASTER_CODE;
      } else {
        verificationCode = Math.floor(100000 + Math.random() * 900000);
      }

      let data = await Models.userVerifications.update(
        {
          verificationCode: verificationCode,
          codeExpiredAt: expiredDate,
        },
        {
          where: {
            verificationEntityValue: payload.mobile,
            verificationEntityType: Constants.VERIFICATION_ENTITY_TYPES.MOBILE,
            countryCode: payload.countryCode,
          },
        }
      );
      return data;
    } catch (e) {
      return e;
    }
  };

  /**
   * Check whether the mobile exist or not according to this redirect to signUp or login
   */
  mobileExist = async (req, h) => {
    try {
      const query = req.query;
      let verifyMobile = await this.verifyMobile(query);
      let isExist;
      if (verifyMobile) {
        isExist = true;
        //await this.updateUserVerificationCode(query);
      } else {
        isExist = false;
      }

      return h
        .response({
          responseData: {
            isExist,
          },
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Update the profile of the user
   */
  updateProfile = async (req, h) => {
    try {
      const payload = req.payload;
      /*   const encodedAuth = req.auth.credentials.payload.data;
            const decodedAuth =  await UniversalFunctions.decryptData(encodedAuth); */
      const authToken = req.auth.credentials.userData;
      const firstName = payload.firstName;
      const lastName = payload.lastName;
      const email = payload.email;
      const dob = typeof payload.dob != "undefined" ? payload.dob : null;
      const address =
        typeof payload.address != "undefined" ? payload.addres : null;
      const latitude =
        typeof payload.latitude != "undefined" ? payload.latitude : null;
      const longitude =
        typeof payload.longitude != "undefined" ? payload.longitude : null;
      const profileImage =
        typeof payload.profileImage_id != "undefined"
          ? payload.profileImage_id
          : null;
      

      let profile = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        address: address,
        dob: dob,
        latitude: latitude,
        longitude: longitude,
        profileImage_id: profileImage,
      };
      let checkExistProfile = await Models.userProfiles.findOne({
        where: {
          user_id: authToken.userId,
          isDeleted: 0,
        },
      });

      var checkEmail = await Models.userProfiles.findAll({
        where:{user_id:{[Op.ne]:authToken.userId},email:email}
      })

      if(checkEmail.length!==0)
      {
        return h.response({message:"Email already Exists"}).code(400)
      }


      let updateProfile;
      if (checkExistProfile && checkExistProfile.dataValues.id) {
        updateProfile = await Models.userProfiles.update(profile, {
          where: { user_id: authToken.userId },
        });
      } else {
        profile.user_id = authToken.userId;
        updateProfile = await Models.userProfiles.create(profile);
      }

      let userProfile = await Models.userProfiles.findOne({
        where: { user_id: authToken.userId },
        attributes: [
          "user_id",
          "firstName",
          "lastName",
          "email",
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

      return h
        .response({
          responseData: {
            userProfile,
          },
          message: "Successful",
        })
        .code(200);
    } catch (e) {
      console.log("&&&&&&&&&&&&update", e);
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * get the Profile of the user
   */
  getProfile = async (req, h) => {
    try {
      const authToken = req.auth.credentials.userData;

      let data = await Models.userProfiles.findOne({
        where: {
          user_id: authToken.userId,
        },
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
      });

      if (!data) {
        return Boom.badRequest(req.i18n.__("NO_PROFILE_FOUND_FOR_USER_ID"));
      }
      data = data.dataValues;

      return h.response({
        responseData: {
          data,
        },
      });
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Insert into reset Password
   * @argument userId
   */
  insertResetPassword = async (userId) => {
    try {
      let verificationCode;
      if (process.env.ENABLE_MASTER_CODE) {
        verificationCode = process.env.MASTER_CODE;
      } else {
        verificationCode = Math.floor(100000 + Math.random() * 900000);
      }

      const expiredDate = Moment(new Date())
        .add(1, "h")
        .format("YYYY-MM-DD HH:mm");

      let data = await Models.resetPasswords.create({
        user_id: userId,
        token: verificationCode,
        expiredAt: expiredDate,
      });
      return data;
    } catch (e) {
      return e;
    }
  };

  /**
   * Reset Password Initiate
   */
  resetPasswordInitiate = async (req, h) => {
    try {
      const payload = req.payload;
      let verificationMatch = await Models.users.findOne({
        where: {
          countryCode: payload.countryCode,
          mobile: payload.mobile,
          status: 1,
        },
      });
      if (!verificationMatch) {
        return Boom.badRequest(req.i18n.__("PLEASE_ENTER_VALID_CREDENTIALS"));
      }

      const userId = verificationMatch.dataValues.id;
      await this.insertResetPassword(userId);

      return h
        .response({
          message: req.i18n.__("RESET_TOKEN_SUCCESSFULLY_GENERATED"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Reset Password to reset the password
   */
  resetPassword = async (req, h) => {
    try {
      const payload = req.payload;
      let verificationMatch = await Models.users.findOne({
        where: {
          countryCode: payload.countryCode,
          mobile: payload.mobile,
          status: 1,
        },
      });
      if (!verificationMatch) {
        return Boom.badRequest(req.i18n.__("PLEASE_ENTER_VALID_CREDENTIALS"));
      }

      const userId = verificationMatch.dataValues.id;
      let verificationMatchToken;
      if (verificationMatch) {
        if (
          process.env.MASTER_CODE &&
          payload.verificationCode == process.env.MASTER_CODE
        ) {
          verificationMatchToken = await Models.resetPasswords.findOne({
            where: {
              user_id: userId,
            },
          });
        } else {
          verificationMatchToken = await Models.resetPasswords.findOne({
            where: {
              token: payload.verificationCode,
              user_id: userId,
            },
          });
        }
      }

      if (!verificationMatchToken) {
        return Boom.badRequest(req.i18n.__("ENTER_RESET_TOKEN_DOES_NOT_MATCH"));
      }

      let rounds = parseInt(process.env.HASH_ROUNDS);
      let userPassword = Bcrypt.hashSync(payload.password, rounds);
      await Models.users.update(
        { password: userPassword },
        { where: { id: userId } }
      );

      return h
        .response({
          message: req.i18n.__("PASSWORD_HAS_BEEN_UPDATED_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Change the Password of the user
   */
  changePassword = async (req, h) => {
    try {
      const authToken = req.auth.credentials.userData;
      const payload = req.payload;

      if (payload.oldPassword && payload.newPassword) {
        let rounds = parseInt(process.env.HASH_ROUNDS);
        let oldPassword = Bcrypt.hashSync(req.payload.oldPassword, rounds);
        let newPassword = Bcrypt.hashSync(req.payload.newPassword, rounds);
        const verificationMatch = await Models.users.findOne({
          where: {
            id: authToken.userId,
          },
        });

        let passwordVerification = Bcrypt.compareSync(
          payload.oldPassword,
          verificationMatch.dataValues.password
        );

        if (!passwordVerification) {
          return Boom.badRequest(req.i18n.__("UNABLE_TO_VERIFY_OLD_PASSWORD"));
        }

        if (passwordVerification) {
          let updatePassword = await Models.users.update(
            {
              password: newPassword,
            },
            { where: { id: authToken.userId } }
          );
        }
      }

      return h
        .response({
          message: req.i18n.__("PASSWORD_HAS_BEEN_UPDATED_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  /**
   * Logout the account of the user
   */
  logout = async (req, h) => {
    try {
      const authToken = req.auth.credentials.userData;

      await Models.userAccesses.destroy({
        where: {
          id: authToken.sessionId,
        },
        force: true,
      });

      return h
        .response({
          message: req.i18n.__("SUCCESSFULLY_LOGOUT"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  updateMobileInitiate = async (req, h) => {
    try {
      const payload = req.payload;
      const authToken = req.auth.credentials.userData;
      let verifyMobileData = await this.verifyMobile(payload);

      if (verifyMobileData) {
        return h.response({message:'User Exists'});
      }

      var verificationCode = Math.floor(1000 + Math.random() * 9000)
      var dataSent = await client.messages.create({
        body: `${verificationCode} is the OTP for accessing your Lyfe account        Mvd7Jq9qU6s`,
        from: '+18582392003',
        to: `${payload.countryCode}${payload.mobile}`
      })

      let data = await Models.userVerifications.update(
        {
          verificationEntityType: "mobile",
          verificationEntityValue: payload.mobile,
          countryCode: payload.countryCode,
          verificationCode:verificationCode
        },
        { where: { user_id: authToken.userId } }
      );

      console.log("SCCCCCCCCDDDCCCCDC", data);

      return h
        .response({
          message: req.i18n.__("PHONE_VERIFICATION_CODE_SENT_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  updateMobile = async (req, h) => {
    try {
      const payload = req.payload;
      const authToken = req.auth.credentials.userData;
      const identifier = "mobile";
      const verifyingCode = await this.verifyCode(
        authToken.userId,
        payload.verificationCode,
        identifier,
        payload.pinId
      );
      if (!verifyingCode) {
        return Boom.badRequest(req.i18n.__("VERIFICATION_CODE_DOES_NOT_MATCH"));
      } else {
        await Models.users.update(
          {
            mobile: payload.mobile,
            countryCode: payload.countryCode,
          },
          {
            where: {
              id: authToken.userId,
            },
          }
        );
      }

      return h
        .response({
          message: req.i18n.__("PHONE_NO_SUCCESSFULLY_UPDATED"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  insertUserBoth = async (payload) => {
    try {
      let data = await Models.users.create({
        mobile: payload.mobile,
        countryCode: payload.countryCode,
        password: payload.password,
        status: Constants.VERIFICATION_STATUS.UNVERIFIED,
        profileStatus: Constants.PROFILE_STATUS.INCOMPLETE,
        role_id: Constants.ROLES.USER_ROLE,
      });
      return data;
    } catch (e) {
      return e;
    }
  };

  getTemplate = async (title) => {
    try {
      let data = await Models.emailTemplates.findOne({
        where: {
          title: title,
          isDeleted: 0,
        },
      });
      return data;
    } catch (e) {
      return e;
    }
  };

  signUpWithBoth = async (req, h) => {
    try {
      const payload = req.payload;
      let verifyMobileData = await this.verifyMobile(payload);
      let verifyEmailData = await this.verifyEmail(payload);
      if (verifyMobileData) {
        return Boom.badRequest(
          req.i18n.__("USER_EXIST_WITH_GIVEN_PHONE_NUMBER")
        );
      }
      if (verifyEmailData) {
        return Boom.badRequest(req.i18n.__("USER_EXIST_WITH_GIVEN_EMAIL"));
      }
      if (!verifyMobileData && !verifyEmailData) {
        await this.deleteUnVerifiedUser(payload);
      }

      let rounds = parseInt(process.env.HASH_ROUNDS);
      payload.password = await Bcrypt.hashSync(payload.password, rounds);
      let insertUser = await this.insertUserBoth(payload);
      let userId = insertUser.dataValues.id;

      let insertVerifyUser = await this.insertVerifyUser(payload, userId);

      let codeToSend =
        insertVerifyUser.dataEmail.dataValues.verificationCodeRef;
      let emailToSend =
        insertVerifyUser.dataEmail.dataValues.verificationEntityValue;
      let userProfile = await this.insertUserProfile(userId, payload.name);
      let username = userProfile.dataValues.name;
      let template = await this.getTemplate("Email Verification");
      let subject = template.dataValues.subject;
      let title = template.dataValues.title;
      let templates = template.dataValues.body;
      let replacements = {
        name: username,
        code: codeToSend.toString(),
      };
      Emails.sendEmail(
        process.env.SMTP_USERNAME,
        emailToSend,
        subject,
        "",
        templates,
        replacements
      );
      return h
        .response({
          responseData: {
            userId: userId,
            mobile: payload.mobile,
            countryCode: payload.countryCode,
            email: payload.email,
            name: payload.name,
          },
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  resendVerificationCode = async (req, h) => {
    try {
       const query = req.query
      // if(payload.type == 1){

      // }else if(payload.type ==2){

      // }
      console.log('AAAAAAAAAAAAAAAA',query)
      var verificationCode = Math.floor(1000 + Math.random() * 9000)
      var dataSent = await client.messages.create({
        body: `${verificationCode} is the OTP for accessing your Lyfe account        Mvd7Jq9qU6s`,
        from: '+18582392003',
        to: `${query.countryCode}${query.mobile}`
      })

      const otp = await Models.userVerifications.update({
        verificationCode:verificationCode
      },{
        where:{user_id:query.userId}
      }) 


      return h
        .response({
          message: req.i18n.__("RESEND_VERIFICATION_CODE_SEND_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
     console.log('SSSSSSSSS',e)
    }
  };
  /* 
  createSessionguest = async (ip) => {
    try {
      let data = await Models.userAccesses.create({
      
        ip: ip,
   
      });
      return data;
    } catch (e) {
      console.log('sssssssssssss',e);
    }
  }; */

  /* guestToken=async(req,h)=>{
    try{
    let ip;
    if (req.headers["x-forwarded-for"]) {
      ip = req.headers["x-forwarded-for"];
    } else {
      ip = req.info.host;
    }
    var val = Math.floor(1000 + Math.random()*9000)
    let userScope = [];
    userScope.push("guest");
    const tokenData = {
      scope: userScope,
      sessionId: val,
    };
    const token = UniversalFunctions.signToken(tokenData);

    return h.response({
      responseData:{
        token:token
      }
    })
  }
  catch(e){
      console.log('@@@@@@@@@@@@@@@@',e)
  }

} */

  //update mobile verfication otp
  UpdateMobileOtpVerification = async (req, h) => {
    try {
      const payload = req.payload;
      const authToken = req.auth.credentials.userData;

      let verifyingCode = await this.verifyCode(
        authToken.userId,
        payload.verificationCode,
        payload.identifier
      );

      console.log(authToken, "authToken");

      if (!verifyingCode) {
        return Boom.badRequest(req.i18n.__("VERIFICATION_CODE_DOES_NOT_MATCH"));
      }

      await this.updateUserVerification(authToken.userId, payload.identifier);

      let data = await Models.users.update(
        {
          mobile: payload.mobile,
          countryCode: payload.countryCode,
          country: payload.country,
        },
        {
          where: {
            id: authToken.userId,
          },
        }
      );

      let user = await this.updateUserStatus(authToken.userId);

      return h.response({
        message: "Number Updated Successfully",
      });
    } catch (e) {
      console.log("###########edit", e);
    }
  };

  addAddress=async(request,h)=>{
    try{
          var authToken=request.auth.credentials.userData;
          var data = request.payload
          if(data.id)
          {
            const check = await Models.userAddress.findOne({where:{id:data.id}})
            if(!check)
            {
              return h.response({message:"Enter valid id"})
            }
            const update=await Models.userAddress.update({
              userLatitude:data.userLatitude,
              userLongitude:data.userLongitude,
              address:data.address,
              other:data.other,
              type:data.type,
              houseNo:data.houseNo,
              buildingName:data.buildingName,
              pinCode:data.pinCode,
              state:data.state,
              city:data.city,
            },{
              where:{user_id:authToken.userId,id:data.id}
            })

            return h.response({message:"updated"})
          }
         var add = await Models.userAddress.create({
            user_id:authToken.userId,
            userLatitude:data.userLatitude,
            userLongitude:data.userLongitude,
            address:data.address,
            other:data.other,
            type:data.type,
            isDeleted:false,
            buildingName:data.buildingName,
            houseNo:data.houseNo,
            pinCode:data.pinCode,
            state:data.state,
            city:data.city,
          })

          console.log('SSSSSSSSs',add)

          return h.response({
            responseData:{
              address:add
            }
          })

    }
    catch(e)
    {
      console.log('SSSSSSSSs',e)
    }
  }

  getAddress=async(request,h)=>{
    try{

      var authToken=request.auth.credentials.userData
      var address = await Models.userAddress.findAll({
        attributes:['id','address','houseNo','buildingName','type','other','userLatitude','userLongitude'],
        where:{user_id:authToken.userId,isDeleted:false}
      })

      return h.response({
        responseData:{
          address
        }
      })

    }
    catch(e){
      console.log('SSSSSSSSSSS',e)

    }
  }

  deleteAddress=async(request,h)=>{
    try{
        var authToken=request.auth.credentials.userData
        const check = await Models.userAddress.findOne({where:{id:request.query.id}})
        if(!check)
        {
          return h.response({message:"Enter valid id"})
        }

        const deleteData = await Models.userAddress.update({
          isDeleted:true
        },{
          where:{id:request.query.id,user_id:authToken.userId}
        })

        return h.response({message:'Deleted'})
    }
    catch(e)
    {
      console.log('SSSSSSSSSS',e)
    }
  }
}

module.exports = new User();
