const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://localhost:5002/graphql',
});

let productResponder = new cote.Responder({
    name: 'product responder',
    namespace: 'product',
    respondsTo: ['list']
});

let productPublisher = new cote.Publisher({
    name: 'product publisher',
    namespace: 'product',
    broadcasts: ['update']
});

productResponder.on('*', console.log);

productResponder.on('list', function (req, cb) {
    fetch({
        query: `{ 
                  products {
                    _id 
                    name
                    price
                    stock
                  }
                }`,
    }).then(res => {
        cb(res.data);
    });
});

productResponder.on('create', function (req, cb) {
    const query = `
    mutation createProductMutation($price: Int!, $stock: Int!, $name: String!) {
        createProduct(price: $price, stock: $stock, name: $name) {
            _id
            name
            price
            stock
        }
    }
    `;

    const variables = {
        name: req.product.name,
        price: req.product.price,
        stock: req.product.stock,
    };

    fetch({
        query, variables
    }).then(res => {
        updateProducts();
        cb(res);
    });
});

productResponder.on('delete', function (req, cb) {
    const query = `
    mutation deleteProductMutation($id: String!) {
        deleteProduct(_id: $id) {
            _id
        }
    }
    `;
    const variables = {
        id: req.id
    };

    fetch({
        query, variables
    }).then(res => {
        updateProducts();
        cb(res);
    });
});

function updateProducts() {
    fetch({
        query: `{ 
                  products {
                    _id 
                    name
                    price
                    stock
                  }
                }`,
    }).then(res => {
        productPublisher.publish('update', res.data)
    });
}
