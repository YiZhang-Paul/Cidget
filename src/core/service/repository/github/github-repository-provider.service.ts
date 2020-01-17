import * as axios from 'axios';
import * as config from 'config';

import IUser from '../../../interface/general/user.interface';
import IWebhook from '../../../interface/general/webhook.interface';
import IRepository from '../../../interface/repository/repository.interface';
import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';

const { url, token, user } = config.get<any>('repository').github;

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

    public async listWebhooks(name: string): Promise<IWebhook[]> {
        const endpoint = `${url}/repos/${user}/${name}/hooks`;
        const { data } = await axios.default.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toWebhook.bind(this));
    }

    public async getWebhook(name: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(name);

        return hooks.find(_ => _.callback === callback) ?? null;
    }

    public async addWebhook(name: string, context: any): Promise<IWebhook> {
        const existingHook = await this.getWebhook(name, context.callback);

        if (existingHook) {
            return existingHook;
        }

        const body = {
            events: context.events,
            config: {
                url: context.callback,
                content_type: 'json',
                insecure_ssl: '0'
            }
        };

        const endpoint = `${url}/repos/${user}/${name}/hooks`;
        const { data } = await axios.default.post(endpoint, body, { headers: this.headers });

        return this.toWebhook(data);
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

    private toWebhook(data: any): IWebhook {
        return ({
            id: data.id,
            name: data.name,
            url: data.url,
            callback: data.config.url,
            contentType: data.config.content_type,
            events: data.events,
            createdOn: new Date(data.created_at),
            isActive: data.active
        }) as IWebhook;
    }
}
