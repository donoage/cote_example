require('pretty-error').start();
const cote = require('cote');
const {MongoClient, ObjectId} = require('mongodb');
const {createApolloFetch} = require('apollo-fetch');
// const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
// const fetch = createApolloFetch({uri: uri});
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

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

MongoClient.connect(MONGO_URL, (err, client) => {
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
});

userResponder.on('create', function (req, cb) {
    const query = `
    mutation createUserMutation($balance: Int!, $name: String!, $pic_url: String!) {
        createUser(balance: $balance, name: $name, pic_url: $pic_url) {
            _id 
            balance
            name
            pic_url
        }
    }
    `;

    const variables = {
        balance: req.balance,
        name: req.name,
        pic_url: req.pic_url,
    };

    fetch({
        query, variables
    }).then(res => {
        // TODO: Refer to this error.
        if (res.errors) {
            cb(res);
        }

        updateUsers();
        cb(res.data);
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
