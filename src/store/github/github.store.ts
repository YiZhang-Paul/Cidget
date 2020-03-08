import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ICommit from '../../core/interface/source-control/code-commit/commit.interface';
import IPullRequest from '../../core/interface/source-control/pull-request/pull-request.interface';
import IGithubUser from '../../core/interface/source-control/github/github-user.interface';
import GithubCommitService from '../../core/service/source-control/github/github-commit/github-commit.service';
import GithubPullRequestService from '../../core/service/source-control/github/github-pull-request/github-pull-request.service';

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

        if (getters.hasCommit(push) || push.initiator.name === 'web-flow') {
            return;
        }
        commit('addCommit', push);

        Vue.notify({
            group: 'notification',
            duration: 10000,
            data: { type: NotificationType.Commit, id: push.id, model: push }
        });
    },
    async addPullRequest(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const pullRequest = await pullRequestService.toPullRequest(payload);
        const existing = state.pullRequests.find(_ => _.id === pullRequest.id);
        const action = existing ? 'updatePullRequest' : 'addPullRequest';
        pullRequest.mergeable = existing ? existing.mergeable : pullRequest.mergeable;
        commit(action, pullRequest);

        Vue.notify({
            group: 'notification',
            duration: pullRequest.isActive ? -1 : 10000,
            data: { type: NotificationType.PullRequest, id: pullRequest.id, model: pullRequest }
        });
    },
    async addPullRequestReview(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const { pullRequestId, type, reviewer } = await pullRequestService.toReview(payload);
        const pullRequest = state.pullRequests.find(_ => _.id === pullRequestId);

        if (!pullRequest || type === 'commented') {
            return;
        }
        const { requested, approved } = pullRequest.reviewers;
        const isApprover = approved.some(_ => _.name === reviewer.name);

        if (type === 'approved' && isApprover || type === 'change' && !isApprover) {
            return;
        }

        if (requested.every(_ => _.name !== reviewer.name)) {
            requested.push(reviewer);
        }

        if (type === 'approved') {
            pullRequest.reviewers.approved.push(reviewer);
        }
        else {
            pullRequest.reviewers.approved = approved.filter(_ => _.name !== reviewer.name);
        }
        commit('updatePullRequest', pullRequest);

        Vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.PullRequest, id: pullRequest.id, model: pullRequest }
        });
    },
    async addPullRequestCheck(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const { repository, sha } = payload;
        const { name, owner } = repository;
        const { ref, status } = await commitService.getStatus(name, sha, owner.login);
        const isMergeable = status === 'pending' ? null : status === 'success';
        const pullRequest = state.pullRequests.find(_ => _.headCommitSha === ref);

        if (!pullRequest || !pullRequest.isActive || pullRequest.mergeable === isMergeable) {
            return;
        }
        pullRequest.mergeable = isMergeable;
        commit('updatePullRequest', pullRequest);

        Vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.PullRequest, id: pullRequest.id, model: pullRequest }
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
