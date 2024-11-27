// src/index.js
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const productTypeDefs = require('./schemas/productSchema');
const userTypeDefs = require('./schemas/userSchema');
const cartTypeDefs = require('./schemas/cartSchema');
const productResolvers = require('./resolvers/productResolver');
const userResolvers = require('./resolvers/userResolver');
const cartResolvers = require('./resolvers/cartResolver');

const startServer = async () => {
  await mongoose.connect('mongodb+srv://padrinoelmejor97:proyecto1234@shippings.n10xz.mongodb.net/?retryWrites=true&w=majority&appName=Shippings');

  const typeDefs = [productTypeDefs, userTypeDefs, cartTypeDefs];
  const resolvers = [productResolvers, userResolvers, cartResolvers];

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`Servidor corriendo en ${url}`);
  });
};

startServer();
