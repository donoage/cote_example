const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
// const models = require('../models');

let userResponder = new cote.Responder({
    name: 'user responder',
    namespace: 'user',
    respondsTo: ['create']
});

let userPublisher = new cote.Publisher({
    name: 'user publisher',
    namespace: 'user',
    broadcasts: ['update']
});

userPublisher.on('ready', () => {
    console.log('userpublisher ready');
});

userResponder.on('*', console.log);

userResponder.on('create', function (req, cb) {
    // models.User.create({}, cb);
    updateUsers();
});

userResponder.on('list', function (req, cb) {
    console.log(cb);

    let query = req.query || {};

    const fetch = createApolloFetch({
        uri: 'http://localhost:5002/graphql',
    });

    fetch({
        query: `{ 
                  users {
                    _id 
                    balance
                  }
                }`,
    }).then(res => {
        cb(res.data);
    });
});

userResponder.on('get', function (req, cb) {
    // models.User.get(req.id, cb);
});

function updateUsers() {
    // models.User.find(function (err, users) {
    //     userPublisher.publish('update', users);
    // });
}
