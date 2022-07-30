"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

const { sanitizeEntity } = require("strapi-utils");
var shineon = require("../../utils/shineon/index");
const fetch = require("node-fetch");
var FormData = require("form-data");

console.log('shineonAPI', shineon)

async function fetchProductDetails(strapi, entry) {
  const productDetails = await shineon.getSku(entry.shineonImportId);
  console.log(productDetails);

  entry.name = productDetails.title;
  entry.basePrice = productDetails.base_cost;
  entry.properties = productDetails.properties;
  entry.engraveAvailable = parseInt(productDetails.properties.engravings) > 0;
  entry.uploadsAvailable =
    parseInt(productDetails.properties.buyer_uploads) > 0;
  entry.sizeOptionsAvailable =
    parseInt(productDetails.properties.size_option) > 0;

  entry.defaultFinishMaterial = productDetails.properties.metal;

  if (productDetails.renders) {
    const filesUploaded = [];

    for (let i = productDetails.renders.length - 1; i >= 0; i--) {
      console.log(productDetails.renders[i]);
      if (
        productDetails.renders[i].layers &&
        productDetails.renders[i].layers.top_src
      ) {
        const imageBuffer = await fetch(
          productDetails.renders[i].layers.top_src
        ).then((response) => response.buffer());
        const formData = new FormData();
        formData.append("files", imageBuffer, {
          filename: productDetails.renders[i].layers.top_src.split("/").pop(),
        });
        const uploadResult = await fetch(
          `http://localhost:${process.env.PORT}/upload`,
          {
            method: "POST",
            body: formData,
          }
        ).then((response) => response.json());

        filesUploaded.push(uploadResult[0]._id);
      }
    }

    entry.media = filesUploaded;

   
  }

  const entity =  await strapi.query("product").update( { id: entry.id }, entry);
  console.log('entity', entity);
  // await strapi.services.product.update(
  //   { _id: entry._id },
  //   entry
  // );
  return sanitizeEntity(entity, { model: strapi.models.product });
}

module.exports = () => {
  console.log(strapi.eventHub._events);
  const entryOnCreateWebhook = strapi.eventHub._events["entry.create"];
  // const entryOnUpdateWebhook = strapi.eventHub._events["entry.update"];
  strapi.eventHub._events["entry.create"] = (info) => {
    console.log("entryOnCreateWebhook", info.model);
    switch (info.model) {
      case "product":
        fetchProductDetails(strapi, info.entry);
        break;
      default:
        break;
    }
    entryOnCreateWebhook(info);
  };
  // strapi.eventHub._events["entry.update"] = (info) => {
  //   console.log("entryOnUpdateWebhook", info.model);
  //   switch (info.model) {
  //     case "product":
  //       break;
  //     default:
  //       break;
  //   }
  //   entryOnUpdateWebhook(info);
  // };
};
