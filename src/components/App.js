import React, { useState } from "react";
import "../styles/App.css";
import Header from "./header.js";
import PostList from "./PostList";
import NewPost from "./NewPost";
import Profile from "./Profile";
import NetworkError from "./NetworkError";
import NotFound from "./NotFound";
import SomethingWentWrong from "./SomethingWentWrong";

import { onError } from "apollo-link-error";

// toast notifications
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// for authentication using auth0
import { useAuth0 } from "../auth/react-auth0-wrapper";

// for routing
import { withRouter } from "react-router";
import { Switch, Route } from "react-router-dom";
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
    } catch (e) {
      console.log("error in auth0");
      console.log(e);
    }
  };
  getAccessToken();

  // for apollo client
  const httpLink = new HttpLink({
    uri: "https://hackernews-clone-2.herokuapp.com/v1/graphql"
    // uri: "https://hackernews-clone-2.herokuapp.com/v1"
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

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, extensions }) => {
          switch (extensions.code) {
            case "data-exception":
            case "validation-failed":
              props.history.push("/something-went-wrong");
              break;
            case "invalid-jwt":
              // refetch the jwt
              const oldHeaders = operation.getContext().headers;
              getAccessToken();
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${accessToken}`
                }
              });
              // retry the request, returning the new observable
              return forward(operation);
              break;
            default:
              // default case
              console.log(extensions.code);
          }
        });
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
        props.history.push("/network-error");
      }
    }
  );

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
        <Route path="/something-went-wrong" component={SomethingWentWrong} />
        <SecuredRoute path="/new-post" component={NewPost} />
        <SecuredRoute path={"/user/:id"} component={Profile} />
        <Route path="*" component={NotFound} />
      </Switch>
    </ApolloProvider>
  );
}

export default withRouter(App);
