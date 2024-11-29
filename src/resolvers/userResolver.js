const userService = require('../services/userService');

const resolvers = {
  Query: {
     // Resolver para obtener todos los usuarios
     getAllUsers: async () => {
      return await userService.getUsers();
    },

    // Resolver para obtener un solo usuario por ID
    getUserById: async (_, { _id }) => {
      return await userService.getUserById(_id);
    },
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
      // Asegúrate de que direccion sea un objeto
      if (direccion) {
        direccion = {
          calle: direccion.calle,
          colonia: direccion.colonia,
          municipio: direccion.municipio,
          estado: direccion.estado,
          zip: direccion.zip,
        };
      }
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
