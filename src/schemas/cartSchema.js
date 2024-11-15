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
    fecha_creacion: String
    fecha_cierre: String
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
    CerrarCarrito(id_carrito: ID!): Cart
  }
`;

module.exports = cartTypeDefs;
