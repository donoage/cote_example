const port = process.env.PORT || 5001;
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cote = require('cote');
const { createApolloFetch } = require('apollo-fetch');

const uri = (process.env.DOCKER == 'true') ? 'http://docker.for.mac.localhost:5002/graphql' : 'http://localhost:5002/graphql';
const fetch = createApolloFetch({ uri });

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(`${req.ip} requested end-user interface`);
  res.sendFile(`${__dirname}/index.html`);
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
  }).then((result) => {
    if (result.errors) res.status(500).send(result.errors.message);
    res.send(result.data.products);
  });
});

app.get('/user/:id', (req, res) => {
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
  const variables = { id: req.params.id };
  fetch({ query, variables }).then((result) => {
    if (result.errors) res.status(500).send(result.errors.message);
    res.send(result.data.user);
  });
});

app.post('/create', (req, res) => {
  const query = `
        mutation createUserMutation($balance: Int!, $name: String!, $pic_url: String!) {
            createUser(balance: $balance, name: $name, pic_url: $pic_url) {
                _id
                balance
                name
                pic_url
            }
        }`;

  const variables = {
    balance: 100,
    name: req.body.fullName,
    pic_url: req.body.picUrl,
  };

  fetch({
    query, variables,
  }).then((result) => {
    if (result.errors) res.status(500).send(result.errors.message);
    res.send(result.data.createUser);
  });
});

app.post('/buy', (req, res) => {
  // get the product and check stock
  const query = `
       query($id: String!) {
            product(_id: $id) {
                _id 
                name
                price
                stock
            }
        }`;
  const variables = { id: req.body.productId };
  fetch({ query, variables }).then((result) => {
    const product = result.data.product;
    if (product.stock === 0) return res.status(500).send({ errors: 'No More Product Left.' });
    // get the user and check balance
    const query = `
            query($id: String!) {
                user(_id: $id) {
                    _id 
                    balance
                    name
                    pic_url
                }
            }
            `;
    const variables = { id: req.body.userId };
    fetch({ query, variables }).then((result) => {
      const user = result.data.user;
      if (user.balance < product.price) return res.status(500).send({ errors: 'Not Enough Balance.' });
      user.balance -= product.price;

      // update user balance
      const query = `
                mutation updateUserBalanceMutation($id: String!, $balance: Int!) {
                    updateUserBalance(_id: $id, balance: $balance) {
                        _id
                        balance
                    }
                }`;

      const variables = {
        id: user._id,
        balance: user.balance,
      };

      fetch({ query, variables }).then((result) => {
        if (result.errors) return res.status(500).send(result.errors);
        product.stock--;
        // update the product stock
        const query = `
                mutation updateProductStockMutation($id: String!, $stock: Int!) {
                    updateProductStock(_id: $id, stock: $stock) {
                        _id
                        stock
                    }
                }`;
        const variables = {
          id: product._id,
          stock: product.stock,
        };
        fetch({ query, variables }).then((result) => {
          if (result.errors) return res.status(500).send(result.errors);
          const query = `
                    mutation createPurchaseMutation($userId: String!, $productId: String!) {
                        createPurchase(userId: $userId, productId: $productId) {
                            _id
                            userId
                            productId
                        }
                    }`;
          const variables = {
            userId: req.body.userId,
            productId: req.body.productId,
          };
          fetch({ query, variables }).then((result) => {
            result.data.createPurchase.productName = product.name;
            res.send(result.data);
          });
        });
      });
    });
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
  name: 'frontend sockend server',
});
