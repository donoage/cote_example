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
import ProductDelete from '../../graphql/ProductDelete.gql';
import getProducts from '../../graphql/Products.gql';

export default {
  name: 'ProductList',
  apollo: {
    products: {
      query: getProducts,
    },
  },
  data() {
    return {
      products: [],
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
    // TODO: start here
    purchaseProduct(product) {
      this.$apollo.mutate({
        mutation: ProductDelete,
        variables: {
          id: product._id,
        },
        update: (store, { data: { deleteProduct } }) => {
          const data = store.readQuery({ query: getProducts });
          this.$lodash.remove(data.products, item => item._id === deleteProduct._id);
          store.writeQuery({ query: getProducts, data });
        },
      }).then((data) => {
        console.log(data);
      }).catch((error) => {
        console.log(error);
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
