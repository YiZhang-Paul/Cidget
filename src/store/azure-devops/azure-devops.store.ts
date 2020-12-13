import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ICiBuild from '../../core/interface/devops/ci/ci-build.interface';
import ICdRelease from '../../core/interface/devops/cd/cd-release.interface';
import AzureDevopsCiBuildService from '../../core/service/devops/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../../core/service/devops/azure-devops/azure-devops-cd-release/azure-devops-cd-release.service';
import NotificationHandler from '../../core/service/io/notification-handler/notification-handler';

type State = {
    ciBuilds: ICiBuild[],
    cdReleases: ICdRelease[]
};

let autoNotifyAfterApproval: boolean;
let buildService: AzureDevopsCiBuildService;
let releaseService: AzureDevopsCdReleaseService;
let notificationHandler: NotificationHandler;
const logoUrl = require('../../../public/images/azure-devops-logo.png');

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

        notificationHandler.push(NotificationType.CiBuild, {
            group: 'notification',
            duration: 4500,
            data: { type: NotificationType.CiBuild, id: build.id, logoUrl, model: build }
        });
    },
    async manageCdRelease(context: ActionContext<State, any>, payload: any): Promise<any> {
        const { dispatch } = context;
        const release = await releaseService.toCdRelease(payload);
        const finalStatus = release.stages?.slice(-1)[0]?.status ?? 'succeeded';

        if (release.status === 'succeeded' && finalStatus !== 'succeeded') {
            return;
        }
        dispatch('addCdRelease', release);

        if (release.status === 'approved') {
            dispatch('notifyApproval', release);
        }
    },
    addCdRelease(context: ActionContext<State, any>, release: ICdRelease): any {
        const { commit, getters } = context;
        const action = getters.hasCdRelease(release) ? 'updateCdRelease' : 'addCdRelease';
        commit(action, release);
        autoNotifyAfterApproval = false;

        notificationHandler.push(NotificationType.CdRelease, {
            group: 'notification',
            duration: release.status === 'needs approval' ? -1 : 4500,
            data: { type: NotificationType.CdRelease, id: release.id, logoUrl, model: release }
        });
    },
    notifyApproval(context: ActionContext<State, any>, release: ICdRelease): void {
        autoNotifyAfterApproval = true;

        setTimeout(() => {
            if (!autoNotifyAfterApproval) {
                return;
            }
            const clone = Object.assign({}, release, { status: 'in progress' });
            context.dispatch('addCdRelease', clone);
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
    const state: State = { ciBuilds: [], cdReleases: [] };
    autoNotifyAfterApproval = false;
    buildService = Container.get<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService);
    releaseService = Container.get<AzureDevopsCdReleaseService>(Types.AzureDevopsCdReleaseService);
    notificationHandler = Container.get<NotificationHandler>(Types.NotificationHandler);

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
