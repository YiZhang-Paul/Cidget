import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/generic/http-client.interface';

import GithubUserService from './github-user.service';

describe('github user service unit test', () => {
    let service: GithubUserService;
    let httpStub: any;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null },
            async post(): Promise<any> { return null }
        } as IHttpClient);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        service = Container.get<GithubUserService>(Types.GithubUserService);
    });

    describe('getUser', () => {
        let data: any;

        beforeEach(() => {
            data = {
                login: 'user_login_name',
                avatar_url: 'user_avatar_url',
                html_url: 'https://user_html_url',
                url: 'user_url'
            };
        });

        test('should properly convert data to github user', async () => {
            const result = await service.getUser(data);

            sinonExpect.notCalled(httpStub.get);
            expect(result.name).toBe('user_login_name');
            expect(result.avatar).toBe('user_avatar_url');
            expect(result.profileUrl).toBe('https://user_html_url');
            expect(result.gistUrl).toBe('https://gist.user_html_url');
            expect(result.repositoryCount).toBe(0);
            expect(result.followerCount).toBe(0);
            expect(result.gistCount).toBe(0);
        });

        test('should include details', async () => {
            httpStub.get.onCall(0).resolves({ data: [{}, {}, {}] });
            httpStub.get.onCall(1).resolves({ data: [{}] });
            httpStub.get.onCall(2).resolves({ data: [{}, {}] });

            const result = await service.getUser(data, true);

            sinonExpect.callCount(httpStub.get, 3);
            expect(httpStub.get.args[0][0]).toBe('user_url/repos');
            expect(httpStub.get.args[1][0]).toBe('user_url/followers');
            expect(httpStub.get.args[2][0]).toBe('user_url/gists');
            expect(result.repositoryCount).toBe(3);
            expect(result.followerCount).toBe(1);
            expect(result.gistCount).toBe(2);
        });

        test('should properly set default value', async () => {
            httpStub.get.onCall(0).resolves({ });
            httpStub.get.onCall(1).resolves({ data: null });
            httpStub.get.onCall(2).resolves({ data: undefined });

            const result = await service.getUser(data, true);

            sinonExpect.callCount(httpStub.get, 3);
            expect(result.repositoryCount).toBe(0);
            expect(result.followerCount).toBe(0);
            expect(result.gistCount).toBe(0);
        });
    });
});
