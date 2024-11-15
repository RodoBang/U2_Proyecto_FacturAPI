const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const cartResolvers = {
  Query: {
    LeerCarrito: async (_, { id_carrito }) => {
      return await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
    },
    LeerHistoria: async (_, { usuario }) => {
        return await Cart.find({ usuario, estatus: 'cerrado' }).populate('productos.producto');
    }
  },
  Mutation: {
    CrearCarrito: async (_, { usuario }) => {
      const newCart = new Cart({ usuario, productos: [] });
      await newCart.save();

      return await Cart.findById(newCart._id).populate('usuario');
    },
    AgregarProd: async (_, { id_carrito, productoId, cantidad }) => {
        const cart = await Cart.findById(id_carrito);
        const existingProduct = cart.productos.find((item) => item.producto.equals(productoId));
  
        if (existingProduct) {
          existingProduct.cantidad += cantidad;
        } else {
          cart.productos.push({ producto: productoId, cantidad });
        }
  
        await updateCartTotals(cart);
        await cart.save();
  
        // Popula los productos después de guardar el carrito
        return await Cart.findById(id_carrito).populate('productos.producto');
      },
      EliminarProd: async (_, { id_carrito, productoId }) => {
        const cart = await Cart.findById(id_carrito);
  
        // Filtrar el producto a eliminar
        cart.productos = cart.productos.filter((item) => !item.producto.equals(productoId));
  
        await updateCartTotals(cart);
        await cart.save();
  
        // Popula los productos después de guardar el carrito
        return await Cart.findById(id_carrito).populate('productos.producto');
      },
    ActualizarCarrito: async (_, { id_carrito }) => {
      const cart = await Cart.findById(id_carrito);
      await updateCartTotals(cart);

      return await cart.save();
    },
    CerrarCarrito: async (_, { id_carrito }) => {
        const cart = await Cart.findById(id_carrito).populate('productos.producto');
  
        // Verificar que haya suficiente stock para cada producto
        for (const item of cart.productos) {
          const product = await Product.findById(item.producto._id);
  
          if (product.stock < item.cantidad) {
            throw new Error(`No hay suficiente stock para el producto: ${product.name}`);
          }
        }
  
        // Descontar el stock de cada producto
        for (const item of cart.productos) {
          const product = await Product.findById(item.producto._id);
          product.stock -= item.cantidad;
          await product.save();
        }
  
        // Cambiar el estado del carrito a "cerrado" y asignar la fecha de cierre
        cart.estatus = 'cerrado';
        cart.fecha_cierre = new Date();
        return await cart.save();
      },
  }
};

// Función para actualizar subtotal, IVA y total
async function updateCartTotals(cart) {
  let subtotal = 0;

  for (const item of cart.productos) {
    const product = await Product.findById(item.producto);
    subtotal += product.price * item.cantidad;
  }

  cart.subtotal = subtotal;
  cart.iva = subtotal * 0.16; // Suponiendo un IVA del 16%
  cart.total = cart.subtotal + cart.iva;
}

module.exports = cartResolvers;
