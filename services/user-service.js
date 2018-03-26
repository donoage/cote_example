require('pretty-error').start();
const cote = require('cote');
const {MongoClient, ObjectId} = require('mongodb');
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';

const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

MongoClient.connect(MONGO_URL, (err, client) => {
    let userResponder = new cote.Responder({
        name: 'userServiceResponder',
        namespace: 'user',
        respondsTo: ['create', 'list', 'get']
    });
    let userPublisher = new cote.Publisher({
        name: 'userServicePublisher',
        namespace: 'user',
        broadcasts: ['update']
    });

    const db = client.db('sbae_cote_example');
    const Users = db.collection('users');

    userResponder.on('*', console.log);
    userResponder.on('get', async (req, cb) => {
        // const query = `
        //     query($id: String!) {
        //         user(_id: $id) {
        //             _id
        //             balance
        //             name
        //             pic_url
        //             purchases {
        //                 userId
        //                 productId
        //             }
        //         }
        //     }
        //     `;
        // const variables = {id: req.userId};
        // fetch({query, variables}).then(user => {
        //     cb(user.data);
        // });
        cb(prepare(await Users.findOne(ObjectId(req._id))));
    });

    userResponder.on('list', async (req, cb) => {
        cb((await Users.find({}).toArray()).map(prepare));
    });


    userResponder.on('create', async (req, cb) => {
        const res = await Users.insertOne(req.args);
        cb(await prepare(await Users.findOne({_id: res.insertedId})));
    });

    userResponder.on('updateBalance', async (req, cb) => {
        console.log('updatebalance---', req);
        let filter = {_id: ObjectId(req.args._id)};
        let balance = {$set: {balance: req.args.balance}};
        cb(await Users.findOneAndUpdate(filter, balance));
    });
});


function updateUsers() {
    fetch({
        query: `{ 
                  users {
                    _id 
                    balance
                    name
                    pic_url
                  }
                }`,
    }).then(res => {
        userPublisher.publish('update', res.data);
    });
}
