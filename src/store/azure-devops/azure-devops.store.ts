import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import ICiBuild from '../../core/interface/general/ci-build.interface';
import AzureDevopsCiBuildService from '../../core/service/pipeline/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';

type State = {
    ciBuilds: ICiBuild[]
};

let buildService: AzureDevopsCiBuildService;

const mutations = {
    addCiBuild(state: State, build: ICiBuild): void {
        state.ciBuilds.unshift(build);
    }
};

const actions = {
    async addCiBuild(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit } = context;
        const build = await buildService.toCiBuild(payload);
        commit('addCiBuild', build);

        Vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'ci-build', id: build.id }
        });
    }
};

const getters = {
    getCiBuilds(state: State): ICiBuild[] {
        return state.ciBuilds;
    }
};

export const createStore = () => {
    buildService = Container.get<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService);
    const state: State = { ciBuilds: [] };

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
