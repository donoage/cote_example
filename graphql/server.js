const {MongoClient, ObjectId} = require('mongodb');
const app = require('express')();
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
const {makeExecutableSchema} = require('graphql-tools');
const cors = require('cors');

const PORT = 5002;
const URL = 'http://localhost';
const MONGO_URL = 'mongodb://localhost:27017';

const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

MongoClient.connect(MONGO_URL, (err, client) => {
    const db = client.db('sbae_cote_example');

    const Users = db.collection('users');
    const Products = db.collection('products');
    const Purchases = db.collection('purchases');

    const typeDefs = [`
          type Query {
            user(_id: String): User
            users: [User]
            
            product(_id: String): Product
            products: [Product]
            
            purchase(_id: String): Purchase
            purchases: [Purchase]
          }
    
          type User {
            _id: String
            balance: Int
            purchases: [Purchase]
          }
    
          type Product {
            _id: String
            price: Int
            stock: Int
          }
          
         type Purchase {
            _id: String
            userId: String
            productId: String
          }
    
          type Mutation {
            createUser(balance: Int): User
            createProduct(price: Int, stock: Int): Product
            createPurchase(userId: String, productId: String): Purchase
          }
    
          schema {
            query: Query
            mutation: Mutation
          }
        `];

    const resolvers = {
        Query: {
            user: async (root, {_id}) => {
                return prepare(await Users.findOne(ObjectId(_id)))
            },
            users: async () => {
                return (await Users.find({}).toArray()).map(prepare)
            },
            product: async (root, {_id}) => {
                return prepare(await Products.findOne(ObjectId(_id)))
            },
            products: async () => {
                return (await Products.find({}).toArray()).map(prepare)
            },
            purchase: async (root, {_id}) => {
                return prepare(await Purchases.findOne(ObjectId(_id)))
            },
            purchases: async () => {
                return (await Purchases.find({}).toArray()).map(prepare)
            },
        },
        Mutation: {
            createUser: async (root, args, context, info) => {
                const res = await Users.insertOne(args);
                console.log(res.insertedId);
                return prepare(await Users.findOne({_id: res.insertedId}))
            },
            createProduct: async (root, args) => {
                const res = await Products.insertOne(args);
                return prepare(await Products.findOne({_id: res.insertedId}))
            },
            createPurchase: async (root, args) => {
                const res = await Purchases.insertOne(args);
                return prepare(await Purchases.findOne({_id: res.insertedId}))
            },
        },
        User: {
            purchases: async ({_id}) => {
                return (await Purchases.find({userId: _id}).toArray()).map(prepare)
            }
        },
    };

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

    app.listen(PORT, () => {
        console.log(`Visit ${URL}:${PORT}${homePath}`)
    })
});
