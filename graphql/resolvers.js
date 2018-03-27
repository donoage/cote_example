const cote = require('cote');

const prepare = (o) => {
    o._id = o._id.toString();
    return o
};

let userRequester = new cote.Requester({
    name: 'graphqlUserRequester',
    namespace: 'user'
});

let productRequester = new cote.Requester({
    name: 'graphqlProductRequester',
    namespace: 'product'
});

let purchaseRequester = new cote.Requester({
    name: 'graphqlPurchaseRequester',
    namespace: 'purchase'
});

const resolvers = {
    Query: {
        user: async (root, {_id}) => {
            return new Promise((resolve, reject) => {
                userRequester.send({type: 'get', _id: _id}, (user) => {
                    return resolve(user);
                });
            });
        },
        users: async () => {
            return new Promise((resolve, reject) => {
                userRequester.send({type: 'list'}, (users) => {
                    return resolve(users);
                });
            });
        },
        product: async (root, {_id}) => {
            return new Promise((resolve, reject) => {
                productRequester.send({type: 'get', _id: _id}, (product) => {
                    return resolve(product);
                });
            });
        },
        products: async () => {
            return new Promise((resolve) => {
                productRequester.send({type: 'list'}, (products) => {
                    return resolve(products);
                });
            });
        },
        purchase: async (root, {_id}) => {
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'get', _id: _id}, (purchase) => {
                    return resolve(purchase);
                });
            });
            // return prepare(await Purchases.findOne(ObjectId(_id)))
        },
        purchases: async () => {
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'list'}, (purchases) => {
                    return resolve(purchases);
                });
            });
            // return (await Purchases.find({}).toArray()).map(prepare)
        },
    },
    Mutation: {
        createUser: async (root, args, context, info) => {
            return new Promise((resolve, reject) => {
                userRequester.send({type: 'create', args: args}, (user) => {
                    if (user.errors) {
                        return reject(user.errors);
                    }
                    return resolve(user);
                });
            });
        },
        updateUserBalance: async (root, args) => {
            return new Promise((resolve, reject) => {
                userRequester.send({type: 'updateBalance', args: args}, (user) => {
                    if (user.errors) {
                        return reject(user.errors);
                    }
                    return resolve(user);
                });
            });
        },
        createProduct: async (root, args) => {
            return new Promise((resolve, reject) => {
                productRequester.send({type: 'create', args: args}, function (product) {
                    if (product.errors) {
                        return reject(product.errors);
                    }
                    return resolve(product);
                });
            });
        },
        updateProductStock: async (root, args) => {
            return new Promise((resolve, reject) => {
                productRequester.send({type: 'updateStock', args: args}, function (product) {
                    if (product.errors) {
                        return reject(product.errors);
                    }
                    return resolve(product);
                });
            });
        },
        deleteProduct: async (root, args) => {
            return new Promise((resolve, reject) => {
                productRequester.send({type: 'delete', args: args}, (product) => {
                    if (product.errors) {
                        return reject(product.errors);
                    }
                    return resolve(product);
                });
            });
        },
        createPurchase: async (root, args) => {
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'create', args: args}, (purchase) => {
                    if (purchase.errors) {
                        return reject(purchase.errors);
                    }
                    return resolve(purchase);
                });
            });
        },
    },
    User: {
        purchases: async ({_id}) => {
            // return (await Purchases.find({userId: _id}).toArray()).map(prepare)
        }
    },
};

module.exports = resolvers;