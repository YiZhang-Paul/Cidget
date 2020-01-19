import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import ICommit from '../../core/interface/general/commit.interface';
import IPullRequest from '../../core/interface/general/pull-request.interface';
import IGithubUser from '../../core/interface/repository/github/github-user.interface';
import LanguageNameResolver from '../../core/service/resolver/language-name-resolver';
import LicenseNameResolver from '../../core/service/resolver/license-name-resolver';
import GithubRepositoryProvider from '../../core/service/repository/github/github-repository-provider.service';
import GithubCommitService from '../../core/service/repository/github/github-commit.service';
import GithubPullRequestService from '../../core/service/repository/github/github-pull-request.service';

type State = {
    commits: ICommit<IGithubUser>[],
    pullRequests: IPullRequest<IGithubUser>[]
};

let languageResolver: LanguageNameResolver;
let licenseResolver: LicenseNameResolver;
let repositoryProvider: GithubRepositoryProvider;
let commitService: GithubCommitService;
let pullRequestService: GithubPullRequestService;

const mutations = {
    addCommit(state: State, commit: ICommit<IGithubUser>): void {
        state.commits.unshift(commit);
    },
    addPullRequests(state: State, pullRequest: IPullRequest<IGithubUser>): void {
        state.pullRequests.unshift(pullRequest);
    }
};

const actions = {
    async addCommit(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const githubCommit = await commitService.toCommit(payload);

        if (!getters.hasCommit(githubCommit)) {
            commit('addCommit', githubCommit);

            Vue.notify({
                group: 'notification',
                text: `commit|${githubCommit.id}`,
                duration: 12000
            });
        }
    },
    async addPullRequest(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit, getters } = context;
        const pullRequest = await pullRequestService.toPullRequest(payload);

        if (!getters.hasPullRequest(pullRequest)) {
            commit('addPullRequests', pullRequest);

            Vue.notify({
                group: 'notification',
                text: `pull-request|${pullRequest.id}`,
                duration: pullRequest.action === 'closed' ? 12000 : -1
            });
        }
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
    languageResolver = new LanguageNameResolver();
    licenseResolver = new LicenseNameResolver();
    repositoryProvider = new GithubRepositoryProvider(languageResolver, licenseResolver);
    commitService = new GithubCommitService(repositoryProvider);
    pullRequestService = new GithubPullRequestService(repositoryProvider);
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
