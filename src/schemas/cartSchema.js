const { gql } = require('apollo-server');

const cartTypeDefs = gql`
  type ProductInCart {
    producto: Product
    cantidad: Int
  }

  type Cart {
    _id: ID!                     
    usuario: User
    productos: [ProductInCart]
    subtotal: Float
    iva: Float
    total: Float
    estatus: String
    paymentStatus: String
    facturaId: String # ID de la factura generada
    fecha_creacion: String
    fecha_cierre: String
  }

  type PagoRespuesta {
    message: String
    paymentId: String
    carrito: Cart
  }

  type FacturaRespuesta {
    message: String
    facturaId: String
    facturaUrl: String
  }

  type Query {
    LeerCarrito(id_carrito: ID!): Cart
    LeerHistoria(usuario: ID!): [Cart]
  }

  type Mutation {
    AgregarProd(id_carrito: ID!, productoId: ID!, cantidad: Int!): Cart
    EliminarProd(id_carrito: ID!, productoId: ID!): Cart
    ActualizarCarrito(id_carrito: ID!): Cart
    CrearCarrito(usuario: ID!): Cart
    ProcesarPagoYCerrarCarrito(id_carrito: ID!, paymentMethodId: String!): PagoRespuesta
    EmitirFactura(id_carrito: ID!): FacturaRespuesta # Nueva mutación para generar facturas
  }
`;

module.exports = cartTypeDefs;
