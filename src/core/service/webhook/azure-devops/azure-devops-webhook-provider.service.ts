import { injectable, inject } from 'inversify';

import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookQuery from '../../../interface/webhook/webhook-query.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IHttpClient from '../../../interface/general/http-client.interface';
import IAzureDevopsWebhookContext from '../../../interface/webhook/azure-devops/azure-devops-webhook-context.interface';
import AppSettings from '../../io/app-settings/app-settings';

@injectable()
export default class AzureDevopsWebhookProviderService implements IWebhookProvider<IWebhookQuery, IAzureDevopsWebhookContext> {
    private _url: string;
    private _token: string;
    private _httpClient: IHttpClient;
    private _buildEndpoint: string;
    private _releaseEndpoint: string;

    constructor(
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.AppSettings) settings: AppSettings
    ) {
        const { url, token } = settings.get('cicd.azureDevops');
        this._url = url;
        this._token = token;
        this._buildEndpoint = `${url}/_apis/hooks/subscriptions?api-version=5.0`;
        this._releaseEndpoint = this._buildEndpoint.replace(/^(https:\/\/)/, '$1vsrm.');
        this._httpClient = httpClient;
    }

    private get headers(): { [key: string]: any } {
        const encoded = btoa(`:${this._token}`);

        return ({ Authorization: `basic ${encoded}` });
    }

    public async listWebhooks(query: IWebhookQuery): Promise<IWebhook[]> {
        const project = await this.getProject(query.name);

        if (!project) {
            return [];
        }
        const { data } = await this._httpClient.get(this._buildEndpoint, { headers: this.headers });

        return (data?.value || [])
            .map(this.toWebhook.bind(this))
            .filter((_: IWebhook) => _.project === project.id);
    }

    public async getWebhook(query: IWebhookQuery): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(query);

        return hooks.find(_ => _.callback === query.callback) ?? null;
    }

    public async addWebhook(context: IAzureDevopsWebhookContext): Promise<IWebhook> {
        const { project: name, callback, publisherId, eventType, isRelease } = context;
        const existingHook = await this.getWebhook({ name, callback });

        if (existingHook) {
            return existingHook;
        }
        const project = await this.getProject(name);

        if (!project) {
            throw new Error(`project with name ${name} does not exist.`);
        }

        const body = {
            publisherId,
            eventType,
            consumerId: 'webHooks',
            consumerActionId: 'httpRequest',
            publisherInputs: { projectId: project.id },
            consumerInputs: { url: callback }
        };

        const endpoint = isRelease ? this._releaseEndpoint : this._buildEndpoint;
        const { data } = await this._httpClient.post(endpoint, body, { headers: this.headers });

        return this.toWebhook(data);
    }

    private async getProject(idOrName: string): Promise<{ id: string; name: string } | null> {
        const endpoint = `${this._url}/_apis/projects/${idOrName}`;
        const { data } = await this._httpClient.get(endpoint);

        return data ? ({ id: data.id, name: data.name }) : null;
    }

    private toWebhook(data: any): IWebhook {
        return ({
            id: data.id,
            name: `${data.actionDescription} by ${data.createdBy.displayName}`,
            url: data.url,
            project: data.publisherInputs.projectId,
            callback: data.consumerInputs.url,
            contentType: 'json',
            events: [data.eventDescription],
            createdOn: new Date(data.createdDate),
            isActive: data.status === 'enabled'
        }) as IWebhook;
    }
}
