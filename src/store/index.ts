import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import GithubStore from './github/github.store';

Vue.use(Vuex);

const githubStoreName = 'githubStore';

const store = new Store<any>({
    modules: {
        [githubStoreName]: GithubStore
    }
});

export default {
    store,
    githubStoreName
};
