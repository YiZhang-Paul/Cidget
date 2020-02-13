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

    private get expireTime(): Date {
        return new Date(Date.now() + 60000 * 4230);
    }

    private isExpired(hook: IWebhook): boolean {
        return Date.now() - hook.createdOn.getTime() >= 60000 * 4230;
    }

    public async listWebhooks(_ = ''): Promise<IWebhook[]> {
        const hooks = (config.get(this._webhookPath) || []) as IWebhook[];

        for (const hook of hooks) {
            hook.createdOn = new Date(hook.createdOn);
        }
        return hooks;
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
            expirationDateTime: this.expireTime.toISOString(),
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

    public async renewWebhook(callback: string): Promise<IWebhook | null> {
        const hook = await this.getWebhook('', callback);

        if (!hook || !this.isExpired(hook)) {
            return hook;
        }
        const hooks = await this.listWebhooks();
        const index = hooks.findIndex(_ => _.id === hook.id);
        hooks[index].createdOn = new Date();
        const request = await this._graphApi.startGraphRequest(`/subscriptions/${hook.id}`);
        await request?.patch({ expirationDateTime: this.expireTime.toISOString() });
        config.set(this._webhookPath, hooks);

        return hooks[index];
    }

    public async renewAllWebhooks(): Promise<void> {
        for (const hook of await this.listWebhooks()) {
            await this.renewWebhook(hook.callback);
        }
    }
}
