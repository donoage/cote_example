const cote = require('cote');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
  o._id = o._id.toString();
  return o;
};

MongoClient.connect(MONGO_URL, (err, client) => {
  const db = client.db('sbae_cote_example');
  const Users = db.collection('users');

  const userResponder = new cote.Responder({
    name: 'userServiceResponder',
    namespace: 'user',
    respondsTo: ['create', 'list', 'get'],
  });
  const userPublisher = new cote.Publisher({
    name: 'userServicePublisher',
    namespace: 'user',
    broadcasts: ['update'],
  });

  async function updateUsers() {
    userPublisher.publish('update', (await Users.find({}).toArray()).map(prepare));
  }

  userResponder.on('*', console.log);
  userResponder.on('get', async (req, cb) => {
    cb(prepare(await Users.findOne(ObjectId(req._id))));
  });

  userResponder.on('list', async (req, cb) => {
    cb((await Users.find({}).toArray()).map(prepare));
  });

  userResponder.on('create', async (req, cb) => {
    const res = await Users.insertOne(req.args);
    cb(await prepare(await Users.findOne({ _id: res.insertedId })));
    updateUsers();
  });

  userResponder.on('updateBalance', async (req, cb) => {
    const filter = { _id: ObjectId(req.args._id) };
    const balance = { $set: { balance: req.args.balance } };
    cb(await Users.findOneAndUpdate(filter, balance));
    updateUsers();
  });
});
