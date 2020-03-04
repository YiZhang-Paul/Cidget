import { injectable, inject, named } from 'inversify';

import Types from '../../../../ioc/types';
import IUser from '../../../../interface/general/user.interface';
import IHttpClient from '../../../../interface/general/http-client.interface';
import IRepository from '../../../../interface/source-control/repository.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import IAbbreviationResolver from '../../../../interface/general/abbreviation-resolver.interface';
import AppSettings from '../../../io/app-settings/app-settings';

@injectable()
export default class GithubRepositoryProvider implements IRepositoryProvider<any> {
    private _url: string;
    private _token: string;
    private _httpClient: IHttpClient;
    private _languageResolver: IAbbreviationResolver;
    private _licenseResolver: IAbbreviationResolver;

    constructor(
        @inject(Types.AppSettings) settings: AppSettings,
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.IAbbreviationResolver) @named('language') languageResolver: IAbbreviationResolver,
        @inject(Types.IAbbreviationResolver) @named('license') licenseResolver: IAbbreviationResolver
    ) {
        const { url, token } = settings.get('repository.github');
        this._url = url;
        this._token = token;
        this._httpClient = httpClient;
        this._languageResolver = languageResolver;
        this._licenseResolver = licenseResolver;
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
        const createdAt = data.created_at;

        return ({
            id: data.id,
            name: data.name,
            description: data.description,
            createdOn: new Date(isNaN(createdAt) ? createdAt : createdAt * 1000),
            defaultBranch: data.default_branch,
            hooksUrl: data.hooks_url,
            language: {
                name: data.language,
                abbr: this._languageResolver.resolve(data.language)
            },
            license: {
                name: data.license?.name ?? '',
                abbr: this._licenseResolver.resolve(data.license?.name)
            },
            owner: ({ name: data.owner.login, avatar: data.owner.avatar_url }) as IUser,
            isPrivate: data.private,
            url: data.html_url
        }) as IRepository;
    }
}
