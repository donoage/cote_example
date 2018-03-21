const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://localhost:5002/graphql',
});
require('pretty-error').start();

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
        updateUsers();
        cb(res.data);
    });
});

userResponder.on('list', function (req, cb) {
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
        cb(res.data);
    });
});

userResponder.on('get', function (req, cb) {
    // models.User.get(req.id, cb);
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