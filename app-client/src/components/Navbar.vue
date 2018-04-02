<template>
    <nav class="navbar" role="navigation" aria-label="dropdown navigation">
        <div class="logo animated jello">
            <img src="https://static1.squarespace.com/static/59975f9a9f7456d2866ec54e/t/599c7d5b893fc0a2909944f6/1521153598582/?format=1500w"
                 alt=""
                 width="95">
        </div>
        <div class="navbar-end" v-if="currentUser">
            <img :src="currentUser.picUrl"
                 class="user_img" alt="Image" width="64" height="64">
            <div class="navbar-item">
                <p>
                    <strong>{{ currentUser.name | capitalize}}</strong>
                    <small>@{{ currentUser.name | truncate }}</small>
                    <br>
                    <span>Your Balance: {{ currentUser.balance | capitalize}}</span>
                </p>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: ['currentUser'],
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
