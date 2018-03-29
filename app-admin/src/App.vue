<template>
  <div id="app" class="container is-widescreen" v-cloak>
    <Navbar/>
    <Header/>
    <br>
    <Main/>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import Main from './components/content/Main.vue';
import Header from './components/Header.vue';

export default {
  name: 'app',
  components: {
    Navbar,
    Header,
    Main,
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
