const User = require('../models/userModel');
const { createCustomer, updateCustomer, deleteCustomer } = require('../apis/facturapi');

const userService = {
  createUser: async ({ direccion, ...args }) => {
    // Validar que los datos requeridos estén presentes
    if (!direccion || !direccion.zip) {
      throw new Error('El campo zip en la dirección es obligatorio.');
    }

    // Crear cliente en FacturAPI
    const facturapiCustomer = await createCustomer({
      ...args,
      direccion,
    });

    // Crear usuario en MongoDB
    const user = new User({
      ...args,
      direccion,
      facturapiid: facturapiCustomer.id,
    });

    return await user.save();
  },

  updateUser: async ({ _id, direccion, ...rest }) => {
    const userToUpdate = await User.findById(_id);
    if (!userToUpdate) throw new Error('Usuario no encontrado');

    // Actualizar cliente en FacturAPI si la dirección o email cambia
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
          : undefined,
        phone: rest.telefono || userToUpdate.telefono,
      });
    }

    // Actualizar datos en MongoDB
    Object.assign(userToUpdate, rest);
    if (direccion) userToUpdate.direccion = direccion;

    return await userToUpdate.save();
  },

  deleteUser: async (_id) => {
    const userToDelete = await User.findById(_id);
    if (!userToDelete) throw new Error('Usuario no encontrado');

    // Eliminar cliente en FacturAPI
    await deleteCustomer(userToDelete.facturapiid);

    // Eliminar usuario en MongoDB
    return await User.findByIdAndDelete(_id);
  },

  getUsers: async () => await User.find(),
};

module.exports = userService;
