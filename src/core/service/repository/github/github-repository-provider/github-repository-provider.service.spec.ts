import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IAbbreviationResolver from '../../../../interface/generic/abbreviation-resolver.interface';

import GithubRepositoryProvider from './github-repository-provider.service';

describe('github repository provider unit test', () => {
    let provider: GithubRepositoryProvider;
    let httpStub: any;
    let languageResolverStub: any;
    let licenseResolverStub: any;
    let data: any;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null; },
            async post(): Promise<any> { return null; }
        } as IHttpClient);

        languageResolverStub = stub({
            resolve(): string { return ''; }
        } as IAbbreviationResolver);

        licenseResolverStub = stub({
            resolve(): string { return ''; }
        } as IAbbreviationResolver);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        Container
            .rebind<IAbbreviationResolver>(Types.IAbbreviationResolver)
            .toConstantValue(languageResolverStub)
            .whenTargetNamed('language');

        Container
            .bind<IAbbreviationResolver>(Types.IAbbreviationResolver)
            .toConstantValue(licenseResolverStub)
            .whenTargetNamed('license');

        languageResolverStub.resolve.returns('TS');
        licenseResolverStub.resolve.returns('MIT');
        provider = Container.get<GithubRepositoryProvider>(Types.GithubRepositoryProvider);
    });

    beforeEach(() => {
        data = [
            {
                id: 'id_1',
                name: 'name_1',
                description: 'description_1',
                default_branch: 'development',
                hooks_url: 'hooks_url_1',
                language: 'TypeScript',
                created_at: '2020-01-03T06:45:41.370Z',
                private: false,
                html_url: 'html_url_1',
                license: {
                    name: 'MIT License'
                },
                owner: {
                    login: 'login_name_1',
                    avatar_url: 'avatar_url_1'
                }
            },
            {
                id: 'id_2',
                name: 'name_2',
                description: 'description_2',
                default_branch: 'development',
                hooks_url: 'hooks_url_2',
                language: 'TypeScript',
                created_at: 1578120341, // 2020-01-04T06:45:41.000Z
                private: true,
                html_url: 'html_url_2',
                license: {
                    name: 'MIT License'
                },
                owner: {
                    login: 'login_name_2',
                    avatar_url: 'avatar_url_2'
                }
            }
        ];

        httpStub.get.resolves({ data });
    });

    describe('listRepositories', () => {
        test('should call correct api endpoint with correct authorization token', async () => {
            await provider.listRepositories();

            sinonExpect.calledOnce(httpStub.get);
            expect(httpStub.get.args[0][0]).toBe('https://api.github.com/user/repos?type=all');
            expect(httpStub.get.args[0][1].headers.Authorization).toBe('token test_github_token');
        });

        test('should return repositories found', async () => {
            const result = await provider.listRepositories();

            expect(result.length).toBe(2);
            expect(result[0].id).toBe('id_1');
            expect(result[0].name).toBe('name_1');
            expect(result[0].description).toBe('description_1');
            expect(result[0].createdOn.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result[0].defaultBranch).toBe('development');
            expect(result[0].isPrivate).toBeFalsy();
            expect(result[0].hooksUrl).toBe('hooks_url_1');
            expect(result[0].language.name).toBe('TypeScript');
            expect(result[0].language.abbr).toBe('TS');
            expect(result[0].license?.name).toBe('MIT License');
            expect(result[0].license?.abbr).toBe('MIT');
            expect(result[0].owner.name).toBe('login_name_1');
            expect(result[0].owner.avatar).toBe('avatar_url_1');
            expect(result[0].url).toBe('html_url_1');
            expect(result[1].id).toBe('id_2');
            expect(result[1].name).toBe('name_2');
            expect(result[1].description).toBe('description_2');
            expect(result[1].createdOn.toISOString()).toBe('2020-01-04T06:45:41.000Z');
            expect(result[1].defaultBranch).toBe('development');
            expect(result[1].isPrivate).toBeTruthy();
            expect(result[1].hooksUrl).toBe('hooks_url_2');
            expect(result[1].language.name).toBe('TypeScript');
            expect(result[1].language.abbr).toBe('TS');
            expect(result[1].license?.name).toBe('MIT License');
            expect(result[1].license?.abbr).toBe('MIT');
            expect(result[1].owner.name).toBe('login_name_2');
            expect(result[1].owner.avatar).toBe('avatar_url_2');
            expect(result[1].url).toBe('html_url_2');
        });

        test('should return empty collection when no repositories found', async () => {
            httpStub.get.resolves({ data: null });

            const result = await provider.listRepositories();

            expect(result.length).toBe(0);
        });
    });

    describe('listRepository', () => {
        test('should return repository found', async () => {
            const result = await provider.listRepository('name_2');

            expect(result?.id).toBe('id_2');
            expect(result?.name).toBe('name_2');
            expect(result?.description).toBe('description_2');
            expect(result?.createdOn.toISOString()).toBe('2020-01-04T06:45:41.000Z');
            expect(result?.defaultBranch).toBe('development');
            expect(result?.isPrivate).toBeTruthy();
            expect(result?.hooksUrl).toBe('hooks_url_2');
            expect(result?.language.name).toBe('TypeScript');
            expect(result?.language.abbr).toBe('TS');
            expect(result?.license?.name).toBe('MIT License');
            expect(result?.license?.abbr).toBe('MIT');
            expect(result?.owner.name).toBe('login_name_2');
            expect(result?.owner.avatar).toBe('avatar_url_2');
            expect(result?.url).toBe('html_url_2');
        });

        test('should return null when no repository found', async () => {
            expect(await provider.listRepository('invalid_name')).toBeNull();
        });
    });

    describe('toRepository', () => {
        test('should properly set default value for missing fields', () => {
            data[1].license = null;
            licenseResolverStub.resolve.returns('N/A');

            const result = provider.toRepository(data[1]);

            expect(result?.license?.name).toBe('');
            expect(result?.license?.abbr).toBe('N/A');
        });
    });
});
