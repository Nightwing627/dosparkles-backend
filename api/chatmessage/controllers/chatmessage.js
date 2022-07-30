"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

var FCM = require("fcm-node");
var serverKey =
  "AAAAOj9GnCo:APA91bFglOWtm-RueDQO1kT0lRWfpeUGrEBm5gHYpDMKTnkaTkFiud8QKWGGq3enSBXNw3tFjU76GCiYD2GDdsgsiK4_bc9kTwwKGIAfIUk9OVQWCO-yL0882rIFCS9_JZdDcKMvVeuu"; //put your server key here
var fcm = new FCM(serverKey);

function sendNotificationToPerson(to, title, body) {
  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to, //"ehDIoDTCAW0:APA91bGALGNpxF-suCeoR-Rf5X-XuFU-Jq9DTnVPxaNiIvcWMnqPxVY10b7hnFMnjieDou2-E2DHE665vfkOw0P7FbM0hYKl-wk8gvHa-doWasYCHf2OgBDT7aRsSTM0uZAo0oXWmmDG"
    // collapse_key: 'your_collapse_key',

    notification: {
      title,
      body,
      sound: "default",
    },

    // data: {  //you can send only notification or only data(or include both)
    //     my_key: 'my value',
    //     my_another_key: 'my another value'
    // }
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

module.exports = {
  find: async (ctx) => {
    return [];
  },

  create: async (ctx) => {
    var body = ctx.request.body;
    // console.log('messageBody: ', body);
    // console.log("ctx.state.user", ctx.state.user);

    var chat = await strapi.query("chat").findOne(
      {
        id: body.chat,
      },
      ["users"]
    );
    // console.log('chat', chat);
    for (let i = 0; i < chat.users.length; i++) {
      if (
        parseInt(chat.users[i].id) != parseInt(ctx.state.user.id) &&
        chat.users[i].pushToken
      ) {
        sendNotificationToPerson(
          chat.users[i].pushToken,
          `${ctx.state.user.firstName} ${ctx.state.user.lastName}`,
          body.text
        );
      }
    }

    const entity = await strapi.services.chatmessage.create(body);

    return entity;
  },
};
