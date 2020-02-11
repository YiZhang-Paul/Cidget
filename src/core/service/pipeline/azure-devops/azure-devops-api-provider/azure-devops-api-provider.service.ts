import { injectable } from 'inversify';
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { IBuildApi } from 'azure-devops-node-api/BuildApi';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';

import config from '../../../../../electron-config';

const { url, token } = config.get('cicd.azureDevops');

@injectable()
export default class AzureDevopsApiProvider {
    private _azureApi = new WebApi(url, getPersonalAccessTokenHandler(token));

    public async getBuildApi(): Promise<IBuildApi> {
        return await this._azureApi.getBuildApi();
    }

    public async getReleaseApi(): Promise<IReleaseApi> {
        return await this._azureApi.getReleaseApi();
    }
}
