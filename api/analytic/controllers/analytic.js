"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const moment = require("moment");

const getTwelveMonths = () => {
  const months = [];
  const dateStart = moment();
  const dateEnd = moment().add(12, "month");

  while (dateEnd.diff(dateStart, "months") >= 0) {
    months.unshift(dateStart.format("L"));
    dateStart.add(1, "month");
  }

  return months;
};

module.exports = {
  getStatistics: async (ctx) => {
    const startDate = new Date(ctx.request.body.startDate);
    const endDate = new Date(ctx.request.body.endDate);
    const storeId = ctx.request.body.storeId;
    if (!startDate || !endDate) return;

    if (storeId) {
      return await ifStoreIdExistMethod(storeId, startDate, endDate);
    }
    return await ifStoreIdNotExistMethod(startDate, endDate);
  },

  getStatsTwelveMonth: async (ctx) => {
    const storeId = ctx.request.body.storeId;

    if (storeId) {
      return await ifRestourantExistMethod(storeId);
    }

    return await ifRestourantNotExistMethod();
  },
};

const ifRestourantExistMethod = async (storeId) => {
  const completeStats = [];

  for (let i = 0; i < getTwelveMonths().length; i++) {
    const monthNumber = new Date(getTwelveMonths()[i]);

    var firstDay = new Date(
      monthNumber.getFullYear(),
      monthNumber.getMonth(),
      1
    );
    var lastDay = new Date(
      monthNumber.getFullYear(),
      monthNumber.getMonth() + 1,
      0
    );

    const stats = await ifStoreIdExistMethod(storeId, firstDay, lastDay);
    completeStats.push(stats.bottomStatistics);
  }

  completeStats.splice(0, 1, completeStats[completeStats.length - 1]);
  completeStats.splice(-1, 1);

  return completeStats;
};

const ifRestourantNotExistMethod = async () => {
  const allStores = await strapi.query("store").find({});

  const completeStats = [];

  for (let i = 0; i < getTwelveMonths().length; i++) {
    const monthNumber = new Date(getTwelveMonths()[i]);

    var firstDay = new Date(
      monthNumber.getFullYear(),
      monthNumber.getMonth(),
      1
    );
    var lastDay = new Date(
      monthNumber.getFullYear(),
      monthNumber.getMonth() + 1,
      0
    );
    let finalStats = {
      profit: 0,
      revenue: 0,
      totalCost: 0,
      utitsSold: 0
    }
    for (let s = 0; s < allStores.length; s++) {
      const stats = await ifStoreIdExistMethod(allStores[s].id, firstDay, lastDay);
      finalStats.profit = stats.bottomStatistics.profit;
      finalStats.revenue = stats.bottomStatistics.revenue;
      finalStats.totalCost = stats.bottomStatistics.totalCost;
      finalStats.utitsSold = stats.bottomStatistics.utitsSold;
    }
    completeStats.push(finalStats);
  }

  completeStats.splice(0, 1, completeStats[completeStats.length - 1]);
  completeStats.splice(-1, 1);

  return completeStats;
};

//  ------------------------------------------------------------------------------------

const ifStoreIdExistMethod = async (storeId, startDate, endDate) => {
  var foundStore = await strapi.query("store").findOne({
    id: storeId,
  });
  if (!foundStore) return;

  const topStatistics = { sales: 0, customers: 0, inbox: 0 };
  const bottomStatistics = await getStatistics(
    foundStore.orders ? foundStore.orders : [],
    startDate,
    endDate
  );

  {
    const rangedOrders = await getRangeOrder(
      foundStore.orders ? foundStore.orders : [],
      startDate,
      endDate
    );

    topStatistics.sales += rangedOrders.length;

    const usersList = [];

    for (const order of rangedOrders) {
      const user = await strapi
        .query("user", "users-permissions")
        .findOne({ id: order.user }, ["notifications.user.name"]);

      if (user) {
        usersList.push(user.id);
      }
    }

    const uniqUsersList = usersList.filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });

    topStatistics.customers += uniqUsersList.length;
  }

  {
    const rangedChats = await getRangeOrder(
      foundStore.chats,
      startDate,
      endDate
    );

    for (const chat of rangedChats) {
      const foundChat = await strapi
        .query("chat")
        .findOne({ id: chat.id }, ["chat_messages"]);

      if (foundChat && foundChat.chat_messages) {
        topStatistics.inbox += foundChat.chat_messages.length;
      }
    }
  }

  return { topStatistics, bottomStatistics };
};

