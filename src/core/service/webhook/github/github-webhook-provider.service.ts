import { injectable, inject } from 'inversify';

import Types from '../../../ioc/types';
import IHttpClient from '../../../interface/general/http-client.interface';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookQuery from '../../../interface/webhook/webhook-query.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IGithubWebhookContext from '../../../interface/webhook/github/github-webhook-context.interface';
import AppSettings from '../../io/app-settings/app-settings';

@injectable()
export default class GithubWebhookProviderService implements IWebhookProvider<IWebhookQuery, IGithubWebhookContext> {
    private _url: string;
    private _token: string;
    private _user: string;
    private _httpClient: IHttpClient;

    constructor(
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.AppSettings) settings: AppSettings
    ) {
        const { url, token, user } = settings.get('repository.github');
        this._url = url;
        this._token = token;
        this._user = user;
        this._httpClient = httpClient;
    }

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${this._token}` });
    }

    public async listWebhooks(query: IWebhookQuery): Promise<IWebhook[]> {
        const endpoint = `${this._url}/repos/${this._user}/${query.name}/hooks`;
        const { data } = await this._httpClient.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toWebhook.bind(this));
    }

    public async getWebhook(query: IWebhookQuery): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(query);

        return hooks.find(_ => _.callback === query.callback) ?? null;
    }

    public async addWebhook(context: IGithubWebhookContext): Promise<IWebhook> {
        const { callback, events, project } = context;
        const existingHook = await this.getWebhook({ name: project, callback });

        if (existingHook) {
            return existingHook;
        }

        const body = {
            events,
            config: {
                url: callback,
                content_type: 'json',
                insecure_ssl: '0'
            }
        };

        const endpoint = `${this._url}/repos/${this._user}/${project}/hooks`;
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
