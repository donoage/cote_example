import 'bulma/css/bulma.css';
import lodash from 'lodash';
import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import { apolloProvider } from './vue-apollo';

Vue.config.productionTip = false;
Object.defineProperty(Vue.prototype, '$lodash', { value: lodash });
Vue.use(VueResource);

new Vue({
  provide: apolloProvider.provide(),
  render: h => h(App),
}).$mount('#app');
