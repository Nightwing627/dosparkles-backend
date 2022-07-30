module.exports = {
  graphql: {
    endpoint: "/graphql",
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
    apolloServer: {
      tracing: false,
    },
  },
  email: {
    provider: "mailgun",
    providerOptions: {
      apiKey: "1e2700e5b5ca56c3039397c5f2ceacd5-2a9a428a-4be1f72c",
      domain: "dosparkles.com", //Required if you have an account with multiple domains
      host: "api.mailgun.net", //Optional. If domain region is Europe use 'api.eu.mailgun.net'
    },
    settings: {
      defaultFrom: "Sparkles <notifications@dosparkles.com>",
      defaultReplyTo: "Sparkles <notifications@dosparkles.com>",
    },
  },
};
