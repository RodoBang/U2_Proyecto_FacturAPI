const userService = require('../services/userService');

const resolvers = {
  Query: {
    users: async () => await userService.getUsers(),
  },
  Mutation: {
    createUser: async (_, { nombreCompleto, email, password, direccion, telefono, tipoUsuario }) => {
      return await userService.createUser({
        nombreCompleto,
        email,
        password,
        direccion,
        telefono,
        tipoUsuario,
      });
    },

    updateUser: async (_, { _id, nombreCompleto, email, direccion, telefono, tipoUsuario }) => {
      return await userService.updateUser({
        _id,
        nombreCompleto,
        email,
        direccion,
        telefono,
        tipoUsuario,
      });
    },

    deleteUser: async (_, { _id }) => {
      return await userService.deleteUser(_id);
    },
  },
};

module.exports = resolvers;
