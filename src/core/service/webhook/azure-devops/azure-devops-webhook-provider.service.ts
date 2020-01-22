import { injectable, inject } from 'inversify';

import Types from '../../../ioc/types';
import IWebhook from '../../../interface/webhook/webhook.interface';
import IWebhookProvider from '../../../interface/webhook/webhook-provider.interface';
import IHttpClient from '../../../interface/general/http-client.interface';
import AzureDevopsPipelineProvider from '../../pipeline/azure-devops/azure-devops-pipeline-provider/azure-devops-pipeline-provider.service';

const { url, token } = require('config').get('cicd').azureDevops;

@injectable()
export default class AzureDevopsWebhookProviderService implements IWebhookProvider<any> {
    private _httpClient: IHttpClient;
    private _pipelineProvider: AzureDevopsPipelineProvider;
    private _endpoint = `${url}/_apis/hooks/subscriptions?api-version=5.0`;

    constructor(
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.AzureDevopsPipelineProvider) pipelineProvider: AzureDevopsPipelineProvider
    ) {
        this._httpClient = httpClient;
        this._pipelineProvider = pipelineProvider;
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
        const { data } = await this._httpClient.get(this._endpoint, { headers: this.headers });

        return (data?.value || [])
            .map(this.toWebhook.bind(this))
            .filter((_: IWebhook) => _.project === project.id);
    }

    public async getWebhook(name: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(name);

        return hooks.find(_ => _.callback === callback) ?? null;
    }
    // TODO move paramters out
    // TODO check existing
    public async addWebhook(name: string, context: any): Promise<IWebhook> {
        const pipeline = await this._pipelineProvider.fetchBuildDefinition({ project: 'cidget', id: 2 });

        const body = {
            publisherId: 'pipelines',
            eventType: 'ms.vss-pipelines.run-state-changed-event',
            consumerId: 'webHooks',
            consumerActionId: 'httpRequest',
            publisherInputs: {
                projectId: pipeline?.project.id,
            },
            consumerInputs: {
                url: 'https://4dc011f9.ngrok.io/azure-devops/pipeline'
            }
        };

        const { data } = await this._httpClient.post(this._endpoint, body, { headers: this.headers });
        console.log('second');
        console.log(data);
        return this.toWebhook(data);
    }

    private async getProject(idOrName: string): Promise<{ id: string; name: string } | null> {
        const { data } = await this._httpClient.get(`${url}/_apis/projects/${idOrName}`);

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
