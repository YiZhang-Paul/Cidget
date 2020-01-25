import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import ICiBuild from '../../core/interface/general/ci-build.interface';
import ICdRelease from '../../core/interface/general/cd-release.interface';
import AzureDevopsCiBuildService from '../../core/service/pipeline/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../../core/service/pipeline/azure-devops/azure-devops-cd-release/azure-devops-cd-release';

type State = {
    ciBuilds: ICiBuild[],
    cdReleases: ICdRelease[]
};

let buildService: AzureDevopsCiBuildService;
let releaseService: AzureDevopsCdReleaseService;

const mutations = {
    addCiBuild(state: State, build: ICiBuild): void {
        state.ciBuilds.unshift(build);
    },
    updateCiBuild(state: State, build: ICiBuild): void {
        state.ciBuilds = state.ciBuilds.filter(_ => _.id !== build.id);
        state.ciBuilds.unshift(build);
    },
    addCdRelease(state: State, release: ICdRelease): void {
        state.cdReleases.unshift(release);
    },
    updateCdRelease(state: State, release: ICdRelease): void {
        state.cdReleases = state.cdReleases.filter(_ => _.id !== release.id);
        state.cdReleases.unshift(release);
    }
};

const actions = {
    async addCiBuild(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const build = await buildService.toCiBuild(payload);
        const action = getters.hasCiBuild(build) ? 'updateCiBuild' : 'addCiBuild';
        commit(action, build);

        Vue.notify({
            group: 'notification',
            duration: 12000,
            data: { type: 'ci-build', id: build.id }
        });
    },
    async addCdRelease(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const release = await releaseService.toCdRelease(payload);
        const action = getters.hasCdRelease(release) ? 'updateCdRelease' : 'addCdRelease';
        const lastStageStatus = release.stages?.slice(-1)[0]?.status ?? 'succeeded';

        if (release.status === 'succeeded' && lastStageStatus !== 'succeeded') {
            return;
        }
        commit(action, release);

        Vue.notify({
            group: 'notification',
            duration: release.status === 'needs approval' ? -1 : 12000,
            data: { type: 'cd-release', id: release.id }
        });
    }
};

const getters = {
    getCiBuilds(state: State): ICiBuild[] {
        return state.ciBuilds;
    },
    hasCiBuild(state: State): Function {
        return (build: ICiBuild): boolean => {
            return state.ciBuilds.some(_ => _.id === build.id);
        };
    },
    getCdReleases(state: State): ICdRelease[] {
        return state.cdReleases;
    },
    hasCdRelease(state: State): Function {
        return (release: ICdRelease): boolean => {
            return state.cdReleases.some(_ => _.id === release.id);
        };
    }
};

export const createStore = () => {
    buildService = Container.get<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService);
    releaseService = Container.get<AzureDevopsCdReleaseService>(Types.AzureDevopsCdReleaseService);
    const state: State = { ciBuilds: [], cdReleases: [] };

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
