"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const parsePhoneNumber = require("libphonenumber-js");

// const accountSid = "AC9d5a336b87233c5f2e9d5ce63edfcb81"; // Your Account SID from www.twilio.com/console
// const authToken = "21db88b26d1cb917b38b914d1c3f05ce"; // Your Auth Token from www.twilio.com/console
// const phoneNumberFrom = "+12084818166";
// const twilio = require("twilio");
// const clientTwilio = new twilio(accountSid, authToken, {
//   logLevel: "debug",
// });

const accountSid = "AC3bbba87ebad2370cb36ba51b2d8b67e9"; // Your Account SID from www.twilio.com/console
const authToken = "c5cc41a1554febead1ee6acc0eb2d308"; // Your Auth Token from www.twilio.com/console
const phoneNumberFrom = "+15613366447";
const twilio = require("twilio");
const clientTwilio = new twilio(accountSid, authToken, {
  logLevel: "debug",
});

module.exports = {
  inviteRequest: async (ctx) => {
    var data = JSON.parse(ctx.request.body.data);
    var userId = ctx.request.body.id;
    var referralLink = ctx.request.body.referralLink;

    let itemsToAdd = [];

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ id: userId });

    for (let contact of data) {
      if (!contact.phone || !contact.name) {
        console.error("inviteRequest: incorrect data");
        continue;
      }

      try {
        const phoneNumber = parsePhoneNumber(contact.phone, "US");

        await clientTwilio.messages
          .create({
            body: `${referralLink}`,
            to: phoneNumber.number, // Text this number
            from: phoneNumberFrom, // From a valid Twilio number
          })
          .then((message) => console.log(message.sid));

        const isIncludes = user.invitesSent.some(
          (el) => el.phone == contact.phone
        );

        if (isIncludes) {
          await strapi.query("user", "users-permissions").update(
            { id: userId },
            {
              invitesSent: user.invitesSent.map((el) => {
                if (el.phone == contact.phone) {
                  return {
                    name: contact.name,
                    phone: contact.phone,
                    date: Date.now(),
                    smsSent: true,
                    confirmed: false,
                  };
                }
                return el;
              }),
            }
          );

          return user;
        }

        itemsToAdd.push({
          name: contact.name,
          phone: contact.phone,
          date: Date.now(),
          smsSent: true,
          confirmed: false,
        });
      } catch (err) {
        console.log("sms notification error", err);
      }
    }

    await strapi.query("user", "users-permissions").update(
      { id: userId },
      {
        invitesSent: [...(user.invitesSent || []), ...itemsToAdd],
      }
    );

    // console.log("USER : ", user.invitesSent);

    return user;
  },
  inviteConfirm: async (ctx) => {
    var referralLink = ctx.request.body.referralLink;
    var phoneNumber = ctx.request.body.phoneNumber;
    console.log(
      "referralLink : " + referralLink,
      "phoneNumber : " + phoneNumber
    );

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ referralLink });

    let invitesSent = user.invitesSent || [];

    let isExist = invitesSent.some((el) => el.phone == phoneNumber);

    if (!isExist) {
      invitesSent = [...invitesSent, { phone: phoneNumber }];
    }

    await strapi.query("user", "users-permissions").update(
      { id: user.id },
      {
        invitesSent: invitesSent.map((el) => {
          if (el.phone == phoneNumber) {
            el.confirmed = true;
          }
          return el;
        }),
      }
    );

    return user;
  },
};
