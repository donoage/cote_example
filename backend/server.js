const port = process.env.PORT || 5000;
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
const fetch = createApolloFetch({uri: uri});
require('pretty-error').start();

app.use(bodyParser.json());

app.all('*', function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.get('/', function (req, res) {
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
    }).then(response => {
        res.send(response.data);
    });
});
app.get('/start', function (req, res) {
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
    }).then(response => {
        res.send(response.data);
    });
});


app.get('/user', function (req, res) {
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
    }).then(response => {
        res.send(response.data);
    });
});

app.get('/product', function (req, res) {
    productRequester.send({type: 'list'}, function (products) {
        res.send(products);
    });
});

app.post('/product', function (req, res) {
    productRequester.send({type: 'create', product: req.body}, function (product) {
        if (product.errors) {
            res.status(500).send(product.errors.message);
        }
        res.send(product.data);
    });
});

app.delete('/product/:id', function (req, res) {
    productRequester.send({type: 'delete', id: req.params.id}, function (product) {
        if (product.errors) {
            res.status(500).send('Something broke!');
        }
        res.send(product.data);
    });
});

app.get('/purchase', function (req, res) {
    purchaseRequester.send({type: 'list'}, function (purchases) {
        res.send(purchases);
    });
});

let productRequester = new cote.Requester({
    name: 'admin product requester',
    namespace: 'product'
});

let userRequester = new cote.Requester({
    name: 'admin user requester',
    namespace: 'user'
});

let purchaseRequester = new cote.Requester({
    name: 'admin purchase requester',
    namespace: 'purchase'
});

server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
        console.log('The address is already in use.');
        console.log(e);
        process.exit(1);
    }
});

server.listen(port);

new cote.Sockend(io, {
    name: 'admin sockend server'
});
