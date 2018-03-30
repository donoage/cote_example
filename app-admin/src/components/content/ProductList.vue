<template>
    <div class="tile is-parent is-vertical">
        <article class="tile is-child box">
            <p class="title">Product</p>
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
                        <table v-else-if="data" class="table is-fullwidth">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody v-for="product of data.products"
                                   :key="product.name"
                            >
                            <tr>
                                <th>{{ product.name }}</th>
                                <td>{{ product.price }}</td>
                                <td>{{ product.stock }}</td>
                                <td>
                                    <button class="button" @click="deleteProduct(product)">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
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
    deleteProduct(product) {
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
