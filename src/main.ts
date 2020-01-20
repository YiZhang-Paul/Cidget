import Vue from 'vue';
import VueNotification from 'vue-notification';

import './socket';
import './element-ui.js';
import './styles.scss';
import App from './app';
import Store from './store';

Vue.config.productionTip = false;
Vue.use(VueNotification);

const _ = new Vue({
    el: '#app',
    store: Store.store,
    render: _ => _(App)
});
