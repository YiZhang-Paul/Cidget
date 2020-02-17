import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import IGithubUser from '../../core/interface/repository/github/github-user.interface';
import ICommit from '../../core/interface/repository/commit.interface';
import ICommitStatus from '../../core/interface/repository/commit-status.interface';
import IPullRequest from '../../core/interface/repository/pull-request.interface';
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
            async getStatus(_a: any, _b: any, _c: any): Promise<ICommitStatus> {
                return ({} as ICommitStatus);
            },
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
            pullRequest = { id: '147', action: 'opened', isActive: true };
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
            const updated = { id: '147', action: 'merged', isActive: false };
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
            const updated = { id: '147', action: 'reopened', isActive: true };
            store.state.pullRequests = [pullRequest];
            pullRequestServiceStub.toPullRequest.resolves(updated);

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('pull-request');
        });

        test('should trigger temporary notification when pull request is inactive', async () => {
            pullRequest.action = 'closed';
            pullRequest.isActive = false;
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
        });

        test('should ignore review request removed event', async () => {
            pullRequest.action = 'review_request_removed';
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            sinonExpect.notCalled(notifySpy);
            expect(store.state.pullRequests.length).toBe(0);
        });
    });

    describe('addPullRequestCheck', () => {
        let payload: any;
        let pullRequest: any;
        let status: any;

        beforeEach(() => {
            payload = { repository: { name: 'cidget' } };
            pullRequest = { id: '147', mergeable: true, headCommitSha: 'head_sha', isActive: true };
            status = { ref: 'head_sha', status: 'pending' };
            store.state.pullRequests = [pullRequest];
            commitServiceStub.getStatus.resolves(status);
        });

        test('should update pull request', async () => {
            await store.dispatch('addPullRequestCheck', payload);

            expect(pullRequest.mergeable).toBeNull();
        });

        test('should trigger notification', async () => {
            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('pull-request');
        });

        test('should not trigger notification when no pull request found', async () => {
            store.state.pullRequests = [];

            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.notCalled(notifySpy);
            expect(pullRequest.mergeable).toBeTruthy();
        });

        test('should not trigger notification when pull request is inactive', async () => {
            pullRequest.isActive = false;

            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.notCalled(notifySpy);
            expect(pullRequest.mergeable).toBeTruthy();
        });

        test('should not trigger notification when pull request mergeable status is unchanged', async () => {
            status.status = 'success';

            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.notCalled(notifySpy);
            expect(pullRequest.mergeable).toBeTruthy();
        });
    });
});
