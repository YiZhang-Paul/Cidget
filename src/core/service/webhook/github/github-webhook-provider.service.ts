import { injectable, inject } from 'inversify';

import config from '../../../../electron-store';
import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IHttpClient from '../../../interface/general/http-client.interface';

const { url, token, user } = config.get('repository').github;

@injectable()
export default class GithubWebhookProviderService implements IWebhookProvider<any> {
    private _httpClient: IHttpClient;

    constructor(@inject(Types.IHttpClient) httpClient: IHttpClient) {
        this._httpClient = httpClient;
    }

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${token}` });
    }

    public async listWebhooks(name: string): Promise<IWebhook[]> {
        const endpoint = `${url}/repos/${user}/${name}/hooks`;
        const { data } = await this._httpClient.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toWebhook.bind(this));
    }

    public async getWebhook(name: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(name);

        return hooks.find(_ => _.callback === callback) ?? null;
    }

    public async addWebhook(name: string, context: any): Promise<IWebhook> {
        const existingHook = await this.getWebhook(name, context.callback);

        if (existingHook) {
            return existingHook;
        }

        const body = {
            events: context.events,
            config: {
                url: context.callback,
                content_type: 'json',
                insecure_ssl: '0'
            }
        };

        const endpoint = `${url}/repos/${user}/${name}/hooks`;
        const { data } = await this._httpClient.post(endpoint, body, { headers: this.headers });

        return this.toWebhook(data);
    }

    private toWebhook(data: any): IWebhook {
        return ({
            id: data.id,
            name: data.name,
            url: data.url,
            callback: data.config.url,
            contentType: data.config.content_type,
            events: data.events,
            createdOn: new Date(data.created_at),
            isActive: data.active
        }) as IWebhook;
    }
}
