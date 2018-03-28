const port = process.env.PORT || 5000;
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cote = require('cote');
const { createApolloFetch } = require('apollo-fetch');

const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
const fetch = createApolloFetch({ uri });

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});
app.get('/allresources', (req, res) => {
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
  }).then((response) => {
    res.send(response.data);
  });
});

app.get('/users', (req, res) => {
  fetch({
    query: `{
          users {
            _id
            name
            balance
            pic_url
          }
        }`,
  }).then((response) => {
    res.send(response.data);
  });
});

app.get('/products', (req, res) => {
  fetch({
    query: `{
          products {
            _id
            name
            price
            stock
          }
        }`,
  }).then((response) => {
    res.send(response.data);
  });
});

app.post('/purchase_info', (req, res) => {
  // product
  const query = `
       query($productId: String!) {
            product(_id: $productId) {
                _id 
                name
                price
                stock
            }
        }`;
  const variables = { productId: req.body.productId };
  fetch({ query, variables }).then((result) => {
    if (result.errors) res.status(500).send(result.errors);
    const product = result.data.product;
    // user
    const query = `
           query($userId: String!) {
                user(_id: $userId) {
                    _id 
                    name
                    balance
                }
            }`;
    const variables = { userId: req.body.userId };
    fetch({ query, variables }).then((result) => {
      if (result.errors) res.status(500).send(result.errors);
      const user = result.data.user;

      res.send({ userName: user.name, productName: product.name });
    });
  });
});

app.post('/product', (req, res) => {
  const query = `
            mutation createProductMutation($price: Int!, $stock: Int!, $name: String!) {
                createProduct(price: $price, stock: $stock, name: $name) {
                    _id
                    name
                    price
                    stock
                }
            }`;

  const variables = {
    name: req.body.product.name,
    price: req.body.product.price,
    stock: req.body.product.stock,
  };

  fetch({
    query, variables,
  }).then((result) => {
    if (result.errors) res.status(500).send(result.errors);
    res.send(result);
  });
});

app.delete('/product/:id', (req, res) => {
  const query = `
    mutation deleteProductMutation($id: String!) {
        deleteProduct(_id: $id) {
            _id
        }
    }
    `;
  const variables = {
    id: req.params.id,
  };

  fetch({
    query, variables,
  }).then((result) => {
    if (result.errors) res.status(500).send(result.errors);
    res.send(result);
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('The address is already in use.');
    console.log(e);
    process.exit(1);
  }
});

server.listen(port);

new cote.Sockend(io, {
  name: 'admin sockend server',
});
