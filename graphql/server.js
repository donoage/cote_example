const app = require('express')();
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const cors = require('cors');
const { createServer } = require('http');
// Subs
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

// GraphQL
const resolvers = require('./resolvers.js');
const typeDefs = require('./type-defs.js');

// Conf
const URL = 'http://localhost';
const PORT = process.env.PORT || 5002;
const SUBSCRIPTIONS_PATH = '/subscriptions';
const HOME_PATH = '/graphiql';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use(HOME_PATH, graphiqlExpress({
  endpointURL: '/graphql',
}));

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Visit ${URL}:${PORT}${HOME_PATH}`);
  console.log(`API Subscriptions server is now running on ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`);
});

// Subs
SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server,
    path: SUBSCRIPTIONS_PATH,
  },
);
