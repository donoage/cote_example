<template>
    <div class="hello">
        <ApolloQuery
                :query="require('../graphql/Hello.gql')"
        >
            <template slot-scope="{ result: { loading, error, data, startPolling, stopPolling } }">
                <!-- Loading -->
                <div v-if="loading" class="loading apollo">
                    <img src="../assets/loader.gif"/> Loading...
                </div>

                <!-- Error -->
                <div v-else-if="error" class="error apollo">An error occured</div>

                <!-- Result -->
                <div
                        v-else-if="data"
                        v-for="user of data.users"
                        :key="user.name"
                        class="message"
                >
                    {{ user.name }}
                    {{ user.balance }}
                </div>

                <!-- No result -->
                <div v-else class="no-result apollo">No result :(</div>
            </template>
        </ApolloQuery>
    </div>

</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  apollo: {
    users: {
      query: gql`query {
          users {
            _id
            name
            balance
            pic_url
          }
        }`,
      subscribeToMore: {
        document: gql`subscription onUserCreated {
            userCreated {
                _id
                name
                balance
                pic_url
            }
          }`,
        // Mutate the previous result
        updateQuery: (previousResult, { subscriptionData }) => {
          console.log(previousResult);
          console.log(subscriptionData);
          // Here, return the new result from the previous with the new data
          return {
            users: [
              ...previousResult.users,
              subscriptionData.data.userCreated,
            ],
          };
        },
      },
    },
  },
  data() {
    return {
      hello: '',
      users: [],
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
