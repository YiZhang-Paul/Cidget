import { IBuildApi } from 'azure-devops-node-api/BuildApi';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';
import { stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import AzureDevopsApiProvider from '../azure-devops-api-provider/azure-devops-api-provider.service';

import AzureDevopsPipelineProvider from "./azure-devops-pipeline-provider.service";

describe('azure devops pipeline provider unit test', () => {
    let pipelineProvider: AzureDevopsPipelineProvider;
    let apiProviderStub: any;
    let buildApiStub: any;
    let releaseApiStub: any;

    beforeEach(() => {
        Container.snapshot();

        buildApiStub = stub({
            async getDefinition(): Promise<any> {
                return null;
            }
        });

        releaseApiStub = stub({
            async getReleaseDefinition(): Promise<any> {
                return null;
            }
        });

        apiProviderStub = stub({
            async getBuildApi(): Promise<IBuildApi> {
                return buildApiStub;
            },
            async getReleaseApi(): Promise<IReleaseApi> {
                return releaseApiStub;
            }
        } as AzureDevopsApiProvider);

        Container
            .rebind<AzureDevopsApiProvider>(Types.AzureDevopsApiProvider)
            .toConstantValue(apiProviderStub);

        pipelineProvider = Container.get<AzureDevopsPipelineProvider>(Types.AzureDevopsPipelineProvider);
    });

    afterEach(() => {
        Container.restore();
    });

    describe('fetchBuildDefinition', () => {
        let query: any;
        let response: any;

        beforeEach(() => {
            response = {
                id: 'pipeline_id',
                name: 'pipeline_name',
                createdDate: '2020-01-03T06:45:41.370Z',
                project: {
                    name: 'project_name'
                },
                authoredBy: {
                    displayName: 'john f doe',
                    imageUrl: 'https://www.example.com/image_1',
                    uniqueName: 'john.doe@gmail.com'
                },
                repository: {
                    name: 'repository_name',
                    type: 'repository_type',
                    defaultBranch: 'development',
                    properties: {
                        orgName: 'organization_name',
                        ownerAvatarUrl: 'https://www.example.com/avatar_1'
                    }
                }
            }

            query = { project: 'project_name', id: 'project_id' };
            apiProviderStub.getBuildApi.resolves(buildApiStub);
            buildApiStub.getDefinition.resolves(response);
        });

        test('should return build definition found', async () => {
            const result = await pipelineProvider.fetchBuildDefinition(query);

            expect(result?.name).toBe('pipeline_name');
            expect(result?.id).toBe('pipeline_id');
            expect(result?.project).toBe('project_name');
            expect(result?.owner.name).toBe('john f doe');
            expect(result?.owner.avatar).toBe('https://www.example.com/image_1');
            expect(result?.owner.email).toBe('john.doe@gmail.com');
            expect(result?.createdOn).toBe('2020-01-03T06:45:41.370Z');
            expect(result?.repository.name).toBe('repository_name');
            expect(result?.repository.type).toBe('repository_type');
            expect(result?.repository.defaultBranch).toBe('development');
            expect(result?.repository.organization.name).toBe('organization_name');
            expect(result?.repository.organization.avatar).toBe('https://www.example.com/avatar_1');
        });

        test('should properly set default values for missing fields', async () => {
            response.authoredBy = null;
            response.project = null;
            response.repository = null;

            const result = await pipelineProvider.fetchBuildDefinition(query);

            expect(result?.owner.name).toBe('');
            expect(result?.owner.avatar).toBe('');
            expect(result?.owner.email).toBe('');
            expect(result?.project).toBe('');
            expect(result?.repository.organization.name).toBe('');
            expect(result?.repository.organization.avatar).toBe('');
            expect(result?.repository.name).toBe('');
            expect(result?.repository.type).toBe('unknown');
            expect(result?.repository.defaultBranch).toBe('');
        });

        test('should properly set default values for missing fields when repository has no properties', async () => {
            response.repository.properties = null;

            const result = await pipelineProvider.fetchBuildDefinition(query);

            expect(result?.repository.organization.name).toBe('');
            expect(result?.repository.organization.avatar).toBe('');
        });

        test('should return null when no build definition found', async () => {
            buildApiStub.getDefinition.resolves(null);

            expect(await pipelineProvider.fetchBuildDefinition(query)).toBeNull();
        });
    });

    describe('fetchReleaseDefinition', () => {
        let query: any;
        let response: any;

        beforeEach(() => {
            response = {
                id: 'pipeline_id',
                name: 'pipeline_name',
                createdBy: {
                    displayName: 'john f doe',
                    imageUrl: 'https://www.example.com/image_1',
                    uniqueName: 'john.doe@gmail.com'
                },
                createdOn: '2020-01-03T06:45:41.370Z',
                artifacts: [
                    {
                        definitionReference: {
                            project: {
                                name: 'project_name'
                            },
                            definition: {
                                name: 'trigger_definition_name'
                            }
                        }
                    }
                ]
            }

            query = { project: 'project_name', id: 'project_id' };
            apiProviderStub.getReleaseApi.resolves(releaseApiStub);
            releaseApiStub.getReleaseDefinition.resolves(response);
        });

        test('should return release definition found', async () => {
            const result = await pipelineProvider.fetchReleaseDefinition(query);

            expect(result?.name).toBe('pipeline_name');
            expect(result?.id).toBe('pipeline_id');
            expect(result?.project).toBe('project_name');
            expect(result?.triggeredBy).toBe('trigger_definition_name');
            expect(result?.owner.name).toBe('john f doe');
            expect(result?.owner.avatar).toBe('https://www.example.com/image_1');
            expect(result?.owner.email).toBe('john.doe@gmail.com');
            expect(result?.createdOn).toBe('2020-01-03T06:45:41.370Z');
        });

        test('should properly set default values for missing fields', async () => {
            response.createdBy = null;
            response.artifacts = null;

            const result = await pipelineProvider.fetchReleaseDefinition(query);

            expect(result?.owner.name).toBe('');
            expect(result?.owner.avatar).toBe('');
            expect(result?.owner.email).toBe('');
            expect(result?.project).toBe('');
            expect(result?.triggeredBy).toBe('');
        });

        test('should properly set default values for missing fields when artifact has no reference to build definition', async () => {
            response.artifacts[0].definitionReference = null;

            const result = await pipelineProvider.fetchReleaseDefinition(query);

            expect(result?.project).toBe('');
            expect(result?.triggeredBy).toBe('');
        });

        test('should return null when no release definition found', async () => {
            releaseApiStub.getReleaseDefinition.resolves(null);

            expect(await pipelineProvider.fetchReleaseDefinition(query)).toBeNull();
        });
    });
});
