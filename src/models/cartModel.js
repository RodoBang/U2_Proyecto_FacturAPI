const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        cantidad: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    estatus: { type: String, enum: ['activo', 'cerrado'], default: 'activo' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }, // Nuevo campo 
    fecha_creacion: { type: Date, default: Date.now },
    fecha_cierre: { type: Date }
  });
  
  module.exports = mongoose.model('Cart', cartSchema);