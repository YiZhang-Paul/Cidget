import { injectable, inject } from 'inversify';

import config from '../../../../electron-config';
import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IOutlookWebhookContext from '../../../interface/webhook/outlook/outlook-webhook-context.interface';
import OutlookApiProvider from '../../mail/outlook/outlook-api-provider';

@injectable()
export default class OutlookWebhookProvider implements IWebhookProvider<IOutlookWebhookContext> {
    private _webhookPath = 'mail.outlook.webhooks';
    private _graphApi: OutlookApiProvider;

    constructor(@inject(Types.OutlookApiProvider) graphApi: OutlookApiProvider) {
        this._graphApi = graphApi;
    }

    public async listWebhooks(name: string): Promise<IWebhook[]> {
        return [];
    }

    public async getWebhook(name: string, callback: string): Promise<IWebhook | null> {
        return null;
    }

    public async addWebhook(name: string, context: IOutlookWebhookContext): Promise<IWebhook> {
        const hooks = config.get(this._webhookPath) || [];
        const { events, callback, resource } = context;
        const request = await this._graphApi.startGraphRequest('/subscriptions');

        const { id } = await request?.post({
            changeType: events.join(','),
            notificationUrl: callback,
            resource,
            expirationDateTime: new Date(Date.now() + 60000 * 4230).toISOString(),
            clientState: name
        });

        const hook = ({
            id,
            name,
            url: 'https://graph.microsoft.com/v1.0/subscriptions',
            callback,
            events,
            createdOn: new Date(),
            isActive: true
        }) as IWebhook;

        if (hooks.every((_: any) => _.id !== id)) {
            config.set(this._webhookPath, [hook]);
        }
        return hook;
    }
}
