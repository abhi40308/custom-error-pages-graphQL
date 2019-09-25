import React, { useState } from "react";
import "../styles/App.css";
import Header from "./header.js";
import PostList from "./PostList";
import NewPost from "./NewPost";
import Profile from "./Profile";
import NetworkError from "./NetworkError";
import NotFound from "./NotFound";
import { onError } from "apollo-link-error";

// toast notifications
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// for authentication using auth0
import { useAuth0 } from "../auth/react-auth0-wrapper";

// for routing
import { withRouter } from "react-router";
import { Switch, Route, Redirect } from "react-router-dom";
import SecuredRoute from "./SecuredRoute";

// for apollo client
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, HttpLink, InMemoryCache } from "apollo-boost";
import { setContext } from "apollo-link-context";

function App(props) {
  // used state to get accessToken through getTokenSilently(), the component re-renders when state changes, thus we have
  // our accessToken in apollo client instance.
  const [accessToken, setAccessToken] = useState("");

  const { getTokenSilently, loading } = useAuth0();
  if (loading) {
    return "Loading...";
  }

  // used for toast notifications 
  toast.configure();

  // get access token
  const getAccessToken = async () => {
    // getTokenSilently() returns a promise
    try {
      const token = await getTokenSilently();
      setAccessToken(token);
      console.log(token);
    } catch (e) {
      console.log("error in auth0");
      console.log(e);
    }
  };
  getAccessToken();

  // for apollo client
  const httpLink = new HttpLink({
    uri: "https://hackernews-clone-2.herokuapp.com/v1/graphql"
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
    if (graphQLErrors)
      // add custom pages global + in separtae componenets.
      graphQLErrors.map(({ message, extensions }) => {
        // console.log(
        //   `hi there ! [GraphQL error]: Message: ${message}, Error Code: ${extensions.code}`
        // );
        switch (extensions.code) {
          // case "" :
          case "validation-failed": {
            console.log("validation failed here in app.js"); // query not right
          }
          case "invalid-jwt": {
            console.log(extensions.code);
            // refetch the jwt
          }
          // also give example of authentication error, means user not authorised, constraint violation on component level;
          // give example of one top-level error page (authorisation error, validation=failed), one component level breadcrumb type, one top level error handle(refetch-jwt)
          //
          case "another-error-code":
          //handle error
        }
      });
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      props.history.push("/network-error");
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
        <Route path="/network-error" component={NetworkError} />
        <SecuredRoute path="/new-post" component={NewPost} />
        <SecuredRoute path={"/user/:id"} component={Profile} />
        <Route path="*" component={NotFound} />
      </Switch>
    </ApolloProvider>
  );
}

export default withRouter(App);
