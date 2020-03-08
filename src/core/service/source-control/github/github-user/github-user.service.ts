import { injectable, inject } from 'inversify';

import Types from '../../../../ioc/types';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';

@injectable()
export default class GithubUserService {
    private _httpClient: IHttpClient;

    constructor(@inject(Types.IHttpClient) httpClient: IHttpClient) {
        this._httpClient = httpClient;
    }

    public async getUser(data: any, includeDetails = false): Promise<IGithubUser> {
        const { login, avatar_url, html_url, url } = data;

        const user = ({
            name: login,
            avatar: avatar_url,
            profileUrl: html_url,
            gistUrl: html_url.replace(/^(https:\/\/)/, '$1gist.'),
            repositoryCount: 0,
            followerCount: 0,
            gistCount: 0
        }) as IGithubUser;

        if (includeDetails) {
            const repositories = await this._httpClient.get(`${url}/repos`);
            const followers = await this._httpClient.get(`${url}/followers`);
            const gists = await this._httpClient.get(`${url}/gists`);
            user.repositoryCount = (repositories.data || []).length;
            user.followerCount = (followers.data || []).length;
            user.gistCount = (gists.data || []).length;
        }

        return user;
    }
}
