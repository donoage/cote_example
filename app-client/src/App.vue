<template>
  <div id="app" class="container is-widescreen" v-cloak>
    <Navbar :currentUser="user"/>
    <Header/>
    <br>
    <Main v-if="user" :currentUser="user"/>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Main from './components/content/Main.vue';
import Header from './components/Header.vue';

import UserCreate from './graphql/UserCreate.gql';

export default {
  name: 'app',
  components: {
    Navbar,
    Header,
    Main,
  },
  data() {
    return {
      user: {},
    };
  },
  mounted() {
    this.$http.get('https://randomuser.me/api').then((res) => {
      const firstName = this.$options.filters.capitalize(res.body.results[0].name.first);
      const lastName = this.$options.filters.capitalize(res.body.results[0].name.last);
      const fullName = `${firstName} ${lastName}`;
      const picUrl = res.body.results[0].picture.thumbnail;

      this.$apollo.mutate({
        mutation: UserCreate,
        variables: {
          name: fullName,
          balance: 100,
          picUrl,
        },
      }).then((response) => {
        this.user = {
          id: response.data.createUser._id,
          name: response.data.createUser.name,
          balance: response.data.createUser.balance,
          picUrl: response.data.createUser.picUrl,
        };
      }).catch((error) => {
        console.log(error);
      });
    }, (res) => {
      console.log(res);
    });
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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
[v-cloak] > * { display:none }
[v-cloak]::before { content: "LOADING…" }
</style>
