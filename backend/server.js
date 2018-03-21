const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cote = require('cote');
require('pretty-error').start();

app.use(bodyParser.json());

app.all('*', function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/user', function (req, res) {
    userRequester.send({type: 'list'}, function (users) {
        res.send(users);
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
            res.status(500).send('Something broke!');
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
    purchaseRequester.send({type: 'list'}, function (err, purchases) {
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

server.listen(5000);

new cote.Sockend(io, {
    name: 'admin sockend server'
});
