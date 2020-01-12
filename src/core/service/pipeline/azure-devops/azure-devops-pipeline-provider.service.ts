import * as config from 'config';
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';

import IUser from '../../../interface/general/user.interface';
import IRepository from '../../../interface/general/repository.interface';
import IBuildPipeline from '../../../interface/pipeline/build-pipeline.interface';
import IReleasePipeline from '../../../interface/pipeline/release-pipeline.interface';
import IPipelineProvider from '../../../interface/pipeline/pipeline-provider.interface';
import IAzureDevopsQueryContext from '../../../interface/pipeline/azure-devops/azure-devops-query-context.interface';

const { url, token } = config.get<any>('cicd').azureDevops;
const azureApi = new WebApi(url, getPersonalAccessTokenHandler(token));

export default class AzureDevopsPipelineProvider implements IPipelineProvider<IAzureDevopsQueryContext> {

    private _buildApiPromise = azureApi.getBuildApi();
    private _releaseApiPromise = azureApi.getReleaseApi();

    public async fetchBuildDefinition({ project, id }: IAzureDevopsQueryContext): Promise<IBuildPipeline | null> {
        const api = await this._buildApiPromise;
        const definition = await api.getDefinition(project, id);

        if (!definition) {
            return null;
        }

        const owner: IUser = {
            name: definition.authoredBy?.displayName ?? '',
            avatar: definition.authoredBy?.imageUrl,
            email: definition.authoredBy?.uniqueName
        };

        const organization: IUser = {
            name: definition.repository?.properties?.orgName ?? '',
            avatar: definition.repository?.properties?.ownerAvatarUrl
        };

        const repository: IRepository = {
            name: definition.repository?.name ?? '',
            type: definition.repository?.type ?? 'unknown',
            defaultBranch: definition.repository?.defaultBranch,
            organization
        };

        return {
            name: definition.name,
            id: definition.id,
            project: definition.project?.name,
            owner,
            createdOn: definition.createdDate,
            repository
        } as IBuildPipeline;
    }

    public async fetchReleaseDefinition({ project, id }: IAzureDevopsQueryContext): Promise<IReleasePipeline | null> {
        const api = await this._releaseApiPromise;
        const definition = await api.getReleaseDefinition(project, id);

        if (!definition) {
            return null;
        }

        const owner: IUser = {
            name: definition.createdBy?.displayName ?? '',
            avatar: definition.createdBy?.imageUrl,
            email: definition.createdBy?.uniqueName
        };

        return {
            name: definition.name,
            id: definition.id,
            project: definition.artifacts?.[0].definitionReference?.project.name,
            triggeredBy: definition.artifacts?.[0].definitionReference?.definition.name,
            owner,
            createdOn: definition.createdOn
        } as IReleasePipeline;
    }
}
