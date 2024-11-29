const productService = require('../services/productService');

const resolvers = {
  Query: {
    products: async () => await productService.getProducts(),
    product: async (_, { _id }) => await productService.getProductById(_id),  // Nueva función para obtener un producto por ID
  },
  Mutation: {
    createProduct: async (_, args) => await productService.createProduct(args),
    updateProduct: async (_, args) => await productService.updateProduct(args),
    deleteProduct: async (_, { _id }) => await productService.deleteProduct(_id),
  },
};

module.exports = resolvers;
