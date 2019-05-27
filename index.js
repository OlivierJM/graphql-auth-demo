// import { ApolloServer, gql } from "apollo-server";
// import jwt from "jsonwebtoken";
const { ApolloServer, gql } = require("apollo-server");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// Construct a schema, using GraphQL schema language

const userSchema = mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

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
    register: async (root, args) => {
      const user = User();
      user.email = args.email;
      user.password = await bcrypt.hash(args.password, 12);
      // we will get the email and password from the args object
      // console.log(args);
      return user.save();
    },
    login: async (root, args, context) => {
      // we will generate a token for the user here
      const user = await User.findOne({ email: context.email });
      if (!user) {
        throw new Error("No user found ");
      }
      const isValid = await bcrypt.compare(context.password, user.password);
      if (!isValid) {
        throw new Error("Incorrect password ");
      }
      //   sign in the user
      const token = await jwt.sign(
        {
          user: pick(user, ["_id", "email"])
        },
        SECRET,
        // this token will last for a year, this should be adjusted accordingly
        { expiresIn: "1y" }
      );
      return token;
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
      console.log(`${user.user} user`);
      // user = await jwt.verify(token, SECRET);
      // console.log(`${user.user} user`);
    } catch (error) {
      console.log(`${error.message} caught`);
    }
    // the user and secret we are passing here is what we access in every resolver
    return {
      user: await user,
      SECRET
    };
  }
});
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
