const { gql } = require('apollo-server');

const userTypeDefs = gql`
  type Direccion {
    calle: String!
    colonia: String
    municipio: String
    estado: String
    zip: String!
  }

  type User {
    _id: ID!
    nombreCompleto: String!
    email: String!
    direccion: Direccion
    telefono: String
    fechaRegistro: String
    tipoUsuario: String
    metodoPagoPreferido: [String]
    facturapiid: String
  }

  type Query {
    # Lista de todos los usuarios
    getAllUsers: [User]

    # Obtener un usuario específico por su ID
    getUserById(_id: ID!): User
  }

  type Mutation {
    createUser(
      nombreCompleto: String!,
      email: String!,
      password: String!,
      direccion: DireccionInput!,
      telefono: String,
      tipoUsuario: String
    ): User

    updateUser(
      _id: ID!,
      nombreCompleto: String,
      email: String,
      direccion: DireccionInput,
      telefono: String,
      tipoUsuario: String,
      metodoPagoPreferido: [String]
    ): User

    deleteUser(_id: ID!): User
  }

  input DireccionInput {
    calle: String!
    colonia: String
    municipio: String
    estado: String
    zip: String!
  }
`;

module.exports = userTypeDefs;
