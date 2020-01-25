import { injectable, inject } from 'inversify';

import Types from '../../../../ioc/types';
import ICdRelease from '../../../../interface/general/cd-release.interface';
import IHttpClient from '../../../../interface/general/http-client.interface';

@injectable()
export default class AzureDevopsCdReleaseService {
    private _httpClient: IHttpClient;

    constructor(@inject(Types.IHttpClient) httpClient: IHttpClient) {
        this._httpClient = httpClient;
    }

    public async toCdRelease(payload: any): Promise<ICdRelease> {
        const { resource } = payload;
        const release = resource.release || resource.deployment.release;
        const definition = (resource.release || resource.deployment).releaseDefinition;
        const artifact = release.artifacts[0]?.definitionReference;
        const status = (resource.environment || resource.approval || resource.release).status;

        return ({
            id: `${definition.id}-${release.name}`,
            name: release.name,
            status: status === 'pending' ? 'needs approval' : status,
            createdOn: new Date(payload.createdDate),
            url: resource.url,
            commits: resource.data?.commits?.length ?? null,
            project: resource.project.name,
            pipeline: {
                id: definition.id,
                name: definition.name,
                url: definition._links.web.href
            },
            activeStage: resource.stageName ?? '',
            stages: await this.getStages(release.url),
            triggeredBy: {
                name: artifact.definition.name ?? '',
                url: artifact.artifactSourceVersionUrl?.id ?? ''
            }
        }) as ICdRelease;
    }

    private async getStages(url: string): Promise<{ name: string; status: string }[]> {
        const { data } = await this._httpClient.get(url);
        const stages = data?.environments ?? [];

        return stages.map((_: any) => ({ name: _.name, status: _.status }));
    }
}
