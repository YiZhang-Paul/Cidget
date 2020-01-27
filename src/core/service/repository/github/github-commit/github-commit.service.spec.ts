import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/general/http-client.interface';
import IRepository from '../../../../interface/repository/repository.interface';
import IRepositoryProvider from '../../../../interface/repository/repository-provider.interface';

import GithubCommitService from './github-commit.service';

describe('github commit service unit test', () => {
    let service: GithubCommitService;
    let httpStub: any;
    let repositoryProviderStub: any;

    beforeEach(() => {
        Container.snapshot();

        httpStub = stub({
            async get(): Promise<any> { return null },
            async post(): Promise<any> { return null }
        } as IHttpClient);

        repositoryProviderStub = stub({
            async listRepositories(): Promise<IRepository[]> { return []; },
            async listRepository(): Promise<IRepository | null> { return null; },
            toRepository(): IRepository { return {} as IRepository; }
        } as IRepositoryProvider<any>);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        Container
            .rebind<IRepositoryProvider<any>>(Types.IRepositoryProvider)
            .toConstantValue(repositoryProviderStub)
            .whenTargetNamed('github');

        service = Container.get<GithubCommitService>(Types.GithubCommitService);
    });

    afterEach(() => {
        Container.restore();
    });

    describe('toCommit', () => {
        let payload: any;

        beforeEach(() => {
            payload = {
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
        });

        test('should convert payload into commit', async () => {
            httpStub.get.onCall(0).resolves({ data: [{}, {}, {}] });
            httpStub.get.onCall(1).resolves({ data: [{}] });
            httpStub.get.onCall(2).resolves({ data: [{}, {}] });

            const result = await service.toCommit(payload);

            sinonExpect.calledThrice(httpStub.get);
            expect(httpStub.get.args[0][0]).toBe('sender_url/repos');
            expect(httpStub.get.args[1][0]).toBe('sender_url/followers');
            expect(httpStub.get.args[2][0]).toBe('sender_url/gists');
            expect(result.id).toBe('head_commit_id');
            expect(result.initiator.name).toBe('committer_name');
            expect(result.initiator.avatar).toBe('sender_avatar_url');
            expect(result.initiator.email).toBe('committer_email');
            expect(result.initiator.profileUrl).toBe('https://sender_html_url');
            expect(result.initiator.repositoryCount).toBe(3);
            expect(result.initiator.followerCount).toBe(1);
            expect(result.initiator.gistCount).toBe(2);
            expect(result.initiator.gistUrl).toBe('https://gist.sender_html_url');
            expect(result.branch).toBe('yizhang');
            expect(result.message).toBe('commit_message');
            expect(result.time.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result.diffUrl).toBe('compare_url');
            expect(result.commitUrl).toBe('commit_url');
            expect(result.added?.length).toBe(1);
            expect(result.removed?.length).toBe(2);
            expect(result.modified?.length).toBe(0);
        });

        test('should properly set default values for missing fields', async () => {
            httpStub.get.onCall(0).resolves({ data: null });
            httpStub.get.onCall(1).resolves({ data: null });
            httpStub.get.onCall(2).resolves({ data: null });

            const result = await service.toCommit(payload);

            expect(result.initiator.repositoryCount).toBe(0);
            expect(result.initiator.followerCount).toBe(0);
            expect(result.initiator.gistCount).toBe(0);
        });
    });
});
