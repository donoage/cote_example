const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://localhost:5002/graphql',
});
require('pretty-error').start();

let purchaseResponder = new cote.Responder({
    name: 'purchase responder',
    namespace: 'purchase',
    respondsTo: ['buy', 'list']
});

let purchasePublisher = new cote.Publisher({
    name: 'purchase publisher',
    namespace: 'purchase',
    broadcasts: ['update']
});

let paymentRequester = new cote.Requester({
    name: 'payment requester',
    key: 'payment'
});

purchaseResponder.on('*', console.log);

purchaseResponder.on('buy', function (req, cb) {
    // get the product
    const query = `
       query($id: String!) {
            product(_id: $id) {
                _id 
                name
                price
                stock
            }
        }`;
    const variables = {id: req.productId};
    fetch({query, variables}).then(res => {
        let product = res.data.product;
        if (product.stock === 0) return cb({errors: 'No More Product Left.'});

        paymentRequester.send({type: 'process', userId: req.userId, price: product.price}, (res) => {
            if (res.errors) return cb(res);
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
            fetch({query, variables}).then(res => {
                const query = `
                    mutation createPurchaseMutation($userId: String!, $productId: String!) {
                        createPurchase(userId: $userId, productId: $productId) {
                            _id
                            userId
                            productId
                        }
                    }`;
                const variables = {
                    userId: req.userId,
                    productId: req.productId,
                };
                fetch({query, variables}).then(res => {
                    updatePurchases();
                    cb(res.data);
                });
            });
        });
    });
});

purchaseResponder.on('list', function (req, cb) {
    fetch({
        query: `{ 
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

function updatePurchases() {
    fetch({
        query: `{ 
                  purchases {
                    _id
                    userId
                    productId 
                  }
                }`,
    }).then(res => {
        purchasePublisher.publish('update', res.data)
    });
}
