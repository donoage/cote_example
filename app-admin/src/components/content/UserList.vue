<template>
    <article class="tile is-child box">
        <p class="title">User</p>
        <p class="subtitle">List</p>
        <div class="content">
            <ApolloQuery :query="require('../../graphql/Users.gql')">
                <ApolloSubscribeToMore
                        :document="require('../../graphql/UserCreated.gql')"
                        :update-query="onUserCreated"
                />
                <template slot-scope="{ result: { loading, error, data } }">
                    <!-- Loading -->
                    <div v-if="loading" class="loading apollo">
                        <img src="../../assets/loader.gif"/> Loading...
                    </div>
                    <!-- Error -->
                    <div v-else-if="error" class="error apollo">An error occurred.</div>
                    <!-- Result -->
                    <table v-else-if="data" class="table is-fullwidth">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Balance</th>
                        </tr>
                        </thead>
                        <tbody v-for="user of data.users"
                               :key="user.name"
                        >
                        <tr>
                            <th>{{ user.name }}</th>
                            <td>{{ user.balance }}</td>
                        </tr>
                        </tbody>
                    </table>
                    <!-- No result -->
                    <div v-else class="no-result apollo">No result :(</div>
                </template>
            </ApolloQuery>
        </div>
    </article>
</template>

<script>
export default {
  name: 'UserList',
  methods: {
    onUserCreated(previousResult, { subscriptionData }) {
      return {
        users: [
          ...previousResult.users,
          subscriptionData.data.userCreated,
        ],
      };
    },
  },
  data() {
    return {
      users: [],
    };
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
