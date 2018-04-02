<template>
    <div class="tile is-parent is-vertical">
        <article class="tile is-child box">
            <p class="title">
                Purchase
                <i class="fas fa-shopping-cart fas is-pulled-right"></i>
            </p>
            <p class="subtitle">History</p>
            <div class="content">
                {{currentUser}}
            </div>
        </article>
    </div>

</template>

<script>
import User from '../../graphql/User.gql';
import PurchaseCreated from '../../graphql/PurchaseCreated.gql';

export default {
  name: 'PurchaseList',
  props: ['currentUser'],
  data() {
    return {};
  },
  mounted() {
    const self = this;
    const observer = this.$apollo.subscribe({
      query: PurchaseCreated,
    });
    observer.subscribe({
      next(res) {
        console.log(res);
        if (res.data.purchaseCreated.userId === self.currentUser.id) {
          console.log('I bought this');
          self.$apollo.query({
            query: User,
            variables: {
              id: self.currentUser.id,
            },
            update: (store, { data: { newTag } }) => {
              debugger;
              // Read the data from our cache for this query.
              const data = store.readQuery({ query: TAGS_QUERY })
              // Add our tag from the mutation to the end
              data.tags.push(newTag)
              // Write our data back to the cache.
              store.writeQuery({ query: TAGS_QUERY, data })
            },
          }).then((userRes) => {
            console.log(userRes.data);
          });
        }
      },
    });
  },
};
</script>

<style scoped>

</style>
