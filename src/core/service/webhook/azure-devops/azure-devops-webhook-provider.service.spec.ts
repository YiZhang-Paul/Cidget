import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../ioc/types';
import Container from '../../../ioc/container';
import IHttpClient from '../../../interface/generic/http-client.interface';
import IWebhookQuery from '../../../interface/webhook/webhook-query.interface';
import IAzureDevopsWebhookContext from '../../../interface/webhook/azure-devops/azure-devops-webhook-context.interface';

import AzureDevopsWebhookProviderService from './azure-devops-webhook-provider.service';

describe('azure devops webhook provider service unit test', () => {
    const api = 'https://dev.azure.com/test_azure_organization/_apis/';
    let service: AzureDevopsWebhookProviderService;
    let httpStub: any;
    let data: any;
    let query: IWebhookQuery;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null; },
            async post(): Promise<any> { return null; }
        } as IHttpClient);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        service = Container.get<AzureDevopsWebhookProviderService>(Types.AzureDevopsWebhookProviderService);
    });

    beforeEach(() => {
        data = {
            value: [
                {
                    id: 'id_1',
                    actionDescription: 'action_description_1',
                    url: 'url_1',
                    createdBy: { displayName: 'display_name_1' },
                    publisherInputs: { projectId: 'project_id_1' },
                    consumerInputs: { url: 'callback_url' },
                    createdDate: '2020-01-03T06:45:41.370Z',
                    eventDescription: 'all',
                    status: 'enabled'
                },
                {
                    id: 'id_2',
                    actionDescription: 'action_description_2',
                    url: 'url_2',
                    createdBy: { displayName: 'display_name_2' },
                    publisherInputs: { projectId: 'project_id_2' },
                    consumerInputs: { url: 'callback_url' },
                    createdDate: '2020-01-04T06:45:41.370Z',
                    eventDescription: 'all',
                    status: 'enabled'
                }
            ]
        };

        const response = {
            id: 'id_3',
            actionDescription: 'action_description_3',
            url: 'url_3',
            createdBy: { displayName: 'display_name_3' },
            publisherInputs: { projectId: 'project_id_2' },
            consumerInputs: { url: 'new_callback_url' },
            createdDate: '2020-01-04T06:45:41.370Z',
            eventDescription: 'all',
            status: 'enabled'
        };

        query = { name: 'project_name', callback: '' };
        httpStub.get.onCall(0).resolves({ data: { id: 'project_id_2', name: 'project_name' } });
        httpStub.get.onCall(1).resolves({ data });
        httpStub.post.resolves({ data: response });
    });

    describe('listWebhooks', () => {
        test('should call correct api endpoint with authorization token', async () => {
            await service.listWebhooks(query);

            sinonExpect.calledTwice(httpStub.get);
            expect(httpStub.get.args[0][0]).toBe(`${api}projects/project_name`);
            expect(httpStub.get.args[1][0]).toBe(`${api}hooks/subscriptions?api-version=5.0`);
            expect(httpStub.get.args[1][1].headers.Authorization).toBe(`basic ${btoa(':test_azure_token')}`);
        });

        test('should return hooks found', async () => {
            const result = await service.listWebhooks(query);

            expect(result.length).toBe(1);
            expect(result[0].id).toBe('id_2');
            expect(result[0].name).toBe('action_description_2 by display_name_2');
            expect(result[0].url).toBe('url_2');
            expect(result[0].project).toBe('project_id_2');
            expect(result[0].callback).toBe('callback_url');
            expect(result[0].contentType).toBe('json');
            expect(result[0].events).toStrictEqual(['all']);
            expect(result[0].createdOn.getTime()).toBe(new Date('2020-01-04T06:45:41.370Z').getTime());
            expect(result[0].isActive).toBeTruthy();
        });

        test('should return empty collection when no project found', async () => {
            httpStub.get.onCall(0).resolves({ data: null });

            const result = await service.listWebhooks(query);

            sinonExpect.calledOnce(httpStub.get);
            expect(result.length).toBe(0);
        });

        test('should return empty collection when no hooks found', async () => {
            httpStub.get.onCall(1).resolves({ data: null });

            const result = await service.listWebhooks(query);

            sinonExpect.calledTwice(httpStub.get);
            expect(result.length).toBe(0);
        });
    });

    describe('getWebhook', () => {
        test('should return hook found', async () => {
            query.callback = 'callback_url';

            const result = await service.getWebhook(query);

            expect(result?.id).toBe('id_2');
            expect(result?.name).toBe('action_description_2 by display_name_2');
            expect(result?.url).toBe('url_2');
            expect(result?.project).toBe('project_id_2');
            expect(result?.callback).toBe('callback_url');
            expect(result?.contentType).toBe('json');
            expect(result?.events).toStrictEqual(['all']);
            expect(result?.createdOn.getTime()).toBe(new Date('2020-01-04T06:45:41.370Z').getTime());
            expect(result?.isActive).toBeTruthy();
        });

        test('should return null when no hook found', async () => {
            query.callback = 'invalid_url';

            expect(await service.getWebhook(query)).toBeNull();
        });
    });

    describe('addWebhook', () => {
        let context: IAzureDevopsWebhookContext;

        beforeEach(() => {
            context = {
                project: 'project_name',
                publisherId: 'tfs',
                eventType: 'event_name',
                callback: 'new_callback_url',
                isRelease: false
            };

            httpStub.get.onCall(2).resolves({ data: { id: 'project_id_2', name: 'project_name' } });
        });

        test('should return existing hook instead of adding new hook when possible', async () => {
            context.callback = 'callback_url';

            const result = await service.addWebhook(context);

            sinonExpect.calledTwice(httpStub.get);
            sinonExpect.notCalled(httpStub.post);
            expect(result?.id).toBe('id_2');
            expect(result?.name).toBe('action_description_2 by display_name_2');
            expect(result?.url).toBe('url_2');
            expect(result?.project).toBe('project_id_2');
            expect(result?.callback).toBe('callback_url');
            expect(result?.contentType).toBe('json');
            expect(result?.events).toStrictEqual(['all']);
            expect(result?.createdOn.getTime()).toBe(new Date('2020-01-04T06:45:41.370Z').getTime());
            expect(result?.isActive).toBeTruthy();
        });

        test('should throw error when no matching project found', async () => {
            httpStub.get.onCall(2).resolves({ data: null });

            try {
                await service.addWebhook(context);
            }
            catch {
                return;
            }
            throw new Error('should not reach this line.');
        });

        test('should call correct api endpoint with authentication token for non-release hooks', async () => {
            await service.addWebhook(context);

            sinonExpect.calledOnce(httpStub.post);
            expect(httpStub.post.args[0][0]).toBe(`${api}hooks/subscriptions?api-version=5.0`);
            expect(httpStub.post.args[0][1].publisherId).toBe('tfs');
            expect(httpStub.post.args[0][1].eventType).toBe('event_name');
            expect(httpStub.post.args[0][1].consumerId).toBe('webHooks');
            expect(httpStub.post.args[0][1].consumerActionId).toBe('httpRequest');
            expect(httpStub.post.args[0][1].publisherInputs.projectId).toBe('project_id_2');
            expect(httpStub.post.args[0][1].consumerInputs.url).toBe('new_callback_url');
            expect(httpStub.post.args[0][2].headers.Authorization).toBe(`basic ${btoa(':test_azure_token')}`);
        });

        test('should call correct api endpoint with authentication token for non-release hooks', async () => {
            const releaseApi = 'https://vsrm.dev.azure.com/test_azure_organization/_apis/';
            context.publisherId = 'rm';
            context.isRelease = true;

            await service.addWebhook(context);

            sinonExpect.calledOnce(httpStub.post);
            expect(httpStub.post.args[0][0]).toBe(`${releaseApi}hooks/subscriptions?api-version=5.0`);
            expect(httpStub.post.args[0][1].publisherId).toBe('rm');
            expect(httpStub.post.args[0][1].eventType).toBe('event_name');
            expect(httpStub.post.args[0][1].consumerId).toBe('webHooks');
            expect(httpStub.post.args[0][1].consumerActionId).toBe('httpRequest');
            expect(httpStub.post.args[0][1].publisherInputs.projectId).toBe('project_id_2');
            expect(httpStub.post.args[0][1].consumerInputs.url).toBe('new_callback_url');
            expect(httpStub.post.args[0][2].headers.Authorization).toBe(`basic ${btoa(':test_azure_token')}`);
        });

        test('should return hook added', async () => {
            const result = await service.addWebhook(context);

            sinonExpect.calledOnce(httpStub.post);
            expect(result?.id).toBe('id_3');
            expect(result?.name).toBe('action_description_3 by display_name_3');
            expect(result?.url).toBe('url_3');
            expect(result?.project).toBe('project_id_2');
            expect(result?.callback).toBe('new_callback_url');
            expect(result?.contentType).toBe('json');
            expect(result?.events).toStrictEqual(['all']);
            expect(result?.createdOn.getTime()).toBe(new Date('2020-01-04T06:45:41.370Z').getTime());
            expect(result?.isActive).toBeTruthy();
        });
    });
});
