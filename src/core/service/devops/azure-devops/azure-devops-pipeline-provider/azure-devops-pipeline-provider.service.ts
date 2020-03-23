import { injectable, inject } from 'inversify';
import { BuildRepository } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { IdentityRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { TeamProjectReference } from 'azure-devops-node-api/interfaces/CoreInterfaces';

import Types from '../../../../ioc/types';
import IUser from '../../../../interface/generic/user.interface';
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

        return ({
            name: definition.name,
            id: definition.id,
            project: this.getProject(definition.project),
            owner: this.getOwner(definition.authoredBy),
            createdOn: definition.createdDate,
            repository: this.getRepository(definition.repository)
        }) as IBuildPipeline;
    }

    public async fetchReleaseDefinition({ project, id }: IAzureDevopsQueryContext): Promise<IReleasePipeline | null> {
        const api = await this._apiProvider.getReleaseApi();
        const definition = await api.getReleaseDefinition(project, id);

        if (!definition) {
            return null;
        }

        const definitionReference = definition.artifacts?.[0].definitionReference;

        return ({
            name: definition.name,
            id: definition.id,
            project: definitionReference?.project.name ?? '',
            triggeredBy: definitionReference?.definition.name ?? '',
            owner: this.getOwner(definition.createdBy),
            createdOn: definition.createdOn
        }) as IReleasePipeline;
    }

    private getProject(project?: TeamProjectReference): { id: string; name: string } {
        return ({
            id: project?.id ?? '',
            name: project?.name ?? ''
        });
    }

    private getOwner(user?: IdentityRef): IUser {
        return ({
            name: user?.displayName ?? '',
            avatar: user?.imageUrl ?? '',
            email: user?.uniqueName ?? ''
        }) as IUser;
    }

    private getRepository(repository?: BuildRepository): IRepository {
        return ({
            name: repository?.name ?? '',
            type: repository?.type ?? 'unknown',
            defaultBranch: repository?.defaultBranch ?? '',
            organization: {
                name: repository?.properties?.orgName ?? '',
                avatar: repository?.properties?.ownerAvatarUrl ?? ''
            }
        }) as IRepository;
    }
}
