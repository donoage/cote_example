const cote = require('cote');
const {MongoClient, ObjectId} = require('mongodb');
const {createApolloFetch} = require('apollo-fetch');
const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
const fetch = createApolloFetch({uri: uri});
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

let productResponder = new cote.Responder({
    name: 'product responder',
    namespace: 'product',
    respondsTo: ['list', 'create', 'get']
});

let productPublisher = new cote.Publisher({
    name: 'product publisher',
    namespace: 'product',
    broadcasts: ['update']
});
MongoClient.connect(MONGO_URL, (err, client) => {
    const db = client.db('sbae_cote_example');
    const Products = db.collection('products');

    productResponder.on('*', console.log);
    productResponder.on('get', async (req, cb) => {
        cb(prepare(await Products.findOne(ObjectId(req._id))));
    });

    productResponder.on('list', async (req, cb) => {
        cb((await Products.find({}).toArray()).map(prepare));
    });

    productResponder.on('create', async (req, cb) => {
        const res = await Products.insertOne(args);
        cb(prepare(await Products.findOne({_id: res.insertedId})));
    });

    productResponder.on('updateStock', async (req, cb) => {
        let filter = {_id: ObjectId(req.product._id)};
        let balance = {$set: {stock: req.product.stock}};

        cb(await Products.findOneAndUpdate(filter, balance));
    });

    productResponder.on('delete', async (req, cb) => {
        req._id = ObjectId(req._id);
        cb(await Products.deleteOne(req));
    });

});


function updateProducts() {
    fetch({
        query: `{ 
                  products {
                    _id 
                    name
                    price
                    stock
                  }
                }`,
    }).then(res => {
        productPublisher.publish('update', res.data)
    });
}
