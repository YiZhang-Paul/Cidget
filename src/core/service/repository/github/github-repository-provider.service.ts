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

        return (data || []).map((_: any) => ({
            id: _.id,
            name: _.name,
            description: _.description,
            createdOn: new Date(_.created_at),
            defaultBranch: _.default_branch,
            hooksUrl: _.hooks_url,
            language: _.language,
            license: _.license?.name,
            owner: ({ name: _.owner.login, avatar: _.owner.avatar_url }) as IUser,
            isPrivate: _.private,
            url: _.url
        }) as IRepository);
    }

    public async listWebhooks(project: string): Promise<IWebhook[]> {
        const endpoint = `${url}/repos/${user}/${project}/hooks`;
        const { data } = await axios.default.get(endpoint, { headers: this.headers });

        return (data || []).map(this.toWebhook.bind(this));
    }

    public async getWebhook(project: string, callback: string): Promise<IWebhook | null> {
        const hooks = await this.listWebhooks(project);

        return hooks.find(_ => _.callback === callback) ?? null;
    }

    public async addWebhook(project: string, context: any): Promise<IWebhook> {
        const existingHook = await this.getWebhook(project, context.callback);

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

        const endpoint = `${url}/repos/${user}/${project}/hooks`;
        const { data } = await axios.default.post(endpoint, body, { headers: this.headers });

        return this.toWebhook(data);
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
        }) as IWebhook
    }
}
