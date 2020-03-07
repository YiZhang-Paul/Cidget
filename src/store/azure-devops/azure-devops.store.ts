import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ICiBuild from '../../core/interface/devops/ci/ci-build.interface';
import ICdRelease from '../../core/interface/devops/cd/cd-release.interface';
import AzureDevopsCiBuildService from '../../core/service/devops/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../../core/service/pipeline/azure-devops/azure-devops-cd-release/azure-devops-cd-release.service';

type State = {
    ciBuilds: ICiBuild[],
    cdReleases: ICdRelease[]
};

let autoNotifyAfterApproval: boolean;
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
            duration: 10000,
            data: { type: NotificationType.CiBuild, id: build.id, model: build }
        });
    },
    async addCdRelease(context: ActionContext<State, any>, payload: any): Promise<any> {
        const { commit, getters, dispatch } = context;
        const release = await releaseService.toCdRelease(payload);
        const lastStageStatus = release.stages?.slice(-1)[0]?.status ?? 'succeeded';
        const isApproval = release.status === 'approved';
        const shouldSkipSuccess = release.status === 'succeeded' && lastStageStatus !== 'succeeded';

        if (isApproval || shouldSkipSuccess) {
            return isApproval ? dispatch('notifyApproval', release) : null;
        }
        const action = getters.hasCdRelease(release) ? 'updateCdRelease' : 'addCdRelease';
        commit(action, release);
        autoNotifyAfterApproval = false;

        Vue.notify({
            group: 'notification',
            duration: release.status === 'needs approval' ? -1 : 10000,
            data: { type: NotificationType.CdRelease, id: release.id, model: release }
        });
    },
    notifyApproval(context: ActionContext<State, any>, release: ICdRelease): void {
        if (release.status !== 'approved') {
            throw new Error('Invalid status for approval notification');
        }
        const { commit } = context;
        const [group, duration] = ['notification', 10000];
        const [type, id] = [NotificationType.CdRelease, release.id];
        commit('addCdRelease', release);
        Vue.notify({ group, duration, data: { type, id, model: release } });
        autoNotifyAfterApproval = true;

        setTimeout(() => {
            if (!autoNotifyAfterApproval) {
                return;
            }
            const clone = Object.assign({}, release, { status: 'in progress' });
            commit('updateCdRelease', clone);
            Vue.notify({ group, duration, data: { type, id, model: clone } });
            autoNotifyAfterApproval = false;
        }, 3000);
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
    autoNotifyAfterApproval = false;
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
