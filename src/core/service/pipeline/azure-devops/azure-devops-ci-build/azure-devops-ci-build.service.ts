import { injectable } from 'inversify';

import ICiBuild from '../../../../interface/general/ci-build.interface';

@injectable()
export default class AzureDevopsCiBuildService {

    public async toCiBuild(payload: any): Promise<ICiBuild> {
        const { resource, message } = payload;
        const { run } = resource;
        const repository = run.resources.repositories.self;

        return ({
            id: payload.id,
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
            repository: {
                type: repository.repository.type,
                name: repository.repository.fullName.split('/').slice(-1)[0],
                branch: repository.refName.split('/').slice(-1)[0]
            }
        }) as ICiBuild;
    }
}
