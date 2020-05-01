# Building custom error pages in React with Hasura GraphQL engine

This application is a part of a tutorial on how to handle errors in GraphQl-react applications. Check out the tutorial [here](https://hasura.io/blog/handling-graphql-hasura-errors-with-react/).
This application demonstrates error handling and implementing custom error pages in a react app using hasura graphQL engine. Uses react-apollo GraphQL client to make requests to the api. Apollo-link-error library is used for error handling.

## Installation

Installing and running on local system require:
* [Setting up Hasura Server](https://docs.hasura.io/1.0/graphql/manual/getting-started/heroku-simple.html) (deployed on Heroku), and creating required tables
* [Setting up Auth0](https://auth0.com/docs/quickstart/spa/react/01-login#configure-auth0)
* See [this](https://docs.hasura.io/1.0/graphql/manual/guides/integrations/auth0-jwt.html) guide for Auth0 JWT Integration with Hasura
* Clone or download this repo, install the required packages and run `npm start`

## npm packages:

You will need the following npm packages:
* [react-router-dom](https://www.npmjs.com/package/react-router-dom)
* [react-bootstrap](https://www.npmjs.com/package/react-bootstrap)
* [apollo-boost](https://www.npmjs.com/package/apollo-boost)
* [@apollo/react-hooks](https://www.npmjs.com/package/@apollo/react-hooks)
* [apollo-link-context](https://www.npmjs.com/package/apollo-link-context)
* [@apollo/react-hoc](https://www.npmjs.com/package/@apollo/react-hoc)
* [graphql](https://www.npmjs.com/package/graphql)
* [@auth0/auth0-spa-js](https://www.npmjs.com/package/@auth0/auth0-spa-js)
* [apollo-link-error](https://www.npmjs.com/package/apollo-link-error)


## Creating tables 

Following tables required to be created:
```
type Post {
id - integer, primary key
description - text
url - text
created_at - timestamp with time zone
user_id - text
}

type Users {
name - text 
last_seen - timestamp with time zone
id - text, primary key
}

type Point {
id - integer, primary key
user_id - text
post_id - integer
}
```
`Post.user_id` and `Users.id` have object relationship. `Point.post_id` and `Post.id` have array relationship. Permissions should be given accordingly.

## User Authentication

See [Setting up Auth0 with react](https://auth0.com/docs/quickstart/spa/react/01-login#configure-auth0) and [this](https://docs.hasura.io/1.0/graphql/manual/guides/integrations/auth0-jwt.html) guide for Auth0 JWT Integration with Hasura. Here we are using Auth0 Universal Login.

## Realtime updates

Using apollo cache and react state, we can give realtime updates for upvotes and new posts. Apollo `refetchQueries` function updates apollo cache with refetched data.

## Error handling

Uses apollo-link-error library, to implement top-level and component-level error handling, with custom error pages, and custom logic at compoenent level to show error notifications.
