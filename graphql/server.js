const app = require('express')();
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
const {makeExecutableSchema} = require('graphql-tools');
const cors = require('cors');
const port = process.env.PORT || 5002;
const typeDefs = require('./type-defs.js');
const resolvers = require('./resolvers.js');
const URL = 'http://localhost';
require('pretty-error').start();

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

app.use(cors());

app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

const homePath = '/graphiql';

app.use(homePath, graphiqlExpress({
    endpointURL: '/graphql'
}));

app.listen(port, () => {
    console.log(`Visit ${URL}:${port}${homePath}`)
});
