import Vue from 'vue';

import App from './app';
import './server';

Vue.config.productionTip = false;

const _ = new Vue({
    el: '#app',
    render: _ => _(App)
});
