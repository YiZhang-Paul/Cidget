import { injectable, inject } from 'inversify';

import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookQuery from '../../../interface/webhook/webhook-query.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IOutlookWebhookContext from '../../../interface/webhook/outlook/outlook-webhook-context.interface';
import OutlookApiProvider from '../../email/outlook/outlook-api-provider/outlook-api-provider';
import AppSettings from '../../io/app-settings/app-settings';

@injectable()
export default class OutlookWebhookProvider implements IWebhookProvider<IWebhookQuery, IOutlookWebhookContext> {
    private _webhookPath = 'mail.outlook.webhooks';
    private _graphApi: OutlookApiProvider;
    private _settings: AppSettings;

    constructor(
        @inject(Types.OutlookApiProvider) graphApi: OutlookApiProvider,
        @inject(Types.AppSettings) settings: AppSettings
    ) {
        this._graphApi = graphApi;
        this._settings = settings;
    }

    private get expireTime(): Date {
        return new Date(Date.now() + 60000 * 4230);
    }

    private isExpired(hook: IWebhook): boolean {
        return Date.now() - hook.createdOn.getTime() >= 60000 * 4230;
    }

    public async listWebhooks(): Promise<IWebhook[]> {
        const hooks = (this._settings.get(this._webhookPath) || []) as IWebhook[];

        for (const hook of hooks) {
            hook.createdOn = new Date(hook.createdOn);
        }
        return hooks;
    }

    public async getWebhook(query: IWebhookQuery): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks();

        return hooks.find(_ => _.callback === query.callback) ?? null;
    }

    public async addWebhook(context: IOutlookWebhookContext): Promise<IWebhook | null> {
        const { events, callback, resource, state } = context;
        const request = await this._graphApi.startGraphRequest('/subscriptions');

        if (!request) {
            return null;
        }

        const { id } = await request.post({
            changeType: events.join(','),
            notificationUrl: callback,
            resource,
            expirationDateTime: this.expireTime.toISOString(),
            clientState: state
        });

        const hook = ({
            id,
            url: 'https://graph.microsoft.com/v2.0/subscriptions',
            callback,
            events,
            createdOn: new Date(),
            isActive: true
        }) as IWebhook;

        await this.saveWebhook(hook);

        return hook;
    }

    private async saveWebhook(hook: IWebhook): Promise<void> {
        const hooks = await this.listWebhooks();
        const index = hooks.findIndex(_ => _.id === hook.id);

        if (index === -1) {
            hooks.push(hook);
        }
        else {
            hooks[index] = hook;
        }
        this._settings.set(this._webhookPath, hooks);
    }

    private async recreateWebhook(hook: IWebhook): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks();
        this._settings.set(this._webhookPath, hooks.filter(_ => _.id !== hook.id));

        return await this.addWebhook({
            events: hook.events,
            callback: hook.callback,
            resource: '/me/messages',
            state: '12345'
        });
    }

    public async renewWebhook(callback: string): Promise<IWebhook | null> {
        const hook = await this.getWebhook({ name: '', callback });

        if (!hook || !this.isExpired(hook)) {
            return hook;
        }
        const hooks = await this.listWebhooks();
        const index = hooks.findIndex(_ => _.id === hook.id);
        hooks[index].createdOn = new Date();

        try {
            const request = await this._graphApi.startGraphRequest(`/subscriptions/${hook.id}`);

            if (!request) {
                return null;
            }

            await request.patch({ expirationDateTime: this.expireTime.toISOString() });
            this._settings.set(this._webhookPath, hooks);

            return hooks[index];
        }
        catch (error) {
            return error.statusCode === 404 ? await this.recreateWebhook(hook) : null;
        }
    }

    public async renewAllWebhooks(): Promise<void> {
        for (const hook of await this.listWebhooks()) {
            await this.renewWebhook(hook.callback);
        }
    }
}
