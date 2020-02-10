import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import ZendeskStore from './zendesk/zendesk.store';
import AzureDevopsStore from './azure-devops/azure-devops.store';
import GithubStore from './github/github.store';

Vue.use(Vuex);

const zendeskStoreName = 'zendeskStore';
const azureDevopsStoreName = 'azureDevopsStore';
const githubStoreName = 'githubStore';

const store = new Store<any>({
    modules: {
        [zendeskStoreName]: ZendeskStore,
        [azureDevopsStoreName]: AzureDevopsStore,
        [githubStoreName]: GithubStore
    }
});

export default {
    store,
    zendeskStoreName,
    azureDevopsStoreName,
    githubStoreName
};
