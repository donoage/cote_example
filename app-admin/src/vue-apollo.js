import Vue from 'vue';
import VueApollo from 'vue-apollo';
import createApolloClient from './apollo';

Vue.use(VueApollo);

console.log(process.env);

// Config
const options = {
  ssr: false,
  endpoints: {
    graphql: process.env.VUE_APP_GRAPHQL_PATH || 'http://localhost:5002/graphql',
    subscription:
        process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || 'ws://localhost:5002/subscriptions',
  },
  persisting: false,
};

// Create apollo client
export const apolloClient = createApolloClient(options);

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
});
