import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ICommit from '../../core/interface/source-control/code-commit/commit.interface';
import IPullRequest from '../../core/interface/source-control/pull-request/pull-request.interface';
import IGithubUser from '../../core/interface/source-control/github/github-user.interface';
import GithubCommitService from '../../core/service/source-control/github/github-commit/github-commit.service';
import GithubPullRequestService from '../../core/service/source-control/github/github-pull-request/github-pull-request.service';
import PullRequestAction from '../../core/enum/pull-request-action.enum';
import NotificationHandler from '../../core/service/io/notification-handler/notification-handler';

type State = {
    commits: ICommit<IGithubUser>[],
    pullRequests: IPullRequest<IGithubUser>[]
};

let commitService: GithubCommitService;
let pullRequestService: GithubPullRequestService;
let notificationHandler: NotificationHandler;

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

        if (getters.hasCommit(push) || push.initiator.name === 'auto-commit') {
            return;
        }
        commit('addCommit', push);

        notificationHandler.push(NotificationType.Commit, {
            group: 'notification',
            duration: 10000,
            data: { type: NotificationType.Commit, id: push.id, model: push }
        });
    },
    async addPullRequest(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const pullRequest = await pullRequestService.toPullRequest(payload);
        const existing = state.pullRequests.find(_ => _.id === pullRequest.id);

        if (existing?.action === 'needs review' && pullRequest.action === 'opened') {
            return;
        }
        const action = existing ? 'updatePullRequest' : 'addPullRequest';
        pullRequest.mergeable = existing ? existing.mergeable : pullRequest.mergeable;
        commit(action, pullRequest);

        notificationHandler.push(NotificationType.PullRequest, {
            group: 'notification',
            duration: pullRequest.action === 'needs review' ? -1 : 10000,
            data: { type: NotificationType.PullRequest, id: pullRequest.id, model: pullRequest }
        });
    },
    async addPullRequestReview(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const { pullRequestId, type, reviewer } = await pullRequestService.toReview(payload);
        const pullRequest = shallowClone(state.pullRequests.find(_ => _.id === pullRequestId));

        if (!pullRequest || !setReviewer(pullRequest, type, reviewer)) {
            return;
        }
        pullRequest.action = type === 'approved' ? PullRequestAction.Approved : PullRequestAction.Rejected;
        commit('updatePullRequest', pullRequest);

        notificationHandler.push(NotificationType.PullRequest, {
            group: 'notification',
            duration: 10000,
            data: { type: NotificationType.PullRequest, id: pullRequest.id, model: pullRequest }
        });
    },
    async addPullRequestCheck(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, state } = context;
        const { repository, sha } = payload;
        const { name, owner } = repository;
        const { ref, status } = await commitService.getStatus(name, sha, owner.login);
        const isMergeable = status === 'pending' ? null : status === 'success';
        const pullRequest = shallowClone(state.pullRequests.find(_ => _.headCommitSha === ref));

        if (!pullRequest || !pullRequest.isActive || pullRequest.mergeable === isMergeable) {
            return;
        }

        if (isMergeable === null) {
            pullRequest.action = PullRequestAction.CheckRunning;
        }
        else {
            pullRequest.action = isMergeable ? PullRequestAction.CheckPassed : PullRequestAction.CheckFailed;
        }
        pullRequest.mergeable = isMergeable;
        commit('updatePullRequest', pullRequest);

        notificationHandler.push(NotificationType.PullRequest, {
            group: 'notification',
            duration: 10000,
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

function setReviewer(pullRequest: IPullRequest<IGithubUser>, type: string, reviewer: IGithubUser): boolean {
    const { requested, approved } = pullRequest.reviewers;
    const isApprover = approved.some(_ => _.name === reviewer.name);
    const shouldInclude = type === 'approved' && !isApprover;
    const shouldExclude = type === 'change' && isApprover;

    if (!shouldInclude && !shouldExclude) {
        return false;
    }

    if (type === 'approved') {
        pullRequest.reviewers.approved.push(reviewer);
    }
    else {
        pullRequest.reviewers.approved = approved.filter(_ => _.name !== reviewer.name);
    }

    if (requested.every(_ => _.name !== reviewer.name)) {
        requested.push(reviewer);
    }
    return true;
}

function shallowClone(data: any): any {
    return data ? Object.assign({}, data) : null;
}

export const createStore = () => {
    const state: State = { commits: [], pullRequests: [] };
    commitService = Container.get<GithubCommitService>(Types.GithubCommitService);
    pullRequestService = Container.get<GithubPullRequestService>(Types.GithubPullRequestService);
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
