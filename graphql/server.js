const {MongoClient, ObjectId} = require('mongodb');
const app = require('express')();
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');
const {makeExecutableSchema} = require('graphql-tools');
const cors = require('cors');
const port = process.env.PORT || 5002;
const cote = require('cote');
let MONGO_URL = '';
if (process.env.DOCKER == 'true') {
    MONGO_URL = 'mongodb://mongo:27017';
} else {
    MONGO_URL = 'mongodb://localhost:27017';
}

const URL = 'http://localhost';
require('pretty-error').start();

const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

MongoClient.connect(MONGO_URL, (err, client) => {
    const db = client.db('sbae_cote_example');
    // const Users = db.collection('users');
    const Products = db.collection('products');
    const Purchases = db.collection('purchases');

    let userRequester = new cote.Requester({
        name: 'graphqlUserRequester',
        namespace: 'user'
    });
    let productRequester = new cote.Requester({
        name: 'graphqlProductRequester',
        namespace: 'product'
    });

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
            name: String
            balance: Int
            purchases: [Purchase],
            pic_url: String
          }
    
          type Product {
            _id: String
            name: String
            price: Int
            stock: Int
          }
          
         type Purchase {
            _id: String
            userId: String
            productId: String
          }
    
          type Mutation {
            createUser(balance: Int, name: String, pic_url: String): User
            updateUserBalance(_id: String, balance: Int): User
            
            createProduct(price: Int, stock: Int, name: String): Product
            updateProductStock(_id: String, stock: Int): Product
            deleteProduct(_id: String): Product
            
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
                userRequester.send({type: 'get', _id: _id}, (user) => {
                    return user;
                });
            },
            users: async () => {
                userRequester.send({type: 'list'}, (users) => {
                    return users;
                });
            },
            product: async (root, {_id}) => {
                productRequester.send({type: 'get', _id: _id}, (product) => {
                    return product;
                });
                return prepare(await Products.findOne(ObjectId(_id)))
            },
            products: async () => {
                productRequester.send({type: 'list'}, (products) => {
                    return products;
                });
                // return (await Products.find({}).toArray()).map(prepare)
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
                return prepare(await Users.findOne({_id: res.insertedId}))
            },
            updateUserBalance: async (root, args) => {
                let filter = {_id: ObjectId(args._id)};
                let balance = {$set: {balance: args.balance}};
                return await Users.findOneAndUpdate(filter, balance);
            },
            createProduct: async (root, args) => {
                const res = await Products.insertOne(args);
                return prepare(await Products.findOne({_id: res.insertedId}))
            },
            updateProductStock: async (root, args) => {
                let filter = {_id: ObjectId(args._id)};
                let stock = {$set: {stock: args.stock}};
                return await Products.findOneAndUpdate(filter, stock);
            },
            deleteProduct: async (root, args) => {
                args._id = ObjectId(args._id);
                return await Products.deleteOne(args);
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

    app.listen(port, () => {
        console.log(`Visit ${URL}:${port}${homePath}`)
    })
});
