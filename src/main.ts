import Vue from 'vue';
import VueNotification from 'vue-notification';

import './startups/socket';
import './startups/outlook-auth';
import './startups/element-ui-prod.js';
import './styles.scss';
import App from './app';
import Store from './store';

Vue.config.productionTip = false;
Vue.use(VueNotification);

let _ = new Vue({
    el: '#app',
    store: Store.store,
    render: _ => _(App)
});

const TransparencyMouseFix = require('electron-transparency-mouse-fix');
_ = new TransparencyMouseFix({ log: true, fixPointerEvents: 'auto' });
