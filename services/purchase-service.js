const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://localhost:5002/graphql',
});
require('pretty-error').start();

let purchaseResponder = new cote.Responder({
    name: 'purchase responder',
    namespace: 'purchase',
    respondsTo: ['buy']
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
    console.log('PURCHASE SERVICE BUY RESPONDING');
    console.log(req);

    let query = `
       query($id: String!) {
            product(_id: $id) {
                _id 
                name
                price
                stock
            }
        }
    `;
    let variables = {
        id: req.productId
    };

    fetch({query, variables}).then(product => {
        if (product.stock === 0) return cb(true);
        paymentRequester.send({type: 'process', userId: req.userId, price: product.price}, (err) =>{
            if (err) return cb(err);
            product.stock--;
            // save the product

            // get the user
            query = `
            query($id: String!) {
                user(_id: $id) {
                    _id 
                    balance
                    name
                    pic_url
                }
            }
            `;
            variables = {id: req.userId};
            fetch({query, variables}).then(user => {
                // createPurchase here
            });


        });
        console.log(product);
        cb(res);
    });


    // let purchase = new models.Purchase({});
    // //get the product with productid
    // models.Product.get(req.productId, function(err, product) {
    //     //check for number of product left
    //     if (product.stock == 0) return cb(true);

    //     // paymentrequest requests
    //     paymentRequester.send({ type: 'process', userId: req.userId, price: product.price }, function(err) {
    //         if (err) return cb(err);

    //         product.stock--;
    //         //get the user
    //         models.User.get(req.userId, function(err, user) {
    //             product.save(function() {
    //                 purchase.setOwner(user, function() {
    //                     purchase.setProduct(product, function() {
    //                         purchase.save(function(err, purchase) {
    //                             cb(err, {
    //                                 user: user,
    //                                 purchase: purchase
    //                             });
    updatePurchases();
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });
});

purchaseResponder.on('list', function (req, cb) {
    let query = req.query || {};
    // models.Purchase.find(query, cb);
});

function updatePurchases() {
    // models.Purchase.find(function(err, purchases) {
    //     purchasePublisher.publish('update', purchases);
    // });
}
