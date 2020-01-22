import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import IGithubUser from '../../core/interface/repository/github/github-user.interface';
import ICommit from '../../core/interface/general/commit.interface';
import IPullRequest from '../../core/interface/general/pull-request.interface';
import GithubCommitService from '../../core/service/repository/github/github-commit/github-commit.service';
import GithubPullRequestService from '../../core/service/repository/github/github-pull-request/github-pull-request.service';

import { createStore } from './github.store';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('github store unit test', () => {
    let store: Store<any>;
    let notifySpy: any;
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

        notifySpy = spy(Vue, 'notify');
        store = new Store(createStore());
    });

    afterEach(() => {
        Container.restore();
        notifySpy.restore();
    });

    describe('addCommit', () => {
        let commit: any;

        beforeEach(() => {
            commit = { id: '147', initiator: { name: 'john' } };
            commitServiceStub.toCommit.resolves(commit);
        });

        test('should add commit when it is not already included', async () => {
            store.state.commits = [];

            await store.dispatch('addCommit', {});

            expect(store.getters.getCommits.length).toBe(1);
            expect(store.getters.getCommits[0].id).toBe('147');
            expect(store.getters.getCommits[0].initiator.name).toBe('john');
        });

        test('should not add commit when it is already included', async () => {
            store.state.commits = [commit];

            await store.dispatch('addCommit', {});

            expect(store.getters.getCommits.length).toBe(1);
            expect(store.getters.getCommits[0].id).toBe('147');
            expect(store.getters.getCommits[0].initiator.name).toBe('john');
        });

        test('should not add commit when the initiator is web flow', async () => {
            commit.initiator.name = 'web-flow';
            store.state.commits = [];

            await store.dispatch('addCommit', {});

            expect(store.getters.getCommits.length).toBe(0);
        });

        test('should trigger notification when commit is added', async () => {
            store.state.commits = [];

            await store.dispatch('addCommit', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].data.type).toBe('commit');
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].duration).toBe(12000);
        });
    });

    describe('addPullRequest', () => {
        let pullRequest: any;

        beforeEach(() => {
            pullRequest = { id: '147', action: 'opened' };
            pullRequestServiceStub.toPullRequest.resolves(pullRequest);
        });

        test('should add pull request when it is not already included', async () => {
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            expect(store.getters.getPullRequests.length).toBe(1);
            expect(store.getters.getPullRequests[0].id).toBe('147');
            expect(store.getters.getPullRequests[0].action).toBe('opened');
        });

        test('should update pull request when it is already included', async () => {
            const updated = { id: '147', action: 'merged' };
            store.state.pullRequests = [pullRequest];
            pullRequestServiceStub.toPullRequest.resolves(updated);

            await store.dispatch('addPullRequest', {});

            expect(store.getters.getPullRequests.length).toBe(1);
            expect(store.getters.getPullRequests[0].id).toBe('147');
            expect(store.getters.getPullRequests[0].action).toBe('merged');
        });

        test('should trigger notification when pull request is added', async () => {
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('pull-request');
        });

        test('should trigger notification when pull request is updated', async () => {
            const updated = { id: '147', action: 'reopened' };
            store.state.pullRequests = [pullRequest];
            pullRequestServiceStub.toPullRequest.resolves(updated);

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('pull-request');
        });

        test('should trigger temporary notification when pull request action is closed', async () => {
            pullRequest.action = 'closed';
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
        });

        test('should trigger temporary notification when pull request action is merged', async () => {
            const updated = { id: '147', action: 'merged' };
            store.state.pullRequests = [pullRequest];
            pullRequestServiceStub.toPullRequest.resolves(updated);

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
        });
    });
});