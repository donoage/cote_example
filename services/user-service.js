const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    //TODO: fix using conf
    uri: 'http://docker.for.mac.localhost:5002/graphql',
});
require('pretty-error').start();

let userResponder = new cote.Responder({
    name: 'user responder',
    namespace: 'user',
    respondsTo: ['create', 'list', 'get']
});

let userPublisher = new cote.Publisher({
    name: 'user publisher',
    namespace: 'user',
    broadcasts: ['update']
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
        // TODO: Refer to this error.
        if (res.errors) {
            cb(res);
        }

        updateUsers();
        cb(res.data);
    });
});

userResponder.on('list', function (req, cb) {
    fetch({
        query: `{
              products {
                _id
                name
                price
                stock
              }
              users {
                _id
                name
                balance
                pic_url
              }
              purchases {
                _id
                userId
                productId
              }
            }`,
    }).then(res => {
        cb(res.data);
    });
});

userResponder.on('get', function (req, cb) {
    const query = `
            query($id: String!) {
                user(_id: $id) {
                    _id
                    balance
                    name
                    pic_url
                    purchases {
                        userId
                        productId
                    }
                }
            }
            `;
    const variables = {id: req.userId};
    fetch({query, variables}).then(user => {
        cb(user.data);
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
