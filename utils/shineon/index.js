"use strict";

const rp = require("request-promise");
const fs = require("fs");

var config = require("./config/config.js");
const util = require("util");

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

// utility

function getRequestOptions(
  auth = false,
  url,
  rmethod = "GET",
  body = undefined
) {
  var request_options = {
    method: rmethod,
    url: config.shineon_api_uri + url,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth ? "Bearer " + config.shineon_api_token : undefined,
    },
    body,
    json: !!body
  };
  return request_options;
}

// logic

async function whoami() {
  var response = rp(getRequestOptions(true, "/whoami", "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

// ORDERS

async function getAllOrders() {
  var response = rp(getRequestOptions(true, `/orders`, "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

async function getOrder(orderId) {
  var response = rp(getRequestOptions(true, `/orders?id=${orderId}`, "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

async function createOrder(data) {
  var body = {
    "order": data
  };
  //  data: {
  //  source_id
  //  email
  //  line_items
  //  shipping_address
  //  total_price
  //  total_weight
  //  name
  //  phone
  //  email
  //  shipping_method
  //  source_name
  //  store_customer_id
  //  }
  body.order.shipment_notification_url =
    "https://backend.dosparkles.com/shineon/shipmentNotification";

  // console.log("shineOne createOrder:");
  // console.log(util.inspect(body, { showHidden: false, depth: null }));
  // console.log(JSON.stringify(body));

  var response = rp(getRequestOptions(true, `/orders`, "POST", body))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

//This endpoint will only be available while the order status is set to: on_hold, awaiting_payment
async function updateOrder(orderId, data) {
  var body = data;
  var response = rp(getRequestOptions(true, `/orders/${orderId}`, "PUT", body))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

//Order Status
// on_hold - order not ready to be invoiced/produced.
// awaiting_payment - order ready to be invoiced/produced.
// in_production - order in production.
// shipped - order was fulfilled.
// cancelled - order was cancelled.

async function holdOrder(orderId) {
  var response = rp(getRequestOptions(true, `/orders/${orderId}/hold`, "POST"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

async function releaseOrder(orderId) {
  var response = rp(getRequestOptions(true, `/orders/${orderId}/ready`, "POST"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

async function cancelOrder(orderId) {
  var response = rp(
    getRequestOptions(true, `/orders/${orderId}/cancel`, "POST")
  )
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

// SKUs

async function getAllSkus() {
  var response = rp(getRequestOptions(true, `/skus`, "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

async function getSku(skuId) {
  var response = rp(getRequestOptions(true, `/skus/${skuId}`, "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

// RENDERS

async function getRender(renderId) {
  var response = rp(getRequestOptions(true, `/renders/${renderId}`, "GET"))
    .then(function (parsedBody) {
      var jsonObj = parsedBody;
      return JSON.parse(jsonObj);
    })
    .catch(function (err) {
      console.error(err);
    });
  return response;
}

module.exports = {
  whoami,
  // orders:
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  holdOrder,
  releaseOrder,
  cancelOrder,
  // skus:
  getAllSkus,
  getSku,
  // renders:
  getRender,
};
