import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepository from '../../../../interface/source-control/repository.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';
import GithubUserService from '../github-user/github-user.service';

import GithubPullRequestService from './github-pull-request.service';

describe('github pull request service unit test', () => {
    let service: GithubPullRequestService;
    let httpStub: any;
    let repositoryProviderStub: any;
    let userServiceStub: any;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null },
            async post(): Promise<any> { return null }
        } as IHttpClient);

        repositoryProviderStub = stub({
            async listRepositories(): Promise<IRepository[]> { return []; },
            async listRepository(): Promise<IRepository | null> { return null; },
            toRepository(): IRepository { return {} as IRepository; }
        } as IRepositoryProvider<any>);

        userServiceStub = stub({
            async getUser(_: any): Promise<IGithubUser> { return {} as IGithubUser; },
            getUniqueUsers(_: IGithubUser[]): IGithubUser[] { return []; }
        } as GithubUserService);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        Container
            .rebind<IRepositoryProvider<any>>(Types.IRepositoryProvider)
            .toConstantValue(repositoryProviderStub)
            .whenTargetNamed('github');

        Container
            .rebind<GithubUserService>(Types.GithubUserService)
            .toConstantValue(userServiceStub);

        service = Container.get<GithubPullRequestService>(Types.GithubPullRequestService);
    });

    describe('toReview', () => {
        let payload: any;

        beforeEach(() => {
            payload = {
                pull_request: {
                    id: 'pull_request_id'
                },
                review: {
                    state: 'approved',
                    user: {
                        login: 'user_login_name',
                        avatar_url: 'user_avatar_url',
                        html_url: 'https://user_html_url',
                        url: 'user_url'
                    }
                }
            };
        });

        test('should convert payload into review', async () => {
            const result = await service.toReview(payload);

            sinonExpect.calledOnce(userServiceStub.getUser);
            expect(result.pullRequestId).toBe('pull_request_id');
            expect(result.type).toBe('approved');
        });

        test('should properly include review state', async () => {
            payload.review.state = 'changes_requested';

            const result = await service.toReview(payload);

            expect(result.type).toBe('change');
        });
    });

    describe('toPullRequest', () => {
        let payload: any;

        beforeEach(() => {
            const reviewer1 = {
                login: 'reviewer_1',
                avatar_url: 'reviewer_1_avatar_url',
                html_url: 'https://reviewer_1_html_url',
                url: 'reviewer_1_url'
            };

            const reviewer2 = {
                login: 'reviewer_2',
                avatar_url: 'reviewer_2_avatar_url',
                html_url: 'https://reviewer_2_html_url',
                url: 'reviewer_2_url'
            };

            const reviewer3 = {
                login: 'reviewer_3',
                avatar_url: 'reviewer_3_avatar_url',
                html_url: 'https://reviewer_3_html_url',
                url: 'reviewer_3_url'
            };

            payload = {
                action: 'opened',
                pull_request: {
                    id: 'pull_request_id',
                    number: 4,
                    title: 'pull_request_message',
                    state: 'opened',
                    diff_url: 'diff_url',
                    html_url: 'html_url',
                    created_at: '2020-01-03T06:45:41.370Z',
                    updated_at: '2020-01-04T06:45:41.370Z',
                    mergeable_state: 'unknown',
                    merged: false,
                    commits: [{ id: 'commit_id_1' }],
                    additions: 1523,
                    deletions: 312,
                    changed_files: 56,
                    requested_reviewers: [reviewer1, reviewer3],
                    user: {
                        login: 'user_login_name',
                        avatar_url: 'user_avatar_url',
                        html_url: 'https://user_html_url',
                        url: 'user_url'
                    },
                    head: {
                        ref: 'yizhang'
                    },
                    base: {
                        ref: 'development'
                    }
                }
            };

            const reviews = [
                { id: 1, user: reviewer1, state: 'Approved' },
                { id: 2, user: reviewer2, state: 'Approved' },
                { id: 3, user: reviewer1, state: 'Changes_Requested' },
                { id: 4, user: reviewer2, state: 'Commented' }
            ];

            httpStub.get.resolves({ data: reviews });
            userServiceStub.getUser.onCall(0).resolves({ name: 'user_login_name' } as IGithubUser);
            userServiceStub.getUser.onCall(1).resolves({ name: 'reviewer_1' } as IGithubUser);
            userServiceStub.getUser.onCall(2).resolves({ name: 'reviewer_2' } as IGithubUser);
            userServiceStub.getUser.onCall(3).resolves({ name: 'reviewer_1' } as IGithubUser);
            userServiceStub.getUser.onCall(4).resolves({ name: 'reviewer_3' } as IGithubUser);

            userServiceStub.getUniqueUsers.returns([
                { name: 'reviewer_1' },
                { name: 'reviewer_3' },
                { name: 'reviewer_2' }
            ]);
        });

        test('should convert payload into pull request', async () => {
            const result = await service.toPullRequest(payload);

            expect(result.id).toBe('pull_request_id');
            expect(result.action).toBe('opened');
            expect(result.branch.source).toBe('yizhang');
            expect(result.branch.base).toBe('development');
            expect(result.number).toBe(4);
            expect(result.message).toBe('pull_request_message');
            expect(result.status).toBe('opened');
            expect(result.diffUrl).toBe('diff_url');
            expect(result.pullRequestUrl).toBe('html_url');
            expect(result.createdOn.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result.updatedOn.toISOString()).toBe('2020-01-04T06:45:41.370Z');
            expect(result.mergeable).toBeFalsy();
            expect(result.merged).toBeFalsy();
            expect(result.commits).toStrictEqual([{ id: 'commit_id_1' }]);
            expect(result.added).toBe(1523);
            expect(result.removed).toBe(312);
            expect(result.modified).toBe(56);
        });

        test('should include reviewer information', async () => {
            const result = await service.toPullRequest(payload);

            expect(result.reviewers.approved.length).toBe(1);
            expect(result.reviewers.requested.length).toBe(3);
            expect(result.reviewers.approved[0].name).toBe('reviewer_2');
            expect(result.reviewers.requested[0].name).toBe('reviewer_1');
            expect(result.reviewers.requested[1].name).toBe('reviewer_3');
            expect(result.reviewers.requested[2].name).toBe('reviewer_2');
        });

        test('should convert payload into merged pull request', async () => {
            payload.pull_request.merged = true;
            payload.pull_request.mergeable_state = 'clean';
            payload.pull_request.user = null;

            payload.pull_request.merged_by = {
                login: 'user_login_name',
                avatar_url: 'user_avatar_url',
                html_url: 'https://user_html_url',
                url: 'user_url'
            };

            const result = await service.toPullRequest(payload);

            expect(result.action).toBe('merged');
            expect(result.mergeable).toBeTruthy();
            expect(result.merged).toBeTruthy();
        });

        test('should convert payload into updated pull request', async () => {
            payload.action = 'synchronize';

            const result = await service.toPullRequest(payload);

            expect(result.action).toBe('updated');
        });

        test('should properly include review status', async () => {
            payload.action = 'review_requested';

            const result = await service.toPullRequest(payload);

            expect(result.action).toBe('needs review');
        });
    });
});
