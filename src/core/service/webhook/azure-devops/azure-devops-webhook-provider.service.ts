import { injectable, inject } from 'inversify';

import config from '../../../../electron-config';
import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IHttpClient from '../../../interface/general/http-client.interface';
import IAzureDevopsWebhookContext from '@/core/interface/webhook/azure-devops/azure-devops-webhook-context.interface';

const { url, token } = config.get('cicd').azureDevops;

@injectable()
export default class AzureDevopsWebhookProviderService implements IWebhookProvider<IAzureDevopsWebhookContext> {
    private _httpClient: IHttpClient;
    private _buildEndpoint = `${url}/_apis/hooks/subscriptions?api-version=5.0`;
    private _releaseEndpoint = this._buildEndpoint.replace(/^(https:\/\/)/, '$1vsrm.');

    constructor(@inject(Types.IHttpClient) httpClient: IHttpClient) {
        this._httpClient = httpClient;
    }

    private get headers(): { [key: string]: any } {
        const encoded = btoa(`:${token}`);

        return ({ Authorization: `basic ${encoded}` });
    }

    public async listWebhooks(name: string): Promise<IWebhook[]> {
        const project = await this.getProject(name);

        if (!project) {
            return [];
        }
        const { data } = await this._httpClient.get(this._buildEndpoint, { headers: this.headers });

        return (data?.value || [])
            .map(this.toWebhook.bind(this))
            .filter((_: IWebhook) => _.project === project.id);
    }

    public async getWebhook(name: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(name);

        return hooks.find(_ => _.callback === callback) ?? null;
    }

    public async addWebhook(name: string, context: IAzureDevopsWebhookContext): Promise<IWebhook> {
        const existingHook = await this.getWebhook(name, context.callback);

        if (existingHook) {
            return existingHook;
        }
        const project = await this.getProject(name);

        if (!project) {
            throw new Error(`project with name ${name} does not exist.`);
        }

        const body = {
            publisherId: context.publisherId,
            eventType: context.eventType,
            consumerId: 'webHooks',
            consumerActionId: 'httpRequest',
            publisherInputs: { projectId: project.id },
            consumerInputs: { url: context.callback }
        };

        const endpoint = context.isRelease ? this._releaseEndpoint : this._buildEndpoint;
        const { data } = await this._httpClient.post(endpoint, body, { headers: this.headers });

        return this.toWebhook(data);
    }

    private async getProject(idOrName: string): Promise<{ id: string; name: string } | null> {
        const endpoint = `${url}/_apis/projects/${idOrName}`;
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
