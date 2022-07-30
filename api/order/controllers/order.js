"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
var shineon = require("../../../utils/shineon/index");

const { sanitizeEntity } = require("strapi-utils");

const stripe = require("stripe")(
  "sk_test_51BSxCtFj8oaURoL4pglpziovSWPBE8HvlX7oQQXi0HtF7y3XM5v8BQP8018kQF9czbJ19LhBmjsGFbIJej0VGx7y00UvZ2XNEz"
);

module.exports = {
  create: async (ctx) => {
    var body = ctx.request.body;

    if (body.cardToken) {
      try {
        let payment = await stripe.charges.create({
          amount: Math.floor(body.totalPrice * 100),
          currency: "usd",
          description: "test description",
          source: body.cardToken,
        });

        if (
          !payment ||
          payment.amount == null ||
          payment.amount_captured == null
        ) {
          return "Stripe error occured!";
        }

        body.chargeToken = payment.id;
      } catch (error) {
        console.error(error);
        return "Stripe error occured!";
      }
    } else {
      return "cardToken absent!";
    }

    body.user = ctx.state.user ? ctx.state.user.id : undefined;

    if (body.orderDetails && Array.isArray(body.orderDetails)) {
      for (let i = 0; i < body.orderDetails.length; i++) {
        if (body.orderDetails[i].properties) {
          var tempOrderDetails = JSON.stringify(
            body.orderDetails[i].properties
          );
          body.orderDetails[i].properties = JSON.parse(
            tempOrderDetails
              .split("Engraving_Font")
              .join("Engraving Font")
              .split("Engraving_Line_")
              .join("Engraving Line ")
          );
        }
      }
    }

    const entity = await strapi.services.order.create(body);

    //  console.log("entity.orderDetails: ", entity.orderDetails);

    try {
      var shineonOrder = await shineon.createOrder({
        source_id: entity._id.toString(),
        email: ctx.state.user ? ctx.state.user.email : "admin@dosparkles.com",
        line_items: entity.orderDetails,
        shipping_address: ctx.state.user.shippingAddress,
      });

      entity.shineonId = shineonOrder.order.id;

      await strapi.services.order.update(
        { _id: entity._id },
        {
          shineonId: entity.shineonId,
        }
      );
    } catch (err) {
      console.log("Error while creating shineon order: ", err);
    }

    //  console.log(`shineonOrder: ${shineonOrder}`);
    // console.log("entity", entity);

    return entity;

    // return sanitizeEntity(entity, { model: strapi.models.order });
  },
  update: async (ctx) => {
    var body = ctx.request.body;

    const entity = await strapi.services.order.update(
      { _id: ctx.params.id },
      body
    );

    //TODO: process change of line_items

    return entity; // sanitizeEntity(entity, { model: strapi.models.order });
  },
  holdOrder: async (ctx) => {
    var body = ctx.request.body;

    const orderRelevant = await strapi.query("order").findOne({ _id: body.id });

    if (orderRelevant && orderRelevant.shineonId) {
      await shineon.holdOrder(orderRelevant.shineonId);
    }
  },
  releaseOrder: async (ctx) => {
    var body = ctx.request.body;

    const orderRelevant = await strapi.query("order").findOne({ _id: body.id });

    if (orderRelevant && orderRelevant.shineonId) {
      await shineon.releaseOrder(orderRelevant.shineonId);
    }
  },
  cancelOrder: async (ctx) => {
    var body = ctx.request.body;

    const orderRelevant = await strapi.query("order").findOne({ _id: body.id });

    if (body.cancelReason) {
      await strapi.services.order.update(
        { _id: body.id },
        { cancelReason: body.cancelReason }
      );
    }

    if (orderRelevant && orderRelevant.shineonId) {
      await shineon.cancelOrder(orderRelevant.shineonId);
    }
  },
};

// async function testOrderCreation() {
//   var shineonOrder = null;
//   try {
//     shineonOrder = await shineon.createOrder({
//       source_id: "60074efd6c5c13124eb99741",
//       email: "1@1.com",
//       line_items: [
//         {
//           store_line_item_id: "5ffb4b584261e92f37b6144f",
//           sku: "SO-2144184",
//           quantity: 1,
//         },
//       ],
//       shipping_address: {
//         name: "Bob Norman",
//         address1: "580 W Palm Dr",
//         city: "Florida City",
//         zip: "33034",
//         country_code: "US",
//         state: "FL",
//       },
//     });
//   } catch (err) {
//     console.log("Error while creating shineon order: ", err);
//   }

//   //  console.log(`testshineonOrder: ${shineonOrder}`);
// }

// testOrderCreation();
