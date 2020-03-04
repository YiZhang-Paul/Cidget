import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/generic/http-client.interface';

import AzureDevopsCdReleaseService from './azure-devops-cd-release.service';

describe('azure devops cd release service unit test', () => {
    let service: AzureDevopsCdReleaseService;
    let httpStub: any;

    beforeEach(() => {
        httpStub = stub({
            async get(): Promise<any> { return null; },
            async post(): Promise<any> { return null; }
        } as IHttpClient);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        service = Container.get<AzureDevopsCdReleaseService>(Types.AzureDevopsCdReleaseService);
    });

    describe('toCdRelease', () => {
        let payload: any;
        let stages: any[];

        beforeEach(() => {
            payload = {
                resource: {
                    stageName: 'stage-2',
                    url: 'release_resource_url',
                    project: {
                        name: 'project_name'
                    },
                    data: {
                        commits: [{}, {}, {}]
                    },
                    release: {
                        name: 'Release-4',
                        status: 'queued',
                        url: 'release_url',
                        releaseDefinition: {
                            id: 2,
                            name: 'release_definition_name',
                            _links: {
                                web: {
                                    href: 'release_definition_html_url'
                                }
                            }
                        },
                        artifacts: [
                            {
                                definitionReference: {
                                    definition: {
                                        name: 'build_pipeline_name'
                                    },
                                    artifactSourceVersionUrl: {
                                        id: 'source_code_url'
                                    }
                                }
                            }
                        ]
                    }
                },
                createdDate: '2020-01-04T06:43:15.370Z'
            };

            stages = [
                { name: 'stage-1', status: 'succeeded' },
                { name: 'stage-2', status: 'inProgress' },
                { name: 'stage-3', status: 'notStarted' }
            ];

            httpStub.get.resolves({ data: { environments: stages } });
        });

        test('should convert payload into cd release when no deployment available', async () => {
            const result = await service.toCdRelease(payload);

            sinonExpect.calledOnce(httpStub.get);
            expect(result.id).toBe('2-Release-4');
            expect(result.name).toBe('Release-4');
            expect(result.status).toBe('in progress');
            expect(result.createdOn.getTime()).toBe(new Date('2020-01-04T06:43:15.370Z').getTime());
            expect(result.url).toBe('release_resource_url');
            expect(result.commits).toBe(3);
            expect(result.project).toBe('project_name');
            expect(result.pipeline.id).toBe(2);
            expect(result.pipeline.name).toBe('release_definition_name');
            expect(result.pipeline.url).toBe('release_definition_html_url');
            expect(result.activeStage).toBe('stage-2');
            expect(result.stages).toStrictEqual(stages);
            expect(result.triggeredBy.name).toBe('build_pipeline_name');
            expect(result.triggeredBy.url).toBe('source_code_url');
        });

        test('should convert payload into cd release when deployment is available', async () => {
            payload.resource.deployment = { release: payload.resource.release };
            payload.resource.deployment.releaseDefinition = payload.resource.release.releaseDefinition;
            payload.resource.environment = { status: 'approved' };
            delete payload.resource.release;

            const result = await service.toCdRelease(payload);

            sinonExpect.calledOnce(httpStub.get);
            expect(result.id).toBe('2-Release-4');
            expect(result.name).toBe('Release-4');
            expect(result.status).toBe('approved');
            expect(result.createdOn.getTime()).toBe(new Date('2020-01-04T06:43:15.370Z').getTime());
            expect(result.url).toBe('release_resource_url');
            expect(result.commits).toBe(3);
            expect(result.project).toBe('project_name');
            expect(result.pipeline.id).toBe(2);
            expect(result.pipeline.name).toBe('release_definition_name');
            expect(result.pipeline.url).toBe('release_definition_html_url');
            expect(result.activeStage).toBe('stage-2');
            expect(result.stages).toStrictEqual(stages);
            expect(result.triggeredBy.name).toBe('build_pipeline_name');
            expect(result.triggeredBy.url).toBe('source_code_url');
        });

        test('should read approval status when available', async () => {
            payload.resource.approval = { status: 'rejected' };

            const result = await service.toCdRelease(payload);

            expect(payload.resource.release.status).toBe('queued');
            expect(result.status).toBe('rejected');
        });

        test('should return proper status when pending', async () => {
            payload.resource.release.status = 'pending';

            const result = await service.toCdRelease(payload);

            expect(result.status).toBe('needs approval');
        });

        test('should properly set default value for missing fields', async () => {
            payload.resource.data = null;
            payload.resource.stageName = null;
            payload.resource.release.artifacts = [];
            httpStub.get.resolves({ data: null });

            const result = await service.toCdRelease(payload);

            expect(result.commits).toBeNull();
            expect(result.activeStage).toBe('');
            expect(result.stages?.length).toBe(0);
            expect(result.triggeredBy.name).toBe('');
            expect(result.triggeredBy.url).toBe('');
        });

        test('should properly set default value when commits and source code url are not available', async () => {
            payload.resource.data = { commits: null };
            payload.resource.release.artifacts[0].definitionReference.artifactSourceVersionUrl = null;

            const result = await service.toCdRelease(payload);

            expect(result.commits).toBeNull();
            expect(result.triggeredBy.url).toBe('');
        });
    });
});
