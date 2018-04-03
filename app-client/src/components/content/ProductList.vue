<template>
    <div class="tile is-parent is-vertical">
        <article class="tile is-child box">
            <p class="title">
                Product
                <i class="fas fa-list fas is-pulled-right"></i>
            </p>
            <p class="subtitle">Catalog</p>
            <div class="content">
                <ApolloQuery :query="require('../../graphql/Products.gql')">
                    <ApolloSubscribeToMore
                            :document="require('../../graphql/ProductCreated.gql')"
                            :update-query="onProductCreated"
                    />
                    <ApolloSubscribeToMore
                            :document="require('../../graphql/ProductDeleted.gql')"
                            :update-query="onProductDeleted"
                    />
                    <ApolloSubscribeToMore
                            :document="require('../../graphql/ProductUpdated.gql')"
                            :update-query="onProductUpdated"
                    />
                    <template slot-scope="{ result: { loading, error, data } }">
                        <!-- Loading -->
                        <div v-if="loading" class="loading apollo">
                            <img src="../../assets/loader.gif"/> Loading...
                        </div>
                        <!-- Error -->
                        <div v-else-if="error" class="error apollo">An error occurred</div>
                        <!-- Result -->
                        <div v-else-if="data" class="columns is-multiline is-mobile">
                            <div class="column is-one-third animated pulse"
                                 v-for="product in data.products"
                                 :key="product.name"
                            >
                                <div class="card">
                                    <div class="card-content is-clearfix is-size-5">
                                        <strong> {{ product.name }}</strong>
                                        <div class="title"></div>
                                        <div> Price: {{ product.price }}</div>
                                        <div> Stock Left: {{ product.stock }}</div>
                                        <br>
                                        <div class="button is-medium is-pulled-right is-link"
                                             @click="purchaseProduct(product._id)">Buy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- No result -->
                        <div v-else class="no-result apollo">No result :(</div>
                    </template>
                </ApolloQuery>
            </div>
        </article>
    </div>
</template>

<script>
import getProducts from '../../graphql/Products.gql';
import Product from '../../graphql/Product.gql';
import ProductUpdateStock from '../../graphql/ProductUpdateStock.gql';
import User from '../../graphql/User.gql';
import UserUpdateBalance from '../../graphql/UserUpdateBalance.gql';
import PurchaseCreate from '../../graphql/PurchaseCreate.gql';

export default {
  name: 'ProductList',
  props: ['currentUser'],
  apollo: {
    products: {
      query: getProducts,
    },
  },
  data() {
    return {
      products: [],
      error: '',
    };
  },
  methods: {
    onProductCreated(previousResult, { subscriptionData }) {
      return {
        products: [
          ...previousResult.products,
          subscriptionData.data.productCreated,
        ],
      };
    },
    onProductDeleted(previousResult, { subscriptionData }) {
      const store = this.$apolloProvider.defaultClient;
      const data = store.readQuery({ query: getProducts });
      this.$lodash.remove(
        data.products,
        item => item._id === subscriptionData.data.productDeleted._id,
      );
      store.writeQuery({ query: getProducts, data });
    },
    onProductUpdated() {
      const store = this.$apolloProvider.defaultClient;
      store.readQuery({ query: getProducts });
    },
    purchaseProduct(productId) {
      const self = this;
      const { currentUser } = this;

      this.$apollo.query({
        query: Product,
        variables: {
          id: productId,
        },
      }).then((productRes) => {
        const { product } = productRes.data;

        if (product.stock === 0) {
          self.error = 'No More Product Left in Stock';
          return;
        }
        self.$apollo.query({
          query: User,
          variables: {
            id: currentUser.id,
          },
        }).then((userRes) => {
          const { user } = userRes.data;

          if (user.balance < product.price) {
            self.error = 'Not Enough Balance';
            return;
          }

          self.$apollo.mutate({
            mutation: ProductUpdateStock,
            variables: {
              id: productId,
              stock: product.stock - 1,
            },
          }).then(() => {
            self.$apollo.mutate({
              mutation: UserUpdateBalance,
              variables: {
                id: user._id,
                balance: user.balance - product.price,
              },
            }).then(() => {
              self.$apollo.mutate({
                mutation: PurchaseCreate,
                variables: {
                  userId: currentUser.id,
                  productId: product._id,
                },
              }).then(() => {
              });
            });
          });
        });
      });
    },
  },
};
</script>

<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
