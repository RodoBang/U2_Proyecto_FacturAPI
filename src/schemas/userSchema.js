// src/schemas/userSchema.js
const { gql } = require('apollo-server');

const userTypeDefs = gql`
  type User {
    _id: ID!
    nombreCompleto: String!
    email: String!
    direccion: String
    telefono: String
    fechaRegistro: String
    tipoUsuario: String
    metodoPagoPreferido: [String]
    facturapiid: String
  }

  type Query {
    users: [User]
  }

  type Mutation {
    createUser(
    nombreCompleto: String!,
    email: String!,
    password: String!,
    direccion: String,
    telefono: String,
    tipoUsuario: String,
    metodoPagoPreferido: [String],
    rfc: String
  ): User

    updateUser(
      _id: ID!,
      nombreCompleto: String,
      email: String,
      direccion: String,
      telefono: String,
      tipoUsuario: String,
      metodoPagoPreferido: [String]
    ): User

    deleteUser(_id: ID!): User
  }
`;

module.exports = userTypeDefs;
