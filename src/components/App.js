import React, { useState } from "react";
import "../styles/App.css";
import Header from "./header.js";
import PostList from "./PostList";
import NewPost from "./NewPost";
import Profile from "./Profile"
// import NetworkError from "./NetworkError"
import NotFound from "./NotFound"
import { onError } from "apollo-link-error";


// for authentication using auth0
import { useAuth0 } from "../auth/react-auth0-wrapper";

// for routing
import { Switch, Route, Redirect } from "react-router-dom";
import SecuredRoute from "./SecuredRoute";

// for apollo client
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, HttpLink, InMemoryCache } from "apollo-boost";
import { setContext } from "apollo-link-context";

function App() {

  // used state to get accessToken through getTokenSilently(), the component re-renders when state changes, thus we have
  // our accessToken in apollo client instance.
  const [accessToken, setAccessToken] = useState("");

  const { getTokenSilently, loading } = useAuth0();
  if (loading) {
    return "Loading...";
  }

  // get access token
  const getAccessToken = async () => {
    // getTokenSilently() returns a promise
    try {
      const token = await getTokenSilently();
      setAccessToken(token);
    } catch (e) {
      console.log(e);
    }
  };
  getAccessToken();

  // for apollo client
  const httpLink = new HttpLink({
    uri: "https://hackernews-clone-2.herokuapp.com/v1/graphql"
    // uri: "https://hackernews-clone-2.herokuapp.com/v1/"
  });

  const authLink = setContext((_, { headers }) => {
    const token = accessToken;
    if (token) {
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`
        }
      };
    } else {
      return {
        headers: {
          ...headers
        }
      };
    }
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) // add custom pages global + in separtae componenets.
      graphQLErrors.map(({ message, extensions }) => {
        console.log(
          `hi there ! [GraphQL error]: Message: ${message}, Location: ${extensions.code}`
        );
        if(extensions.code === 'validation-failed'){
          console.log('here is');
          return(<Redirect to='/new-post' />);
        }
        if(extensions.code == 'invalid-jwt'){

        }
        // console.log(extensions.code);
      });
    if (networkError) {
      console.log(`hi [Network error]: ${networkError}`);
      return(<Redirect to='/Network-error' />)
    }
  });

  const client = new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache()
  });

  return (
    <ApolloProvider client={client}>
      <Header />
      <Switch>
        <Route exact path="/" component={PostList} />
        {/* <Route path ="/Network-error" component={NetworkError} /> */}
        <SecuredRoute path="/new-post" component={NewPost} />
        <SecuredRoute path={"/user/:id"} component={Profile} />
        <Route path="*" component={NotFound} />
      </Switch>
    </ApolloProvider>
  );
}

export default App;
