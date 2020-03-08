import { GraphRequest } from '@microsoft/microsoft-graph-client';
import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../ioc/types';
import Container from '../../../ioc/container';
import IEmail from '../../../interface/generic/email.interface';
import AppSettings from '../../io/app-settings/app-settings';
import OutlookApiProvider from '../../email/outlook/outlook-api-provider/outlook-api-provider';

import OutlookWebhookProvider from './outlook-webhook-provider';

describe('outlook webhook provider service unit test', () => {
    let service: OutlookWebhookProvider;
    let appSettings: AppSettings;
    let apiProviderStub: any;
    let requestStub: any;

    beforeEach(() => {
        apiProviderStub = stub({
            promptAuthorization(): void { },
            async authorize(_: string): Promise<void> { },
            async startGraphRequest(_: string): Promise<GraphRequest | null> { return null; },
            toMail(_: any): IEmail { return ({} as IEmail); }
        } as OutlookApiProvider);

        Container
            .rebind<OutlookApiProvider>(Types.OutlookApiProvider)
            .toConstantValue(apiProviderStub);

        appSettings = Container.get<AppSettings>(Types.AppSettings);
        service = Container.get<OutlookWebhookProvider>(Types.OutlookWebhookProvider);
    });

    beforeEach(() => {
        const hooks = [
            {
                id: 'id_1',
                callback: 'callback_1',
                events: ['created'],
                createdOn: new Date(2019, 1, 2).toISOString()
            },
            {
                id: 'id_2',
                callback: 'callback_2',
                events: ['created'],
                createdOn: new Date(2019, 1, 3).toISOString()
            },
            {
                id: 'id_3',
                callback: 'callback_3',
                events: ['created'],
                createdOn: new Date(2019, 1, 4).toISOString()
            }
        ];

        requestStub = stub({
            async post(_: any): Promise<any> { return ({}); },
            async patch(_: any): Promise<any> { return ({}); }
        });

        appSettings.set('mail.outlook.webhooks', hooks);
        requestStub.post.resolves({ id: 'hook_id' });
        apiProviderStub.startGraphRequest.resolves(requestStub);
    });

    describe('listWebhooks', () => {
        test('should list all webhooks', async () => {
            const result = await service.listWebhooks();

            expect(result.length).toBe(3);
            expect(result[0].createdOn).toBeInstanceOf(Date);
            expect(result[1].createdOn).toBeInstanceOf(Date);
            expect(result[2].createdOn).toBeInstanceOf(Date);
        });

        test('should return empty collection when no hooks found', async () => {
            appSettings.set('mail.outlook.webhooks', null);

            expect((await service.listWebhooks()).length).toBe(0);
        });
    });

    describe('getWebhook', () => {
        test('should return webhook found', async () => {
            const result = await service.getWebhook({ callback: 'callback_2', name: '' });

            expect(result?.callback).toBe('callback_2');
        });

        test('should return null when no webhook found', async () => {
            expect(await service.getWebhook({ callback: 'invalid_callback', name: '' })).toBeNull();
        });
    });

    describe('addWebhook', () => {
        let context: any;

        beforeEach(() => {
            context = {
                events: ['created', 'updated'],
                callback: 'callback_url',
                resource: 'me/messages',
                state: '12345'
            };
        });

        test('should add webhook', async () => {
            const hooksCount = appSettings.get('mail.outlook.webhooks').length;

            const result = await service.addWebhook(context);

            sinonExpect.calledOnce(apiProviderStub.startGraphRequest);
            sinonExpect.calledOnce(requestStub.post);
            expect(requestStub.post.args[0][0].changeType).toBe('created,updated');
            expect(requestStub.post.args[0][0].notificationUrl).toBe('callback_url');
            expect(requestStub.post.args[0][0].resource).toBe('me/messages');
            expect(requestStub.post.args[0][0].clientState).toBe('12345');
            expect(appSettings.get('mail.outlook.webhooks').length).toBe(hooksCount + 1);
            expect(result?.id).toBe('hook_id');
            expect(result?.callback).toBe('callback_url');
            expect(result?.events).toStrictEqual(['created', 'updated']);
            expect(result?.isActive).toBeTruthy();
        });

        test('should update existing webhook if there is any', async () => {
            requestStub.post.resolves({ id: 'id_2' });
            const hooksCount = appSettings.get('mail.outlook.webhooks').length;

            await service.addWebhook(context);

            expect(appSettings.get('mail.outlook.webhooks').length).toBe(hooksCount);
            expect(appSettings.get('mail.outlook.webhooks')[1].id).toBe('id_2');
            expect(appSettings.get('mail.outlook.webhooks')[1].callback).toBe('callback_url');
        });

        test('should return null when failed to get request object', async () => {
            apiProviderStub.startGraphRequest.resolves(null);

            expect(await service.addWebhook(context)).toBeNull();
        });
    });

    describe('renewWebhook', () => {
        test('should renew webhook', async () => {
            await service.renewWebhook('callback_2');
            const result = appSettings.get('mail.outlook.webhooks')[1];

            sinonExpect.calledOnce(requestStub.patch);
            sinonExpect.notCalled(requestStub.post);
            expect(result.callback).toBe('callback_2');
            expect(result.createdOn.toLocaleDateString()).toBe(new Date().toLocaleDateString());
        });

        test('should not renew webhook does not exist', async () => {
            const result = await service.renewWebhook('invalid_callback');

            sinonExpect.notCalled(requestStub.patch);
            sinonExpect.notCalled(requestStub.post);
            expect(result).toBeNull();
        });

        test('should not renew webhook when webhook is not expired', async () => {
            appSettings.get('mail.outlook.webhooks')[1].createdOn = new Date();

            const result = await service.renewWebhook('callback_2');

            sinonExpect.notCalled(requestStub.patch);
            sinonExpect.notCalled(requestStub.post);
            expect(result?.callback).toBe('callback_2');
        });

        test('should return null when failed to get request object', async () => {
            apiProviderStub.startGraphRequest.resolves(null);

            expect(await service.renewWebhook('callback_2')).toBeNull();
        });

        test('should recreate webhook on 404', async () => {
            requestStub.patch.throws({ statusCode: 404 });

            await service.renewWebhook('callback_2');

            sinonExpect.calledOnce(requestStub.patch);
            sinonExpect.calledOnce(requestStub.post);
        });

        test('should return null when non 404 error occurred', async () => {
            requestStub.patch.throws({ statusCode: 400 });

            const result = await service.renewWebhook('callback_2');

            sinonExpect.calledOnce(requestStub.patch);
            sinonExpect.notCalled(requestStub.post);
            expect(result).toBeNull();
        });
    });

    describe('renewAllWebhooks', () => {
        test('should renew all webhooks', async () => {
            await service.renewAllWebhooks();

            sinonExpect.callCount(requestStub.patch, appSettings.get('mail.outlook.webhooks').length);
        });
    });
});
