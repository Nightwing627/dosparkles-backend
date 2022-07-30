module.exports = {
  definition: `
    extend type UsersPermissionsMe {
      user: UsersPermissionsUser
    }
  `,
  resolver: {
    UsersPermissionsMe: {
      user: user => user
    },
  },
}
