const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/mailjet');
const stripe = require('../apis/stripe');
const { facturapi } = require('../apis/facturapi');
const { subirArchivoCloudinary } = require('../apis/cloudinaryService');
const axios = require('axios');
const fs=require('fs');

const cartResolvers = {
  Query: {
    LeerCarrito: async (_, { id_carrito }) => {
      return await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
    },
    LeerHistoria: async (_, { usuario }) => {
      return await Cart.find({ usuario, estatus: 'cerrado' }).populate('productos.producto');
    },
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
      return await Cart.findById(id_carrito).populate('productos.producto');
    },
    EliminarProd: async (_, { id_carrito, productoId }) => {
      const cart = await Cart.findById(id_carrito);

      cart.productos = cart.productos.filter((item) => !item.producto.equals(productoId));
      await updateCartTotals(cart);
      await cart.save();
      return await Cart.findById(id_carrito).populate('productos.producto');
    },
    ProcesarPagoYCerrarCarrito: async (_, { id_carrito, paymentMethodId }) => {
      const cart = await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
      if (!cart) throw new Error('Carrito no encontrado.');

      if (cart.paymentStatus === 'paid' || cart.estatus === 'cerrado') {
        throw new Error('El carrito ya fue pagado o está cerrado.');
      }

      const totalInCents = Math.round(cart.total * 100);

      try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalInCents,
            currency: 'mxn',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: { 
                enabled: true, 
                allow_redirects: 'never' // Deshabilita redirecciones
            },
            receipt_email: cart.usuario.email,
        });
    
        // Reducir stock de productos
        for (const item of cart.productos) {
            const product = await Product.findById(item.producto._id);
            if (product.stock < item.cantidad) {
                throw new Error(`No hay suficiente stock para el producto: ${product.name}`);
            }
            product.stock -= item.cantidad;
            await product.save();
        }
    
        // Actualizar el carrito
        cart.estatus = 'cerrado';
        cart.paymentStatus = 'paid';
        cart.fecha_cierre = new Date();
        await cart.save();
    
        // Enviar correo de confirmación
        const user = await User.findById(cart.usuario._id);
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
    .header { background-color: #007BFF; color: #ffffff; text-align: center; padding: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 20px; }
    .content h2 { color: #333333; }
    .product-list { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .product-list th, .product-list td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .footer { background-color: #007BFF; color: #ffffff; text-align: center; padding: 10px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Gracias por tu compra</h1>
    </div>
    <div class="content">
      <h2>Hola ${user.nombreCompleto},</h2>
      <p>Tu compra se ha completado exitosamente. Aquí tienes los detalles:</p>
      <table class="product-list">
        <thead>
          <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
        </thead>
        <tbody>
          ${cart.productos.map(item => `<tr><td>${item.producto.name}</td><td>${item.cantidad}</td><td>$${item.producto.price.toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p><strong>Total:</strong> $${cart.total.toFixed(2)}</p>
    </div>
    <div class="footer">
      <p>Gracias por tu preferencia.</p>
      <p>&copy; 2024 Tu Empresa</p>
    </div>
  </div>
</body>
</html>
        `;
        await sendEmail(user.email, 'Confirmación de Compra', emailContent);

    return {
        message: 'Pago procesado y carrito cerrado exitosamente.',
        paymentId: paymentIntent.id,
        carrito: cart,
    };
} catch (error) {
    console.error('Stripe Error:', error);
    cart.paymentStatus = 'failed';
    await cart.save();
    throw new Error('Error procesando el pago: ' + error.message);
}
    },
    EmitirFactura: async (_, { id_carrito }) => {
      const cart = await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
      if (!cart) {
        throw new Error('Carrito no encontrado.');
      }
      if (cart.estatus !== 'cerrado') {
        throw new Error('El carrito debe estar cerrado antes de emitir una factura.');
      }
    
      try {
        const user = cart.usuario;
    
        // Formatear los productos del carrito para FacturAPI
        const items = cart.productos.map((item) => ({
          quantity: item.cantidad,
          product: {
            description: item.producto.name,
            product_key: '60131324', // Ajusta según el producto
            price: item.producto.price,
          },
        }));
    
        // Crear factura en FacturAPI
        console.log('Generando factura como borrador en FacturAPI...');
        const factura = await facturapi.invoices.create({
          customer: {
            legal_name: user.nombreCompleto,
            email: user.email,
            tax_id: 'XAXX010101000', // RFC genérico
            tax_system: '601', // Régimen fiscal
            address: {
              street: user.direccion.calle || '',
              zip: String(user.direccion.zip) || '',
              municipality: user.direccion.municipio || '',
              state: user.direccion.estado || '',
            },
            phone: user.telefono || '',
          },
          items,
          payment_form: '03', // Dinero electrónico
          folio_number: Math.floor(Math.random() * 10000),
          series: 'F',
        });
    
        console.log(`Factura generada: ${factura.id}`);
    
        // Copiar a borrador si la factura no es un borrador
        let draftFactura = factura;
        if (factura.status !== 'draft') {
          console.log('Convirtiendo la factura a borrador...');
          draftFactura = await facturapi.invoices.copyToDraft(factura.id);
          console.log(`Factura convertida a borrador: ${draftFactura.id}`);
        }
    
        // Timbrar el borrador
        console.log('Timbrando factura...');
        const facturaTimbrada = await facturapi.invoices.stampDraft(draftFactura.id);
        console.log(`Factura timbrada exitosamente: ${facturaTimbrada.id}`);
    
        // Descargar el PDF de la factura
        console.log('Descargando PDF de la factura...');
        const pdfStream = await facturapi.invoices.downloadPdf(facturaTimbrada.id);
        const localPath = `./factura-${facturaTimbrada.id}.pdf`;
        const pdfFile = fs.createWriteStream(localPath);
    
        await new Promise((resolve, reject) => {
          pdfStream.pipe(pdfFile);
          pdfFile.on('finish', resolve);
          pdfFile.on('error', reject);
        });
    
        console.log(`Factura descargada exitosamente en ${localPath}.`);
    
        // Subir el archivo a Cloudinary
        console.log('Subiendo la factura a Cloudinary...');
        const cloudinaryUrl = await subirArchivoCloudinary(localPath);
    
        console.log('Factura subida exitosamente a Cloudinary.');
    
        // Eliminar archivo local después de subirlo
        fs.unlinkSync(localPath);
        console.log(`Archivo temporal ${localPath} eliminado.`);
    
        // Retornar el resultado
        return {
          message: 'Factura generada, timbrada y almacenada exitosamente en Cloudinary.',
          facturaId: facturaTimbrada.id,
          facturaUrl: cloudinaryUrl,
        };
      } catch (error) {
        console.error('Error generando factura:', error.message || error);
        throw new Error('No se pudo generar la factura. Intenta nuevamente.');
      }
    },

    
    
    
    
        
  },
};

// Función para actualizar totales
async function updateCartTotals(cart) {
  let subtotal = 0;
  for (const item of cart.productos) {
    const product = await Product.findById(item.producto);
    subtotal += product.price * item.cantidad;
  }
  cart.subtotal = subtotal;
  cart.iva = subtotal * 0.16; // IVA del 16%
  cart.total = cart.subtotal + cart.iva;
}

module.exports = cartResolvers;