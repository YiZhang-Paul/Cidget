import * as axios from 'axios';
import * as config from 'config';

import IUser from '../../../interface/general/user.interface';
import IRepository from '../../../interface/repository/repository.interface';
import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';
import IAbbreviationResolver from '../../../interface/general/abbreviation-resolver.interface';

const { url, token } = config.get<any>('repository').github;

export default class GithubRepositoryProvider implements IRepositoryProvider<any> {
    private _languageResolver: IAbbreviationResolver;
    private _licenseResolver: IAbbreviationResolver;

    constructor(languageResolver: IAbbreviationResolver, licenseResolver: IAbbreviationResolver) {
        this._languageResolver = languageResolver;
        this._licenseResolver = licenseResolver;
    }

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${token}` });
    }

    public async listRepositories(): Promise<IRepository[]> {
        const endpoint = `${url}/user/repos?type=all`;
        const { data } = await axios.default.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toRepository.bind(this));
    }

    public async listRepository(name: string): Promise<IRepository | null> {
        const repositories = await this.listRepositories();

        return repositories.find(_ => _.name === name) ?? null;
    }

    public toRepository(data: any): IRepository {
        return ({
            id: data.id,
            name: data.name,
            description: data.description,
            createdOn: new Date(data.created_at * 1000),
            defaultBranch: data.default_branch,
            hooksUrl: data.hooks_url,
            language: {
                name: data.language,
                abbr: this._languageResolver.resolve(data.language)
            },
            license: {
                name: data.license?.name,
                abbr: this._licenseResolver.resolve(data.license?.name)
            },
            owner: ({ name: data.owner.login, avatar: data.owner.avatar_url }) as IUser,
            isPrivate: data.private,
            url: data.url
        }) as IRepository;
    }
}
