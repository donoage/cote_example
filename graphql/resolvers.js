const cote = require('cote');

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
        },
        purchases: async () => {
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'list'}, (purchases) => {
                    return resolve(purchases);
                });
            });
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
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'list', userId: _id}, (purchase) => {
                    if (purchase.errors) {
                        return reject(purchase.errors);
                    }
                    return resolve(purchase);
                });
            });
        }
    },
    Product: {
        purchases: async ({_id}) => {
            return new Promise((resolve, reject) => {
                purchaseRequester.send({type: 'list', productId: _id}, (purchase) => {
                    if (purchase.errors) {
                        return reject(purchase.errors);
                    }
                    return resolve(purchase);
                });
            });
        }
    },
    Purchase: {
        user: async ({userId}) => {
            return new Promise((resolve, reject) => {
                userRequester.send({type: 'get', _id: userId}, (user) => {
                    if (user.errors) {
                        return reject(user.errors);
                    }
                    return resolve(user);
                });
            });
        },
        product: async ({productId}) => {
            return new Promise((resolve, reject) => {
                productRequester.send({type: 'get', _id: productId}, (product) => {
                    if (product.errors) {
                        return reject(product.errors);
                    }
                    return resolve(product);
                });
            });
        }
    }
};

module.exports = resolvers;