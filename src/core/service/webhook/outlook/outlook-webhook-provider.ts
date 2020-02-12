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

    public async listWebhooks(_ = ''): Promise<IWebhook[]> {
        return (config.get(this._webhookPath) || []) as IWebhook[];
    }

    public async getWebhook(_: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks();

        return hooks.find(_ => _.callback === callback) ?? null;
    }

    public async addWebhook(name: string, context: IOutlookWebhookContext): Promise<IWebhook> {
        const { events, callback, resource } = context;
        const hooks = await this.listWebhooks();
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

        if (hooks.every(_ => _.id !== id)) {
            config.set(this._webhookPath, [...hooks, hook]);
        }
        return hook;
    }
}
