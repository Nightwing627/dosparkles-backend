"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

var FCM = require("fcm-node");
var serverKey =
  "AAAAQ8xNIBM:APA91bEOUNhH3FD5I9tG56bfEfyffBzsSMt2tX88iqCAoQsF7LWo-6I1MI4wj8k0LlLG1GHuWnd0ggCRWODhAletrm4QVGzGNYWZlNm-BQ6-LtEirhKRbxq3lVyAQhwO9-xRgt5bqlM2"; //put your server key here

var fcm = new FCM(serverKey);

function sendNotificationToPerson(to, isApproved) {
  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to, //"ehDIoDTCAW0:APA91bGALGNpxF-suCeoR-Rf5X-XuFU-Jq9DTnVPxaNiIvcWMnqPxVY10b7hnFMnjieDou2-E2DHE665vfkOw0P7FbM0hYKl-wk8gvHa-doWasYCHf2OgBDT7aRsSTM0uZAo0oXWmmDG"
    // collapse_key: 'your_collapse_key',

    notification: {
      title: `${isApproved ? "Approved" : "Cancelled"}`,
      body: `Your order was ${isApproved ? "Approved" : "Cancelled"}!`,
      sound: "default",
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!", err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

module.exports = {
  sendPushNotification: async (ctx) => {
    var orderId = ctx.request.body.orderId;
    var isApproved = ctx.request.body.status;
    //  console.log("--------- ", orderId, "----------- ", isApproved);

    if (!orderId || !isApproved == null) return;

    var order = await strapi.query("order").findOne({
      id: orderId,
    });
    var user = await strapi.query("user", "users-permissions").findOne({
      id: order.user.id,
    });

    if (!user.pushToken) return;

    sendNotificationToPerson(user.pushToken, isApproved);

    return order;
  },
};
