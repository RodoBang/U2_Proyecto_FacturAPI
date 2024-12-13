const Facturapi = require('facturapi').default;

const facturapi = new Facturapi("sk_test_3gOLPyN9BRW7lqp4rgEP5jOdDw6jnbveawxXMDmGdk");



async function createProduct(product){
    const facturapiProduct = {
        description: product.description,
        product_key: "50202306",
        price: product.price
    };
    return await facturapi.products.create(facturapiProduct);
};


async function createCustomer(user) {
  return await facturapi.customers.create({
    legal_name: user.nombreCompleto, // Asegúrate de que este campo se envíe
    email: user.email,
    tax_id: user.rfc || 'XAXX010101000', // RFC genérico si no se proporciona uno real
    tax_system: '601', // Código del régimen fiscal
    address: {
      street: user.direccion.calle || '',
      zip: user.direccion.zip || '', // Código postal obligatorio
      municipality: user.direccion.municipio || '',
      state: user.direccion.estado || '',
    },
    phone: user.telefono || '',
  });
}


  async function updateCustomer(facturapiId, user) {
    return await facturapi.customers.update(facturapiId, {
      legal_name: user.nombreCompleto,
      email: user.email,
      address: {
        street: user.direccion || "",
        zip: "12345"
      },
      phone: user.telefono
    });
  }


  async function deleteCustomer(facturapiId) {
    return await facturapi.customers.del(facturapiId);
  }
  
module.exports = { facturapi, createProduct, createCustomer, updateCustomer, deleteCustomer };