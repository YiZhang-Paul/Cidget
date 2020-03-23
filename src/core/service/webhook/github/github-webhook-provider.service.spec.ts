import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../ioc/types';
import Container from '../../../ioc/container';
import IHttpClient from '../../../interface/generic/http-client.interface';
import IWebhookQuery from '../../../interface/webhook/webhook-query.interface';
import IGithubWebhookContext from '../../../interface/webhook/github/github-webhook-context.interface';

import GithubWebhookProviderService from './github-webhook-provider.service';

describe('github webhook provider service unit test', () => {
    let service: GithubWebhookProviderService;
    let httpStub: any;
    let query: IWebhookQuery;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null; },
            async post(): Promise<any> { return null; }
        } as IHttpClient);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        service = Container.get<GithubWebhookProviderService>(Types.GithubWebhookProviderService);
    });

    beforeEach(() => {
        const data = [
            {
                id: 'id_1',
                name: 'name_1',
                url: 'url_1',
                config: {
                    url: 'callback_url_1',
                    content_type: 'content_type_1'
                },
                events: ['push'],
                created_at: '2020-01-03T06:45:41.370Z',
                active: false
            },
            {
                id: 'id_2',
                name: 'name_2',
                url: 'url_2',
                config: {
                    url: 'callback_url_2',
                    content_type: 'content_type_2'
                },
                events: ['push', 'pull_request'],
                created_at: '2020-01-04T06:45:41.370Z',
                active: true
            }
        ];

        query = { name: 'project_name', callback: '' };
        httpStub.get.resolves({ data });
        httpStub.post.resolves({ data: data[1] });
    });

    describe('listWebhooks', () => {
        test('should call correct api endpoint with authorization token', async () => {
            await service.listWebhooks(query);

            sinonExpect.calledOnce(httpStub.get);
            expect(httpStub.get.args[0][0]).toBe('https://api.github.com/repos/test_github_user/project_name/hooks');
            expect(httpStub.get.args[0][1].headers.Authorization).toBe('token test_github_token');
        });

        test('should return webhooks found', async () => {
            const result = await service.listWebhooks(query);

            expect(result.length).toBe(2);
            expect(result[0].id).toBe('id_1');
            expect(result[0].name).toBe('name_1');
            expect(result[0].url).toBe('url_1');
            expect(result[0].callback).toBe('callback_url_1');
            expect(result[0].contentType).toBe('content_type_1');
            expect(result[0].events).toStrictEqual(['push']);
            expect(result[0].createdOn.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result[0].isActive).toBeFalsy();
            expect(result[1].id).toBe('id_2');
            expect(result[1].name).toBe('name_2');
            expect(result[1].url).toBe('url_2');
            expect(result[1].callback).toBe('callback_url_2');
            expect(result[1].contentType).toBe('content_type_2');
            expect(result[1].events).toStrictEqual(['push', 'pull_request']);
            expect(result[1].createdOn.toISOString()).toBe('2020-01-04T06:45:41.370Z');
            expect(result[1].isActive).toBeTruthy();
        });

        test('should return empty collection when no webhooks found', async () => {
            httpStub.get.resolves({ data: null });

            const result = await service.listWebhooks(query);

            expect(result.length).toBe(0);
        });
    });

    describe('getWebhook', () => {
        test('should return webhook found', async () => {
            query.callback = 'callback_url_2';

            const result = await service.getWebhook(query);

            expect(result?.id).toBe('id_2');
            expect(result?.name).toBe('name_2');
            expect(result?.url).toBe('url_2');
            expect(result?.callback).toBe('callback_url_2');
            expect(result?.contentType).toBe('content_type_2');
            expect(result?.events).toStrictEqual(['push', 'pull_request']);
            expect(result?.createdOn.toISOString()).toBe('2020-01-04T06:45:41.370Z');
            expect(result?.isActive).toBeTruthy();
        });

        test('should return null when no webhook found', async () => {
            query.callback = 'invalid_url';

            expect(await service.getWebhook(query)).toBeNull();
        });
    });

    describe('addWebhook', () => {
        let context: IGithubWebhookContext;

        beforeEach(() => {
            context = {
                project: 'project_name',
                events: ['push', 'check'],
                callback: 'new_callback_url'
            };
        });

        test('should call correct api endpoint with authorization token', async () => {
            await service.addWebhook(context);

            sinonExpect.calledOnce(httpStub.post);
            expect(httpStub.post.args[0][0]).toBe('https://api.github.com/repos/test_github_user/project_name/hooks');
            expect(httpStub.post.args[0][1].events).toStrictEqual(['push', 'check']);
            expect(httpStub.post.args[0][1].config.url).toBe('new_callback_url');
            expect(httpStub.post.args[0][1].config.content_type).toBe('json');
            expect(httpStub.post.args[0][1].config.insecure_ssl).toBe('0');
            expect(httpStub.post.args[0][2].headers.Authorization).toBe('token test_github_token');
        });

        test('should return new webhook created ', async () => {
            const result = await service.addWebhook(context);

            expect(result.id).toBe('id_2');
            expect(result.name).toBe('name_2');
            expect(result.url).toBe('url_2');
            expect(result.callback).toBe('callback_url_2');
            expect(result.contentType).toBe('content_type_2');
            expect(result.events).toStrictEqual(['push', 'pull_request']);
            expect(result.createdOn.toISOString()).toBe('2020-01-04T06:45:41.370Z');
            expect(result.isActive).toBeTruthy();
        });

        test('should return existing webhook without creating new webhook', async () => {
            context.callback = 'callback_url_1';

            const result = await service.addWebhook(context);

            sinonExpect.notCalled(httpStub.post);
            expect(result.id).toBe('id_1');
            expect(result.name).toBe('name_1');
            expect(result.url).toBe('url_1');
            expect(result.callback).toBe('callback_url_1');
            expect(result.contentType).toBe('content_type_1');
            expect(result.events).toStrictEqual(['push']);
            expect(result.createdOn.toISOString()).toBe('2020-01-03T06:45:41.370Z');
            expect(result.isActive).toBeFalsy();
        });
    });
});
