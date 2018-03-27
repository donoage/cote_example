const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://docker.for.mac.localhost:5002/graphql',
});
const {MongoClient, ObjectId} = require('mongodb');
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
    o._id = o._id.toString();
    return o
};
require('pretty-error').start();

MongoClient.connect(MONGO_URL, (err, client) => {
    const db = client.db('sbae_cote_example');
    const Purchases = db.collection('purchases');

    let purchaseResponder = new cote.Responder({
        name: 'purchase responder',
        namespace: 'purchase',
        respondsTo: ['buy', 'list']
    });

    let purchasePublisher = new cote.Publisher({
        name: 'purchase publisher',
        namespace: 'purchase',
        broadcasts: ['update']
    });

    let paymentRequester = new cote.Requester({
        name: 'payment requester',
        key: 'payment'
    });

    purchaseResponder.on('*', console.log);

    purchaseResponder.on('buy', function (req, cb) {

    });

    purchaseResponder.on('list', async (req, cb) => {
        cb((await Purchases.find({}).toArray()).map(prepare));
    });

    purchaseResponder.on('create', async (req, cb) => {
        const res = await Purchases.insertOne(req.args);
        cb(prepare(await Purchases.findOne({_id: res.insertedId})));
        updatePurchases();
    });

    async function updatePurchases() {
        purchasePublisher.publish('update', (await Purchases.find({}).toArray()).map(prepare));
    }
});