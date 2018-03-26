const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
const fetch = createApolloFetch({
    uri: uri,
});
const {MongoClient, ObjectId} = require('mongodb');
const MONGO_URL = (process.env.DOCKER == 'true') ? 'mongodb://mongo:27017' : 'mongodb://localhost:27017';
const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

let paymentResponder = new cote.Responder({
    name: 'payment responder',
    key: 'payment'
});

MongoClient.connect(MONGO_URL, (err, client) => {
    const db = client.db('sbae_cote_example');

    paymentResponder.on('*', console.log);

    paymentResponder.on('process', function (req, cb) {
        // const query = `
        //     query($id: String!) {
        //         user(_id: $id) {
        //             _id
        //             balance
        //             name
        //             pic_url
        //         }
        //     }
        //     `;
        // const variables = {id: req.userId};
        // fetch({query, variables}).then(res => {
        //     let user = res.data.user;
        //     if (user.balance < req.price) return cb({errors: 'Not Enough Balance.'});
        //     user.balance -= req.price;
        //     // update user balance
        //     const query = `
        //         mutation updateUserBalanceMutation($id: String!, $balance: Int!) {
        //             updateUserBalance(_id: $id, balance: $balance) {
        //                 _id
        //                 balance
        //             }
        //         }
        //         `;
        //
        //     const variables = {
        //         id: user._id,
        //         balance: user.balance,
        //     };
        //
        //     fetch({query, variables}).then(res => {
        //         cb(res);
        //     });
        // });
    });

});


