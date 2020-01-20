import * as axios from 'axios';

import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';

const { url, token, user } = require('config').get('repository').github;

export default class GithubWebhookProviderService implements IWebhookProvider<any> {

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${token}` });
    }

    public async listWebhooks(name: string): Promise<IWebhook[]> {
        const endpoint = `${url}/repos/${user}/${name}/hooks`;
        const { data } = await axios.default.get(endpoint, { headers: this.headers });

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
        const { data } = await axios.default.post(endpoint, body, { headers: this.headers });

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
