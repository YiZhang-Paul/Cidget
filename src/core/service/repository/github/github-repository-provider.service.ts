import * as axios from 'axios';
import * as config from 'config';

import IUser from '../../../interface/general/user.interface';
import IRepository from '../../../interface/repository/repository.interface';
import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';

const { url, token } = config.get<any>('repository').github;

export default class GithubRepositoryProvider implements IRepositoryProvider<any> {

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

    private toRepository(data: any): IRepository {
        return ({
            id: data.id,
            name: data.name,
            description: data.description,
            createdOn: new Date(data.created_at),
            defaultBranch: data.default_branch,
            hooksUrl: data.hooks_url,
            language: data.language,
            license: data.license?.name,
            owner: ({ name: data.owner.login, avatar: data.owner.avatar_url }) as IUser,
            isPrivate: data.private,
            url: data.url
        }) as IRepository;
    }
}
