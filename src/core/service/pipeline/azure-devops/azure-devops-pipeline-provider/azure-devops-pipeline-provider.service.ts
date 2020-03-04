import { injectable, inject } from 'inversify';

import Types from '../../../../ioc/types';
import IUser from '../../../../interface/general/user.interface';
import IRepository from '../../../../interface/devops/ci/repository.interface';
import IBuildPipeline from '../../../../interface/devops/ci/build-pipeline.interface';
import IReleasePipeline from '../../../../interface/devops/cd/release-pipeline.interface';
import IPipelineProvider from '../../../../interface/devops/pipeline-provider.interface';
import IAzureDevopsQueryContext from '../../../../interface/devops/azure-devops/azure-devops-query-context.interface';
import AzureDevopsApiProvider from '../azure-devops-api-provider/azure-devops-api-provider.service';

@injectable()
export default class AzureDevopsPipelineProvider implements IPipelineProvider<IAzureDevopsQueryContext> {
    private _apiProvider: AzureDevopsApiProvider;

    constructor(@inject(Types.AzureDevopsApiProvider) apiProvider: AzureDevopsApiProvider) {
        this._apiProvider = apiProvider;
    }

    public async fetchBuildDefinition({ project, id }: IAzureDevopsQueryContext): Promise<IBuildPipeline | null> {
        const api = await this._apiProvider.getBuildApi();
        const definition = await api.getDefinition(project, id);

        if (!definition) {
            return null;
        }

        const owner: IUser = {
            name: definition.authoredBy?.displayName ?? '',
            avatar: definition.authoredBy?.imageUrl ?? '',
            email: definition.authoredBy?.uniqueName ?? ''
        };

        const organization: IUser = {
            name: definition.repository?.properties?.orgName ?? '',
            avatar: definition.repository?.properties?.ownerAvatarUrl ?? ''
        };

        const repository: IRepository = {
            name: definition.repository?.name ?? '',
            type: definition.repository?.type ?? 'unknown',
            defaultBranch: definition.repository?.defaultBranch ?? '',
            organization
        };

        return ({
            name: definition.name,
            id: definition.id,
            project: {
                id: definition.project?.id ?? '',
                name: definition.project?.name ?? ''
            },
            owner,
            createdOn: definition.createdDate,
            repository
        }) as IBuildPipeline;
    }

    public async fetchReleaseDefinition({ project, id }: IAzureDevopsQueryContext): Promise<IReleasePipeline | null> {
        const api = await this._apiProvider.getReleaseApi();
        const definition = await api.getReleaseDefinition(project, id);

        if (!definition) {
            return null;
        }

        const owner: IUser = {
            name: definition.createdBy?.displayName ?? '',
            avatar: definition.createdBy?.imageUrl ?? '',
            email: definition.createdBy?.uniqueName ?? ''
        };

        return ({
            name: definition.name,
            id: definition.id,
            project: definition.artifacts?.[0].definitionReference?.project.name ?? '',
            triggeredBy: definition.artifacts?.[0].definitionReference?.definition.name ?? '',
            owner,
            createdOn: definition.createdOn
        }) as IReleasePipeline;
    }
}
