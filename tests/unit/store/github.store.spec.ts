import 'reflect-metadata';
import Vue from 'vue';
import Vuex, { Store } from "vuex";
import VueNotification from 'vue-notification';
import { stub } from 'sinon';

import Types from '../../../src/core/ioc/types';
import Container from '../../../src/core/ioc/container';
import { createStore } from '../../../src/store/github/github.store';
import IGithubUser from '../../../src/core/interface/repository/github/github-user.interface';
import ICommit from '../../../src/core/interface/general/commit.interface';
import IPullRequest from '../../../src/core/interface/general/pull-request.interface';
import GithubCommitService from '../../../src/core/service/repository/github/github-commit.service';
import GithubPullRequestService from '../../../src/core/service/repository/github/github-pull-request.service';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('github store unit test', () => {
    let store: Store<any>;
    let commitServiceStub: any;
    let pullRequestServiceStub: any;

    beforeEach(() => {
        Container.snapshot();

        commitServiceStub = stub({
            async toCommit(_: any): Promise<ICommit<IGithubUser>> {
                return ({} as ICommit<IGithubUser>);
            }
        } as GithubCommitService);

        pullRequestServiceStub = stub({
            async toPullRequest(_: any): Promise<IPullRequest<IGithubUser>> {
                return ({} as IPullRequest<IGithubUser>);
            }
        } as GithubPullRequestService);

        Container
            .rebind<GithubCommitService>(Types.GithubCommitService)
            .toConstantValue(commitServiceStub);

        Container
            .rebind<GithubPullRequestService>(Types.GithubPullRequestService)
            .toConstantValue(pullRequestServiceStub);

        store = new Store(createStore());
    });

    afterEach(() => {
        Container.restore();
    });

    describe('addCommit', () => {
        test('should add commit when it is not already included', async () => {
            const commit = { id: '147', initiator: { name: 'john' } };
            commitServiceStub.toCommit.resolves(commit);
            store.state.commits = [];

            await store.dispatch('addCommit', {});

            expect(store.state.commits.length).toBe(1);
            expect(store.state.commits[0].id).toBe('147');
            expect(store.state.commits[0].initiator.name).toBe('john');
        });
    });
});
