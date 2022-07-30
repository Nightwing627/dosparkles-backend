"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
var shineon = require("../../../utils/shineon/index");

module.exports = {
  shipmentNotification: async (ctx) => {
    var body = ctx.request.body;
    // console.log("shipmentNotification", body);

    if (body.order) {
      const orderRelevant = await strapi
        .query("order")
        .findOne({ shineonId: body.order.id });

      if (!orderRelevant) {
        console.error("order not found", body.order);
        return;
      }

      await strapi.services.order.update(
        { _id: orderRelevant._id },
        {
          shipmentDetails: body.order.line_items,
        }
      );
    }
  },
};
