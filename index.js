const { ApolloServer, gql, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const pick = require("lodash").pick;

// configure the user collection
const userSchema = mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model("User", userSchema);

// connect to mongodb here
mongoose.Promise = global.Promise;
mongoose.connect(
  `mongodb://${process.env.USER}:${
    process.env.PASS
  }@ds261716.mlab.com:61716/user-test`,
  { useNewUrlParser: true }
);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    loggedInUser: User
    users: [User]
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
    // you can get the details of the logged-in user
    loggedInUser(root, args, { user }) {
      return user;
    },
    users(root, args, { user }) {
      if (!user) {
        throw new Error("You are not logged in to access this information ");
      }
      return User.find({});
    }
  },
  Mutation: {
    register: async (root, args) => {
      const user = User();
      // we will get the email and password from the args object
      user.email = args.email;
      user.password = await bcrypt.hash(args.password, 12);
      // save the user to the db
      return user.save();
    },
    login: async (root, args, context) => {
      // check if the user exists
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new Error("No user found ");
      }
      // check if the password matches the hashed one we already have
      const isValid = await bcrypt.compare(args.password, user.password);
      if (!isValid) {
        throw new Error("Incorrect password ");
      }
      //   sign in the user
      // if the user exist then create a token for them
      const token = await jwt.sign(
        {
          user: pick(user, ["_id", "email"])
        },
        SECRET,
        // this token will last for a day, but you can change it
        // check the jsonwebtoken for more on this
        { expiresIn: "1d" }
      );
      return token;
    }
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // you can catch all the request in the context
  context: async ({ req }) => {
    const token = await req.headers["authentication"];
    let verifiedResponse;
    try {
      verifiedResponse = await jwt.verify(token, SECRET);
    } catch (error) {
      console.log(`${error.message} caught`);
    }
    // the user and secret we are passing here is what we access in every resolver
    return {
      user: verifiedResponse,
      SECRET
    };
  }
});
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
