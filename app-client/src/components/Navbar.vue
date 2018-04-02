<template>
    <nav class="navbar" role="navigation" aria-label="dropdown navigation">
        <div class="logo animated jello">
            <img src="https://static1.squarespace.com/static/59975f9a9f7456d2866ec54e/t/599c7d5b893fc0a2909944f6/1521153598582/?format=1500w"
                 alt=""
                 width="95">
        </div>
        <div class="navbar-end" v-if="user">
            <img :src="user.picUrl"
                 class="user_img" alt="Image" width="64" height="64">
            <div class="navbar-item">
                <p>
                    <strong>{{ user.name | capitalize}}</strong>
                    <small>@{{ user.name | truncate }}</small>
                    <br>
                    <span>Your Balance: {{ user.balance | capitalize}}</span>
                </p>
            </div>
        </div>
    </nav>
</template>

<script>
import UserCreate from '../graphql/UserCreate.gql';

export default {
  name: 'Navbar',
  data() {
    return {
      user: {
        id: '',
        name: 'test',
        balance: 0,
        picUrl: '',
      },
      userLoading: 0,
    };
  },
  created() {
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
        this.user.name = response.data.createUser.name;
        this.user.balance = response.data.createUser.balance;
        this.user.picUrl = response.data.createUser.picUrl;
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

<style scoped>
    img.user_img {
        height: 64px;
        border-radius: 50%;
        margin-top: 7%;
    }
</style>
