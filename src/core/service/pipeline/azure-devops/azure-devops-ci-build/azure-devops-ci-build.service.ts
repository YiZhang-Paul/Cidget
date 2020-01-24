import { injectable, inject } from 'inversify';

import Types from '../../../../ioc/types';
import ICiBuild from '../../../../interface/general/ci-build.interface';
import IHttpClient from '../../../../interface/general/http-client.interface';

@injectable()
export default class AzureDevopsCiBuildService {
    private _httpClient: IHttpClient;

    constructor(@inject(Types.IHttpClient) httpClient: IHttpClient) {
        this._httpClient = httpClient;
    }

    public async toCiBuild(payload: any): Promise<ICiBuild> {
        const { run } = payload.resource;
        const message = await this.getBuildMessage(run._links.web.href);

        return ({
            id: `${run.id}-${run.name}-${run.pipeline.id}`,
            name: run.name,
            message: message || payload.message.text,
            createdOn: new Date(payload.createdDate),
            startedOn: new Date(run.createdDate),
            finishedOn: run.finishedDate ? new Date(run.finishedDate) : null,
            url: run._links.web.href,
            status: run.state,
            result: run.result ?? null,
            pipeline: {
                id: run.pipeline.id,
                name: run.pipeline.name,
                url: run._links['pipeline.web'].href
            },
            triggeredBy: this.getRepository(run.resources.repositories.self)
        }) as ICiBuild;
    }

    private async getBuildMessage(url: string): Promise<string> {
        try {
            const corsUrl = `https://cors-anywhere.herokuapp.com/${url}`;
            const { data } = await this._httpClient.get(corsUrl);
            const match = data.match(/VersionMessage"\s*:\s*.*(?=,\s*"sourceBranch")/);
            const rawText = (match || [])[0] || '';

            return rawText.split(':')[1].trim().replace(/[",]/g, '');
        }
        catch {
            return '';
        }
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
