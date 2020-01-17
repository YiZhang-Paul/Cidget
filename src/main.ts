import Vue from 'vue';

import './socket';
import './element-ui.js';
import './styles.scss';
import App from './app';
import Store from './store';

Vue.config.productionTip = false;

const _ = new Vue({
    el: '#app',
    store: Store.store,
    render: _ => _(App)
});
