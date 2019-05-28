# graphql-auth-demo

Created with CodeSandbox, the article that properly explains this is [here](https://medium.com/developer-circles-lusaka/https-medium-com-olivierjm-auth-graphql-7f92e8120027) 

> This was created to demonstrate authentication in GraphQL.

- create a user
- authenticate the user
- generate and validate the token


**Used**

- apollo-server v2
- jsonwebtoken
- bcrypt
- pick(from lodash)
- mongoose

Althought this example uses mongoose and MongoDb, you can easily set up any other database.

**Mutations**

```graphql
mutation {
  register(email:"olivier@gmail.com", password:"compl8353pass"){
    email
    password
  }
}
```

```graphql
mutation {
  login(email:"olivier@gmail.com", password:"compl8353pass")
}
```

**Queries**

```graphql
{
  users {
    email
    password
  }
  loggedInUser {
    email
  }
}

```


**To-do**

- Use a different database (relational)
- Migrate to typescript
- Add more examples to show how relationships work in GraphQL
