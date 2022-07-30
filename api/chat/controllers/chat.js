"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // find: async (ctx) => {
  //   if (!ctx.state.user || !ctx.state.user.role) return [];
  //   switch (ctx.state.user.role.name) {
  //     case "Admin":
  //       return await strapi.query("chat").find(ctx.query);
  //     case "ClientAdmin":
  //     case "ClientUser":
  //     case "Driver":
  //       var me = await strapi.query("user", "users-permissions").findOne(
  //         {
  //           id: ctx.state.user.id,
  //         },
  //         ["chats", "chats.chat_messages", "chats.users"]
  //       );
  //       if (!me.chats) return [];
  //       return me.chats;
  //     default:
  //       return [];
  //   }
  // },
  // findOne: async (ctx) => {
  //   if (!ctx.state.user || !ctx.state.user.role) return [];
  //   switch (ctx.state.user.role.name) {
  //     case "Admin":
  //       return await strapi
  //         .query("chat")
  //         .findOne(ctx.query, ["chats", "chats.chat_messages", "chats.users"]);
  //     case "ClientAdmin":
  //     case "ClientUser":
  //     case "Driver":
  //       var chat = await strapi.query("chat").findOne(
  //         {
  //           id: ctx.params.id,
  //         },
  //         ["chats", "chats.chat_messages", "chats.users"]
  //       );
  //       return chat;
  //     default:
  //       return [];
  //   }
  // },
};
