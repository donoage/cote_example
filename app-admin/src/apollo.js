import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
// New Imports
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

export default function createApolloClient({ endpoints }) {
  const httpLink = new HttpLink({ uri: endpoints.graphql });

  const wsLink = new WebSocketLink({
    uri: endpoints.subscription,
    options: {
      reconnect: true,
    },
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  // Create the apollo client
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
}
