module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  // url: env("SITE_URL", "https://backend.dosparkles.com"),
  cron: { enabled: true },
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "618a583014e3b480c9bba991229b3ee4"),
    },
  },
});
