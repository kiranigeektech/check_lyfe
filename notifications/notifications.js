const admin = require("firebase-admin");
const serviceAccount = require("./lyfe-a27a5-firebase-adminsdk-uerfw-7adffbddd4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function sendMessage(registrationToken, notificationData) {
  const message = {
    data: notificationData,
    notification: {
      title: notificationData.title,
      body: notificationData.body,
    },
    token: registrationToken,
  };

 console.log('SSSSSSs',message)

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

function sendMulticastMessage(registrationTokens, notificationData) {
  const message = {
    data: notificationData,
    notification: {
      title: notificationData.title,
      body: notificationData.body,
    },
    tokens: registrationTokens,
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      }
    });
}



module.exports = {
  sendMessage,
  sendMulticastMessage,
};
