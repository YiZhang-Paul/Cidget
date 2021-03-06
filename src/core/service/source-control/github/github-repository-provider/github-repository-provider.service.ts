import { injectable, inject } from 'inversify';

import Types from '../../../../ioc/types';
import IUser from '../../../../interface/generic/user.interface';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepository from '../../../../interface/source-control/repository.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import AppSettings from '../../../io/app-settings/app-settings';

@injectable()
export default class GithubRepositoryProvider implements IRepositoryProvider<any> {
    private _url: string;
    private _token: string;
    private _httpClient: IHttpClient;

    constructor(
        @inject(Types.AppSettings) settings: AppSettings,
        @inject(Types.IHttpClient) httpClient: IHttpClient
    ) {
        const { url, token } = settings.get('repository.github');
        this._url = url;
        this._token = token;
        this._httpClient = httpClient;
    }

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${this._token}` });
    }

    public async listRepositories(): Promise<IRepository[]> {
        const endpoint = `${this._url}/user/repos?type=all`;
        const { data } = await this._httpClient.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toRepository.bind(this));
    }

    public async listRepository(name: string): Promise<IRepository | null> {
        const repositories = await this.listRepositories();

        return repositories.find(_ => _.name === name) ?? null;
    }

    public toRepository(data: any): IRepository {
        const { owner, created_at: createdAt } = data;

        return ({
            id: data.id,
            name: data.name,
            description: data.description,
            createdOn: new Date(isNaN(createdAt) ? createdAt : createdAt * 1000),
            defaultBranch: data.default_branch,
            hooksUrl: data.hooks_url,
            language: data.language,
            license: data.license?.name ?? '',
            owner: ({ name: owner.login, avatar: owner.avatar_url }) as IUser,
            isPrivate: data.private,
            url: data.html_url
        }) as IRepository;
    }
}
