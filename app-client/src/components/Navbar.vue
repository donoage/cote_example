<template>
    <nav class="navbar" role="navigation" aria-label="dropdown navigation" v-if="userId">
        <div class="logo animated jello">
            <img src="https://static1.squarespace.com/static/59975f9a9f7456d2866ec54e/t/599c7d5b893fc0a2909944f6/1521153598582/?format=1500w"
                 alt=""
                 width="95">
        </div>
        <ApolloQuery :query="require('../graphql/User.gql')"
                     :variables="{id: userId}"
                     class="navbar-end"
        >
            <ApolloSubscribeToMore
                    :document="require('../graphql/UserUpdated.gql')"
                    :update-query="onUserUpdated"
            />
            <template slot-scope="{ result: { loading, error, data } }">
            <div v-if="data" class="navbar-item">
                    <img :src="data.user.picUrl"
                         class="user_img" alt="Image" width="64" height="64">
                    <p>
                        <strong>{{ data.user.name | capitalize}}</strong>
                        <small>@{{ data.user.name | truncate }}</small>
                        <br>
                        <span>Your Balance: {{ data.user.balance | capitalize}}</span>
                    </p>
            </div>
            </template>
        </ApolloQuery>
    </nav>
</template>

<script>
import User from '../graphql/User.gql';

export default {
  name: 'Navbar',
  props: ['currentUser'],
  methods: {
    onUserUpdated() {
      const store = this.$apolloProvider.defaultClient;
      store.readQuery({ query: User, variables: { id: this.userId } });
    },
  },
  watch: {
    currentUser(value) {
      this.userId = value.id;
    },
  },
  data() {
    return {
      userId: this.currentUser.id,
    };
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      const cap = value.toString();
      return cap.charAt(0).toUpperCase() + cap.slice(1);
    },
    truncate(value) {
      if (!value) return '';
      return value.toString().replace(/\s/g, '');
    },
  },
};
</script>

<style scoped>
    img.user_img {
        margin: 10px;
        max-height: 64px;
        border-radius: 50%;
    }
</style>
