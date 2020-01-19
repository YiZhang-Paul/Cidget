import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import ICommit from '../../core/interface/general/commit.interface';
import IPullRequest from '../../core/interface/general/pull-request.interface';
import IGithubUser from '../../core/interface/repository/github/github-user.interface';
import GithubCommitService from '../../core/service/repository/github/github-commit.service';
import GithubPullRequestService from '../../core/service/repository/github/github-pull-request.service';

type State = {
    commits: ICommit<IGithubUser>[],
    pullRequests: IPullRequest<IGithubUser>[]
};

let commitService: GithubCommitService;
let pullRequestService: GithubPullRequestService;

const mutations = {
    addCommit(state: State, commit: ICommit<IGithubUser>): void {
        state.commits.unshift(commit);
    },
    addPullRequest(state: State, pullRequest: IPullRequest<IGithubUser>): void {
        state.pullRequests.unshift(pullRequest);
    },
    updatePullRequest(state: State, pullRequest: IPullRequest<IGithubUser>): void {
        state.pullRequests = state.pullRequests.filter(_ => _.id !== pullRequest.id);
        state.pullRequests.unshift(pullRequest);
    }
};

const actions = {
    async addCommit(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const push = await commitService.toCommit(payload);

        if (!getters.hasCommit(push) && push.initiator.name !== 'web-flow') {
            commit('addCommit', push);

            Vue.notify({
                group: 'notification',
                duration: 12000,
                data: { type: 'commit', id: push.id }
            });
        }
    },
    async addPullRequest(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const pullRequest = await pullRequestService.toPullRequest(payload);
        const shouldPersist = pullRequest.action !== 'closed' && pullRequest.action !== 'merged';
        const action = !getters.hasPullRequest(pullRequest) ? 'addPullRequest' : 'updatePullRequest';
        commit(action, pullRequest);

        Vue.notify({
            group: 'notification',
            duration: shouldPersist ? -1 : 12000,
            data: { type: 'pull-request', id: pullRequest.id }
        });
    }
};

const getters = {
    getCommits(state: State): ICommit<IGithubUser>[] {
        return state.commits;
    },
    hasCommit(state: State): Function {
        return (commit: ICommit<IGithubUser>): boolean => {
            return state.commits.some(_ => _.id === commit.id);
        };
    },
    getPullRequests(state: State): IPullRequest<IGithubUser>[] {
        return state.pullRequests;
    },
    hasPullRequest(state: State): Function {
        return (pullRequest: IPullRequest<IGithubUser>): boolean => {
            return state.pullRequests.some(_ => _.id === pullRequest.id);
        };
    }
};

export const createStore = () => {
    commitService = Container.get<GithubCommitService>(Types.GithubCommitService);
    pullRequestService = Container.get<GithubPullRequestService>(Types.GithubPullRequestService);
    const state: State = { commits: [], pullRequests: [] };

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
