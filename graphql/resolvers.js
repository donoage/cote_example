const cote = require('cote');

const { PubSub, withFilter } = require('graphql-subscriptions');

const pubsub = new PubSub();
const USER_CREATED = 'user_created';
const PRODUCT_CREATED = 'product_created';
const PRODUCT_UPDATED = 'product_updated';
const PRODUCT_DELETED = 'product_deleted';
const PURCHASE_CREATED = 'purchase_created';

const userRequester = new cote.Requester({
  name: 'graphqlUserRequester',
  namespace: 'user',
});

const productRequester = new cote.Requester({
  name: 'graphqlProductRequester',
  namespace: 'product',
});

const purchaseRequester = new cote.Requester({
  name: 'graphqlPurchaseRequester',
  namespace: 'purchase',
});

const resolvers = {
  Query: {
    user: async (root, { _id }) => new Promise((resolve, reject) => {
      userRequester.send({ type: 'get', _id }, user => resolve(user));
    }),
    users: async () => new Promise((resolve, reject) => {
      userRequester.send({ type: 'list' }, users => resolve(users));
    }),
    product: async (root, { _id }) => new Promise((resolve, reject) => {
      productRequester.send({ type: 'get', _id }, product => resolve(product));
    }),
    products: async () => new Promise((resolve) => {
      productRequester.send({ type: 'list' }, products => resolve(products));
    }),
    purchase: async (root, { _id }) => new Promise((resolve, reject) => {
      purchaseRequester.send({ type: 'get', _id }, purchase => resolve(purchase));
    }),
    purchases: async (root, { userId }) => new Promise((resolve, reject) => {
      purchaseRequester.send({ type: 'list', userId }, purchases => resolve(purchases));
    }),
  },
  Mutation: {
    createUser: async (root, args, context, info) => new Promise((resolve, reject) => {
      userRequester.send({ type: 'create', args }, (user) => {
        if (user.errors) {
          return reject(user.errors);
        }
        pubsub.publish(USER_CREATED, { userCreated: user });
        return resolve(user);
      });
    }),
    updateUserBalance: async (root, args) => new Promise((resolve, reject) => {
      userRequester.send({ type: 'updateBalance', args }, (user) => {
        if (user.errors) {
          return reject(user.errors);
        }
        return resolve(user);
      });
    }),
    createProduct: async (root, args) => new Promise((resolve, reject) => {
      productRequester.send({ type: 'create', args }, (product) => {
        if (product.errors) {
          return reject(product.errors);
        }
        pubsub.publish(PRODUCT_CREATED, { productCreated: product });
        return resolve(product);
      });
    }),
    updateProductStock: async (root, args) => new Promise((resolve, reject) => {
      productRequester.send({ type: 'updateStock', args }, (product) => {
        if (product.errors) {
          return reject(product.errors);
        }
        pubsub.publish(PRODUCT_UPDATED, { productUpdated: product.value });
        return resolve(product);
      });
    }),
    deleteProduct: async (root, args) => new Promise((resolve, reject) => {
      productRequester.send({ type: 'delete', args }, (product) => {
        if (product.errors) {
          return reject(product.errors);
        }
        pubsub.publish(PRODUCT_DELETED, { productDeleted: product.value });
        return resolve(product.value);
      });
    }),
    createPurchase: async (root, args) => new Promise((resolve, reject) => {
      purchaseRequester.send({ type: 'create', args }, (purchase) => {
        if (purchase.errors) {
          return reject(purchase.errors);
        }
        pubsub.publish(PURCHASE_CREATED, { purchaseCreated: purchase });
        return resolve(purchase);
      });
    }),
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(USER_CREATED),
    },
    productCreated: {
      subscribe: () => pubsub.asyncIterator(PRODUCT_CREATED),
    },
    productUpdated: {
      subscribe: () => pubsub.asyncIterator(PRODUCT_UPDATED),
    },
    productDeleted: {
      subscribe: () => pubsub.asyncIterator(PRODUCT_DELETED),
    },
    purchaseCreated: {
      subscribe: () => pubsub.asyncIterator(PURCHASE_CREATED),
    },
  },
  User: {
    purchases: async ({ _id }) => new Promise((resolve, reject) => {
      purchaseRequester.send({ type: 'list', userId: _id }, (purchase) => {
        if (purchase.errors) {
          return reject(purchase.errors);
        }
        return resolve(purchase);
      });
    }),
  },
  Product: {
    purchases: async ({ _id }) => new Promise((resolve, reject) => {
      purchaseRequester.send({ type: 'list', productId: _id }, (purchase) => {
        if (purchase.errors) {
          return reject(purchase.errors);
        }
        return resolve(purchase);
      });
    }),
  },
  Purchase: {
    user: async ({ userId }) => new Promise((resolve, reject) => {
      userRequester.send({ type: 'get', _id: userId }, (user) => {
        if (user.errors) {
          return reject(user.errors);
        }
        return resolve(user);
      });
    }),
    product: async ({ productId }) => new Promise((resolve, reject) => {
      productRequester.send({ type: 'get', _id: productId }, (product) => {
        if (product.errors) {
          return reject(product.errors);
        }
        return resolve(product);
      });
    }),
  },
};

module.exports = resolvers;
