const User = require('../models/userModel');
const { createCustomer, updateCustomer, deleteCustomer } = require('../apis/facturapi');

const userService = {
  // Función para obtener todos los usuarios
  getUsers: async () => {
    return await User.find();
  },

  // Función para obtener un usuario por ID
  getUserById: async (_id) => {
    const user = await User.findById(_id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },
  // Crear usuario y cliente en FacturAPI
  createUser: async ({ direccion, ...args }) => {
    // Validar que la dirección esté presente y que el campo zip sea obligatorio
    if (!direccion || !direccion.zip) {
      throw new Error('El campo zip en la dirección es obligatorio.');
    }

    // Crear cliente en FacturAPI
    const facturapiCustomer = await createCustomer({
      ...args,
      direccion, // Pasamos la dirección completa
    });

    // Crear usuario en MongoDB
    const user = new User({
      ...args,
      direccion,
      facturapiid: facturapiCustomer.id,
    });

    return await user.save();
  },

  // Actualizar usuario y su información en FacturAPI
  updateUser: async ({ _id, direccion, ...rest }) => {
    const userToUpdate = await User.findById(_id);
    if (!userToUpdate) throw new Error('Usuario no encontrado');

    // Si la dirección o el email cambian, actualizar en FacturAPI
    if (direccion || rest.email) {
      await updateCustomer(userToUpdate.facturapiid, {
        legal_name: rest.nombreCompleto || userToUpdate.nombreCompleto,
        email: rest.email || userToUpdate.email,
        address: direccion
          ? {
              street: direccion.calle || userToUpdate.direccion.calle,
              zip: direccion.zip || userToUpdate.direccion.zip,
              municipality: direccion.municipio || userToUpdate.direccion.municipio,
              state: direccion.estado || userToUpdate.direccion.estado,
            }
          : undefined, // Si no se pasa una nueva dirección, se mantiene la actual
        phone: rest.telefono || userToUpdate.telefono,
      });
    }

    // Actualizar datos del usuario en MongoDB
    Object.assign(userToUpdate, rest);
    if (direccion) userToUpdate.direccion = direccion;

    return await userToUpdate.save();
  },

  // Eliminar usuario y cliente de FacturAPI
  deleteUser: async (_id) => {
    const userToDelete = await User.findById(_id);
    if (!userToDelete) throw new Error('Usuario no encontrado');

    // Eliminar cliente de FacturAPI
    await deleteCustomer(userToDelete.facturapiid);

    // Eliminar usuario en MongoDB
    return await User.findByIdAndDelete(_id);
  },

  // Obtener todos los usuarios
  getUsers: async () => await User.find(),
};

module.exports = userService;
