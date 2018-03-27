const cote = require('cote');
const {MongoClient, ObjectId} = require('mongodb');
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

let productResponder = new cote.Responder({
    name: 'product responder',
    namespace: 'product',
    respondsTo: ['list', 'create', 'get', 'updateStock', 'delete']
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
        const res = await Products.insertOne(req.args);
        cb(prepare(await Products.findOne({_id: res.insertedId})));
        updateProducts();
    });

    productResponder.on('updateStock', async (req, cb) => {
        let filter = {_id: ObjectId(req.args._id)};
        let balance = {$set: {stock: req.args.stock}};
        cb(await Products.findOneAndUpdate(filter, balance));
        updateProducts();
    });

    productResponder.on('delete', async (req, cb) => {
        const _id = ObjectId(req.args._id);
        cb(await Products.deleteOne({_id: _id}));
        updateProducts();
    });

    async function updateProducts() {
        productPublisher.publish('update', (await Products.find({}).toArray()).map(prepare));
    }
});



