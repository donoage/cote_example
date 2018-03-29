const cote = require('cote');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
  o._id = o._id.toString();
  return o;
};

MongoClient.connect(MONGO_URL, (err, client) => {
  const db = client.db('sbae_cote_example');
  const Purchases = db.collection('purchases');

  const purchaseResponder = new cote.Responder({
    name: 'purchase responder',
    namespace: 'purchase',
    respondsTo: ['buy', 'list', 'get'],
  });

  const purchasePublisher = new cote.Publisher({
    name: 'purchase publisher',
    namespace: 'purchase',
    broadcasts: ['update'],
  });

  async function updatePurchases() {
    purchasePublisher.publish('update', (await Purchases.find({}).toArray()).map(prepare));
  }

  purchaseResponder.on('*', console.log);

  purchaseResponder.on('get', async (req, cb) => {
    cb(prepare(await Purchases.findOne(ObjectId(req._id))));
  });

  purchaseResponder.on('list', async (req, cb) => {
    if (req.userId) {
      cb((await Purchases.find({ userId: req.userId }).toArray()).map(prepare));
    }

    if (req.productId) {
      cb((await Purchases.find({ productId: req.productId }).toArray()).map(prepare));
    }

    cb((await Purchases.find({}).toArray()).map(prepare));
  });

  purchaseResponder.on('create', async (req, cb) => {
    const res = await Purchases.insertOne(req.args);
    cb(prepare(await Purchases.findOne({ _id: res.insertedId })));
    updatePurchases();
  });
});
