// import { ApolloServer, gql } from "apollo-server";
// import jwt from "jsonwebtoken";
const { ApolloServer, gql } = require("apollo-server");
const jwt = require("jsonwebtoken");
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    user: User
  }
  type Mutation {
    register(email: String, password: String): User!
    login(email: String, password: String): String!
  }
  type User {
    email: String
    password: String
  }
`;

const SECRET = "createaverystrongsecretthatalsoincludes2423412wdsa324e34e";
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    user(root, args, context) {
      return context.user;
    }
  },
  Mutation: {
    register: (root, args) => {
      // we will get the email and password from the args object
      console.log(args);
      return args.password;
    },
    login: (root, args, context) => {
      // we will generate a token for the user here
      console.log(args);
      return context.token;
    }
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = await req.headers["authentication"];
    let user;
    try {
      user = await jwt.verify(token, SECRET);
      console.log(user.user);
    } catch (error) {
      console.log(`${error.message} caught`);
    }
    // the user and secret we are passing here is what we access in every resolver
    return {
      user,
      SECRET
    };
  }
});
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
