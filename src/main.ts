import Vue from 'vue';

import './socket';
import './element-ui.js';
import App from './app';

Vue.config.productionTip = false;

const _ = new Vue({
    el: '#app',
    render: _ => _(App)
});
