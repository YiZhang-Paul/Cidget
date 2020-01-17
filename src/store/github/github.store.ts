import { ActionContext, StoreOptions } from 'vuex';

import ICommit from '../../core/interface/general/commit.interface';
import IGithubUser from '../../core/interface/repository/github/github-user.interface';
import GithubRepositoryProvider from '../../core/service/repository/github/github-repository-provider.service';
import GithubCommitService from '../../core/service/repository/github/github-commit.service';

type State = { commits: ICommit<IGithubUser>[] };

let repositoryProvider: GithubRepositoryProvider;
let commitService: GithubCommitService;

const mutations = {
    addCommit(state: State, commit: ICommit<IGithubUser>): void {
        state.commits.unshift(commit);
    }
};

const actions = {
    async addCommit(context: ActionContext<State, any>, payload: any): Promise<void> {
        const { commit } = context;
        commit('addCommit', await commitService.toCommit(payload));
    }
};

const getters = {
    getCommits(state: State): ICommit<IGithubUser>[] {
        return state.commits;
    }
};

export const createStore = () => {
    repositoryProvider = new GithubRepositoryProvider();
    commitService = new GithubCommitService(repositoryProvider);
    const state: State = { commits: [] };

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
