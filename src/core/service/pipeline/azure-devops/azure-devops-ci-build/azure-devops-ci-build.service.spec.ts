import { assert as sinonExpect, stub } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import IHttpClient from '../../../../interface/general/http-client.interface';

import AzureDevopsCiBuildService from './azure-devops-ci-build.service';

describe('azure devops ci build service unit test', () => {
    let service: AzureDevopsCiBuildService;
    let httpStub: any;

    beforeEach(() => {
        Container.snapshot();

        httpStub = stub({
            async get(): Promise<any> { return null; },
            async post(): Promise<any> { return null; }
        } as IHttpClient);

        Container
            .rebind<IHttpClient>(Types.IHttpClient)
            .toConstantValue(httpStub);

        service = Container.get<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService);
        httpStub.get.resolves({ data: '"sourceVersionMessage":"build_message","sourceBranch":"branch_name"' });
    });

    afterEach(() => {
        Container.restore();
    });

    describe('toCiBuild', () => {
        let payload: any;

        beforeEach(() => {
            payload = {
                message: {
                    text: 'payload_message_text'
                },
                resource: {
                    run: {
                        id: 'run_id',
                        name: 'run_name',
                        state: 'inProgress',
                        result: null,
                        createdDate: '2020-01-04T06:43:15.370Z',
                        finishedDate: null,
                        pipeline: {
                            id: 'pipeline_id',
                            name: 'pipeline_name'
                        },
                        _links: {
                            web: {
                                href: 'build_html_page_url'
                            },
                            'pipeline.web': {
                                href: 'pipeline_html_page_url'
                            }
                        },
                        resources: {
                            repositories: {
                                self: {
                                    refName: 'refs/heads/development',
                                    repository: {
                                        type: 'gitHub',
                                        fullName: 'yizhang/repository_name'
                                    }
                                }
                            }
                        }
                    }
                },
                createdDate: '2020-01-04T06:45:41.370Z'
            };
        });

        test('should convert payload to ci build using github repositories', async () => {
            const result = await service.toCiBuild(payload);

            sinonExpect.calledOnce(httpStub.get);
            expect(result.id).toBe('run_id-run_name-pipeline_id');
            expect(result.name).toBe('run_name');
            expect(result.message).toBe('build_message');
            expect(result.createdOn.getTime()).toBe(new Date('2020-01-04T06:45:41.370Z').getTime());
            expect(result.startedOn.getTime()).toBe(new Date('2020-01-04T06:43:15.370Z').getTime());
            expect(result.finishedOn).toBeNull();
            expect(result.url).toBe('build_html_page_url');
            expect(result.status).toBe('inProgress');
            expect(result.result).toBeNull();
            expect(result.pipeline.id).toBe('pipeline_id');
            expect(result.pipeline.name).toBe('pipeline_name');
            expect(result.pipeline.url).toBe('pipeline_html_page_url');
            expect(result.triggeredBy.type).toBe('github');
            expect(result.triggeredBy.name).toBe('repository_name');
            expect(result.triggeredBy.url).toBe('https://github.com/yizhang/repository_name');
            expect(result.triggeredBy.branch.isPullRequest).toBeFalsy();
            expect(result.triggeredBy.branch.name).toBe('development');
            expect(result.triggeredBy.branch.url).toBe('https://github.com/yizhang/repository_name/tree/development');
        });

        test('should include finished time and result when possible', async () => {
            payload.resource.run.result = 'failed';
            payload.resource.run.finishedDate = '2020-01-04T06:45:35.370Z';

            const result = await service.toCiBuild(payload);

            expect(result.result).toBe('failed');
            expect(result.finishedOn?.getTime()).toBe(new Date('2020-01-04T06:45:35.370Z').getTime());
        });

        test('should use default build message when failed to parse the html page for build message', async () => {
            httpStub.get.resolves({ data: '"sourceBranch":"branch_name"' });

            const result = await service.toCiBuild(payload);

            expect(result.message).toBe('payload_message_text');
        });

        test('should not include trigger repository information when repository provider is not supported', async () => {
            payload.resource.run.resources.repositories.self.repository.type = 'subversion';

            const result = await service.toCiBuild(payload);

            expect(result.triggeredBy).toBeNull();
        });
    });
});