const ifStoreIdNotExistMethod = async (startDate, endDate) => {
  const allStores = await strapi.query("store").find({});

  const topStatistics = { sales: 0, customers: 0, inbox: 0 };
  const bottomStatistics = {
    utitsSold: 0,
    revenue: 0,
    totalCost: 0,
    profit: 0,
  };

  for (const store of allStores) {
    const orders = store.orders ? store.orders : [];

    {
      const stats = await getStatistics(orders, startDate, endDate);
      bottomStatistics.utitsSold += stats.utitsSold;
      bottomStatistics.revenue += stats.revenue;
      bottomStatistics.totalCost += stats.totalCost;
      bottomStatistics.profit += stats.profit;
    }

    {
      const rangedOrders = await getRangeOrder(orders, startDate, endDate);
      topStatistics.sales += rangedOrders.length;
    }

    {
      const usersList = [];

      const rangedOrders = await getRangeOrder(orders, startDate, endDate);

      for (const order of rangedOrders) {
        const user = await strapi
          .query("user", "users-permissions")
          .findOne({ id: order.user }, ["notifications.user.name"]);

        if (user) {
          usersList.push(user.id);
        }
      }

      const uniqUsersList = usersList.filter((item, pos, self) => {
        return self.indexOf(item) == pos;
      });

      topStatistics.customers += uniqUsersList.length;
    }

    {
      const rangedChats = await getRangeOrder(store.chats, startDate, endDate);

      for (const chat of rangedChats) {
        const foundChat = await strapi
          .query("chat")
          .findOne({ id: chat.id }, ["chat_messages"]);

        if (foundChat && foundChat.chat_messages) {
          topStatistics.inbox += foundChat.chat_messages.length;
        }
      }
    }
  }

  return { topStatistics, bottomStatistics };
};

const getStatistics = async (orders, startDate, endDate) => {
  let utitsSold = 0;
  let revenue = 0;
  let totalCost = 0;
  let profit = 0;

  const rangedOrders = await getRangeOrder(orders, startDate, endDate);

  for (const [index, order] of rangedOrders.entries()) {
    var foundOrder = await strapi.query("order").findOne(
      {
        id: order.id,
      },
      ["products"],
      ["orderDetails"],
      ["totalPrice"]
    );

    revenue += order.totalPrice;

    foundOrder.orderDetails.forEach((detail) => {
      utitsSold += detail.quantity;
    });

    foundOrder.products.forEach((product, index) => {
      foundOrder.orderDetails.forEach((detail, idx) => {
        if (idx === index) {
          if (
            detail.sku &&
            product.optionalFinishMaterialEnabled &&
            product.optionalFinishMaterialPrice
          ) {
            for (let [key, value] of Object.entries(product.shineonIds)) {
              if (value === detail.sku) {
                Object.keys(product.shineonIds).forEach((el, i) => {
                  if (key === el) {
                    if (i === 1 || i === 3) {
                      totalCost += product.optionalFinishMaterialPrice;
                    }
                  }
                });
              }
            }
          }

          if (
            detail.properties &&
            product.engraveAvailable &&
            product.engravePrice
          ) {
            const isExist = Object.keys(detail.properties).some((el) =>
              el.includes("Line")
            );

            if (isExist) {
              totalCost += product.engravePrice;
            }
          }
        }
      });

      if (product.price) {
        totalCost += product.price;
      }
    });
  }

  profit = revenue - totalCost;

  return { utitsSold, revenue, totalCost, profit };
};

const getRangeOrder = async (orders, startDate, endDate) => {
  return orders.filter((order) => {
    const aaa = order.createdAt >= startDate && order.createdAt <= endDate;

    return aaa;
  });
};
