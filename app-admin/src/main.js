import 'bulma/css/bulma.css';
import lodash from 'lodash';
import Vue from 'vue';
import App from './App.vue';
import { apolloProvider } from './vue-apollo';

Vue.config.productionTip = false;
Object.defineProperty(Vue.prototype, '$lodash', { value: lodash });

new Vue({
  provide: apolloProvider.provide(),
  render: h => h(App),
}).$mount('#app');
