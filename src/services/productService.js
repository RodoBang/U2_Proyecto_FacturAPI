const mongoose = require('mongoose');
const Product = require('../models/productModel');
const { facturapi } = require('../apis/facturapi');

const productService = {
  getProducts: async () => await Product.find(),
  // Nueva función para obtener un producto por ID
  getProductById: async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error('El ID proporcionado no es válido');
    }

    const product = await Product.findById(_id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  },
  createProduct: async (args) => {
    const product = new Product(args);
    const facturapiproduct = await facturapi.products.create({
      description: args.description,
      product_key: "50202306",
      price: args.price
    });
    product.facturapiid = facturapiproduct.id;
    return await product.save();
  },

  updateProduct: async ({ _id, ...rest }) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error('El ID proporcionado no es válido');
    }

    const productId = new mongoose.Types.ObjectId(_id);
    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) throw new Error('Producto no encontrado');

    // Verificar si los campos a actualizar están presentes y asignarlos
    const updatedData = {
      description: rest.description || productToUpdate.description,
      price: rest.price || productToUpdate.price,
      category: rest.category || productToUpdate.category,
      brand: rest.brand || productToUpdate.brand,
      stock: rest.stock || productToUpdate.stock,
      imgs: rest.imgs || productToUpdate.imgs,
      facturapiid: rest.facturapiid || productToUpdate.facturapiid,
    };

    // Actualizar en FacturAPI
    await facturapi.products.update(productToUpdate.facturapiid, updatedData);

    // Actualizar el producto en MongoDB
    Object.assign(productToUpdate, updatedData);
    return await productToUpdate.save();
  },

  deleteProduct: async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error('El ID proporcionado no es válido');
    }

    const productId = new mongoose.Types.ObjectId(_id);
    const productToDelete = await Product.findById(productId);
    if (!productToDelete) throw new Error('Producto no encontrado');

    // Eliminar producto en FacturAPI
    await facturapi.products.del(productToDelete.facturapiid);

    // Eliminar producto en MongoDB
    return await Product.findByIdAndDelete(productId);
  }
};

module.exports = productService;
