import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import AzureDevopsStore from './azure-devops/azure-devops.store';
import GithubStore from './github/github.store';

Vue.use(Vuex);

const azureDevopsStoreName = 'azureDevopsStore';
const githubStoreName = 'githubStore';

const store = new Store<any>({
    modules: {
        [azureDevopsStoreName]: AzureDevopsStore,
        [githubStoreName]: GithubStore
    }
});

export default {
    store,
    azureDevopsStoreName,
    githubStoreName
};
