import { injectable } from 'inversify';

import ICiBuild from '../../../../interface/general/ci-build.interface';

@injectable()
export default class AzureDevopsCiBuildService {

    public async toCiBuild(payload: any): Promise<ICiBuild> {
        const { resource, message } = payload;
        const { run } = resource;
        const repository = run.resources.repositories.self;

        return ({
            id: `${run.id}-${run.name}-${run.pipeline.id}`,
            name: run.name,
            message: message.text,
            createdOn: new Date(payload.createdDate),
            startedOn: new Date(run.createdDate),
            finishedOn: run.finishedDate ? new Date(run.finishedDate) : null,
            url: run._links.web.href,
            status: run.state,
            result: run.result ?? null,
            pipeline: {
                id: resource.pipeline.id,
                name: resource.pipeline.name,
                url: run._links['pipeline.web'].href
            },
            triggeredBy: this.getRepository(repository)
        }) as ICiBuild;
    }

    private getRepository(data: any): any {
        const { repository, refName } = data;

        if (repository.type.toLowerCase() === 'github') {
            const url = `https://github.com/${repository.fullName}`;
            const branch = refName.split('/').slice(-1)[0];

            return ({
                type: repository.type,
                name: repository.fullName.split('/').slice(-1)[0],
                url,
                branch: {
                    name: branch,
                    url: `${url}/tree/${branch}`
                }
            });
        }
        return null;
    }
}
