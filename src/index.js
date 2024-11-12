// src/index.js
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const productTypeDefs = require('./schemas/productSchema');
const userTypeDefs = require('./schemas/userSchema');
const productResolvers = require('./resolvers/productResolver');
const userResolvers = require('./resolvers/userResolver');

const startServer = async () => {
  await mongoose.connect('mongodb+srv://jorodobang:rodo1234@cluster0.wxc0w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  const typeDefs = [productTypeDefs, userTypeDefs];
  const resolvers = [productResolvers, userResolvers];

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`Servidor corriendo en ${url}`);
  });
};

startServer();
