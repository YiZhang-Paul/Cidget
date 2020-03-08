import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import IGithubUser from '../../core/interface/source-control/github/github-user.interface';
import ICommit from '../../core/interface/source-control/code-commit/commit.interface';
import ICommitStatus from '../../core/interface/source-control/code-commit/commit-status.interface';
import IPullRequest from '../../core/interface/source-control/pull-request/pull-request.interface';
import IPullRequestReview from '../../core/interface/source-control/pull-request/pull-request-review.interface';
import GithubCommitService from '../../core/service/source-control/github/github-commit/github-commit.service';
import GithubPullRequestService from '../../core/service/source-control/github/github-pull-request/github-pull-request.service';

import { createStore } from './github.store';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('github store unit test', () => {
    let store: Store<any>;
    let notifySpy: any;
    let commitServiceStub: any;
    let pullRequestServiceStub: any;

    beforeEach(() => {
        commitServiceStub = stub({
            async getStatus(_a: any, _b: any, _c: any): Promise<ICommitStatus> {
                return ({} as ICommitStatus);
            },
            async toCommit(_: any): Promise<ICommit<IGithubUser>> {
                return ({} as ICommit<IGithubUser>);
            }
        } as GithubCommitService);

        pullRequestServiceStub = stub({
            async toReview(_: any): Promise<IPullRequestReview<IGithubUser>> {
                return ({} as IPullRequestReview<IGithubUser>);
            },
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
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.Commit);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].duration).toBe(10000);
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
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.PullRequest);
        });

        test('should trigger notification when pull request is updated', async () => {
            const updated = { id: '147', action: 'reopened', isActive: true };
            store.state.pullRequests = [pullRequest];
            pullRequestServiceStub.toPullRequest.resolves(updated);

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.PullRequest);
        });

        test('should trigger temporary notification when pull request is inactive', async () => {
            pullRequest.action = 'closed';
            pullRequest.isActive = false;
            store.state.pullRequests = [];

            await store.dispatch('addPullRequest', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(10000);
        });
    });

    describe('addPullRequestReview', () => {
        let pullRequest: any;
        let review: any;

        beforeEach(() => {
            pullRequest = {
                id: 'pull_request_id',
                reviewers: {
                    requested: [{ name: 'reviewer_name_1' }, { name: 'reviewer_name_2' }],
                    approved: [{ name: 'reviewer_name_2' }]
                }
            };

            review = {
                pullRequestId: 'pull_request_id',
                type: 'approved',
                reviewer: {
                    name: 'reviewer_name_1'
                }
            };

            pullRequestServiceStub.toReview.resolves(review);
        });

        test('should add review', async () => {
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].group).toBe('notification');
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.PullRequest);
            expect(notifySpy.args[0][0].data.id).toBe('pull_request_id');
            expect(notifySpy.args[0][0].data.model).toStrictEqual(pullRequest);
        });

        test('should add approver when needed', async () => {
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            expect(store.getters.getPullRequests[0].reviewers.approved.length).toBe(2);
            expect(store.getters.getPullRequests[0].reviewers.approved[1].name).toBe('reviewer_name_1');
        });

        test('should remove approver when needed', async () => {
            review.type = 'change';
            review.reviewer.name = 'reviewer_name_2';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            expect(store.getters.getPullRequests[0].reviewers.approved.length).toBe(0);
        });

        test('should add reviewer when reviewer is not one of requested reviewers', async () => {
            review.reviewer.name = 'another_reviewer_name';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            expect(store.getters.getPullRequests[0].reviewers.approved.length).toBe(2);
            expect(store.getters.getPullRequests[0].reviewers.requested.length).toBe(3);
            expect(store.getters.getPullRequests[0].reviewers.approved[1].name).toBe('another_reviewer_name');
        });

        test('should not add review when pull request does not exist', async () => {
            review.pullRequestId = 'another_pull_request_id';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            sinonExpect.notCalled(notifySpy);
        });

        test('should not add review when review is an comment', async () => {
            review.type = 'commented';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            sinonExpect.notCalled(notifySpy);
        });

        test('should not add review when reviewer already approved the pull request', async () => {
            review.reviewer.name = 'reviewer_name_2';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            sinonExpect.notCalled(notifySpy);
        });

        test('should not add review when reviewer requested changes and has not approved the pull request yet', async () => {
            review.type = 'change';
            store.state.pullRequests = [pullRequest];

            await store.dispatch('addPullRequestReview', {});

            sinonExpect.notCalled(notifySpy);
        });
    });

    describe('addPullRequestCheck', () => {
        let payload: any;
        let pullRequest: any;
        let status: any;

        beforeEach(() => {
            payload = {
                repository: {
                    name: 'cidget',
                    owner: { login: 'user_name' }
                },
                sha: 'head_sha'
            };

            pullRequest = { id: '147', mergeable: true, headCommitSha: 'head_sha', isActive: true };
            status = { ref: 'head_sha', status: 'pending' };
            store.state.pullRequests = [pullRequest];
            commitServiceStub.getStatus.resolves(status);
        });

        test('should update pull request', async () => {
            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.calledOnce(commitServiceStub.getStatus);
            expect(commitServiceStub.getStatus.args[0][0]).toBe('cidget');
            expect(commitServiceStub.getStatus.args[0][1]).toBe('head_sha');
            expect(commitServiceStub.getStatus.args[0][2]).toBe('user_name');
            expect(pullRequest.mergeable).toBeNull();
        });

        test('should trigger notification', async () => {
            await store.dispatch('addPullRequestCheck', payload);

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.PullRequest);
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
