"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#cron-tasks
 */

var shineon = require("../../utils/shineon/index");

async function checkProducts() {
  try {
    const allProducts = await strapi.query("product").find();
    var getAllSkusResponse = await shineon.getAllSkus();

    for (let p = 0; p < allProducts.length; p++) {
      var found = null;
      for (let i = 0; i < getAllSkusResponse.skus.length; i++) {
        if (getAllSkusResponse.skus[i].sku.includes(allProducts[p].shineonImportId)) {
          found = getAllSkusResponse.skus[i];
          break;
        }
      }

      await strapi.services.product.update(
        { _id: allProducts[p]._id },
        {
          isActive: found != null,
          basePrice: found.base_cost,
        }
      );
    }
  } catch (err) {
    console.error("checkProducts", err);
  }
}

async function checkOrders() {
  try {
    const allOrders = await strapi.query("order").find();
    var getAllOrdersResponse = await shineon.getAllOrders();
    // console.log(getAllOrdersResponse);

    for (let o = 0; o < allOrders.length; o++) {
      for (let i = 0; i < getAllOrdersResponse.orders.length; i++) {
        if (
          getAllOrdersResponse.orders[i].id + "" == allOrders[o].shineonId &&
          getAllOrdersResponse.orders[i].status != allOrders[o].status
        ) {
          await strapi.services.order.update(
            { _id: allOrders[o]._id },
            {
              status: getAllOrdersResponse.orders[i].status,
              cancelReason: getAllOrdersResponse.orders[i].cancel_reason,
            }
          );
        }
      }
    }
  } catch (err) {
    console.error("checkOrders", err);
  }
}

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }
  //
  // “At 14:00.” //5:00
  "0 11 * * *": async () => {
    checkProducts();
  },
  //every two hours
  "0 */2 * * *": async () => {
    checkOrders();
  },
};
