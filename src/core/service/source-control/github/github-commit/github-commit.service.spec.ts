import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepository from '../../../../interface/source-control/repository.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';
import GithubUserService from '../github-user/github-user.service';

import GithubCommitService from './github-commit.service';

describe('github commit service unit test', () => {
    let service: GithubCommitService;
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
            async getUser(_: any): Promise<IGithubUser> { return {} as IGithubUser; }
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

        service = Container.get<GithubCommitService>(Types.GithubCommitService);
    });

    describe('getStatus', () => {
        beforeEach(() => {
            httpStub.get.resolves({ data: { sha: 'sha_sequence', state: 'pending' } });
        });

        test('should call correct endpoint', async () => {
            const api = 'https://api.github.com/repos/yizhang-paul/project_name/commits/ref_name/status';

            await service.getStatus('project_name', 'ref_name', 'yizhang-paul');

            sinonExpect.calledOnce(httpStub.get);
            expect(httpStub.get.args[0][0]).toBe(api);
        });

        test('should return commit status', async () => {
            const result = await service.getStatus('project_name', 'ref_name', 'yizhang-paul');

            expect(result.ref).toBe('sha_sequence');
            expect(result.status).toBe('pending');
        });
    });

    describe('toCommit', () => {
        test('should convert payload into commit', async () => {
            const payload = {
                ref: 'heads/ref/yizhang',
                compare: 'compare_url',
                sender: {
                    avatar_url: 'sender_avatar_url',
                    html_url: 'https://sender_html_url',
                    url: 'sender_url'
                },
                head_commit: {
                    id: 'head_commit_id',
                    message: 'commit_message',
                    timestamp: '2020-01-03T06:45:41.370Z',
                    url: 'commit_url',
                    committer: {
                        username: 'committer_name',
                        email: 'committer_email',
                    },
                    added: [{}],
                    removed: [{}, {}],
                    modified: []
                }
            };

            const result = await service.toCommit(payload);

            sinonExpect.calledOnce(userServiceStub.getUser);
            expect(result.id).toBe('head_commit_id');
            expect(result.branch).toBe('yizhang');
            expect(result.message).toBe('commit_message');
            expect(result.time.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result.diffUrl).toBe('compare_url');
            expect(result.commitUrl).toBe('commit_url');
            expect(result.added?.length).toBe(1);
            expect(result.removed?.length).toBe(2);
            expect(result.modified?.length).toBe(0);
        });
    });
});
