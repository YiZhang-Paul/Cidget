import { injectable, inject } from 'inversify';
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { IBuildApi } from 'azure-devops-node-api/BuildApi';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';

import Types from '../../../../ioc/types';
import AppSettings from '../../../io/app-settings/app-settings';

@injectable()
export default class AzureDevopsApiProvider {
    private _azureApi: WebApi;

    constructor(@inject(Types.AppSettings) settings: AppSettings) {
        const { url, token } = settings.get('cicd.azureDevops');
        this._azureApi = new WebApi(url, getPersonalAccessTokenHandler(token));
    }

    public async getBuildApi(): Promise<IBuildApi> {
        return await this._azureApi.getBuildApi();
    }

    public async getReleaseApi(): Promise<IReleaseApi> {
        return await this._azureApi.getReleaseApi();
    }
}
