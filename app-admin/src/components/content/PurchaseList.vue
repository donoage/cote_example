<template>
    <div class="tile is-parent is-vertical">
        <article class="tile is-child box">
            <p class="title">
                Purchase
                <i class="fas fa-shopping-cart fas is-pulled-right"></i>
            </p>
            <p class="subtitle">History</p>
            <div class="content">
                <ApolloQuery :query="require('../../graphql/Purchases.gql')">
                    <ApolloSubscribeToMore
                            :document="require('../../graphql/PurchaseCreated.gql')"
                            :update-query="onPurchaseCreated"
                    />
                    <template slot-scope="{ result: { loading, error, data } }">
                        <div v-if="loading" class="loading apollo">
                            <img src="../../assets/loader.gif"/> Loading...
                        </div>
                        <div v-else-if="error" class="error apollo">An error occurred</div>
                        <div class="content animated fadeInUp"
                             v-else-if="data"
                             v-for="purchase in data.purchases"
                             :key="purchase._id"
                        >
                            <ul>
                                <li>
                                    <strong>{{ purchase.user.name }}</strong>
                                    purchased
                                    <strong>{{ purchase.product.name }}</strong>
                                </li>
                            </ul>
                        </div>
                        <div v-else class="no-result apollo">No result :(</div>
                    </template>
                </ApolloQuery>
            </div>
        </article>
    </div>
</template>

<script>
export default {
  name: 'PurchaseList',
  methods: {
    onPurchaseCreated(previousResult, { subscriptionData }) {
      return {
        purchases: [
          ...previousResult.purchases,
          subscriptionData.data.purchaseCreated,
        ],
      };
    },
  },
  data() {
    return {
      purchases: [],
    };
  },
};
</script>

<style scoped>

</style>
