import { injectable, inject, named } from 'inversify';

import config from '../../../../../electron-config';
import Types from '../../../../ioc/types';
import ICommit from '../../../../interface/repository/commit.interface';
import ICommitStatus from '../../../../interface/repository/commit-status.interface';
import IGithubUser from '../../../../interface/repository/github/github-user.interface';
import IHttpClient from '../../../../interface/general/http-client.interface';
import IRepositoryProvider from '../../../../interface/repository/repository-provider.interface';

const { url, user } = config.get('repository').github;

@injectable()
export default class GithubCommitService {
    private _httpClient: IHttpClient;
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.IRepositoryProvider) @named('github') repositoryProvider: IRepositoryProvider<any>
    ) {
        this._httpClient = httpClient;
        this._repositoryProvider = repositoryProvider;
    }

    public async getStatus(name: string, ref: string): Promise<ICommitStatus> {
        const endpoint = `${url}/repos/${user}/${name}/commits/${ref}/status`;
        const { data } = await this._httpClient.get(endpoint);
        const { sha, state } = data;

        return ({ ref: sha, status: state }) as ICommitStatus;
    }

    public async toCommit(payload: any): Promise<ICommit<IGithubUser>> {
        const { ref, sender, repository, compare, head_commit } = payload;
        const repositories = await this._httpClient.get(`${sender.url}/repos`);
        const followers = await this._httpClient.get(`${sender.url}/followers`);
        const gists = await this._httpClient.get(`${sender.url}/gists`);

        const initiator = ({
            name: head_commit.committer.username,
            avatar: sender.avatar_url,
            email: head_commit.committer.email,
            profileUrl: sender.html_url,
            repositoryCount: (repositories.data || []).length,
            followerCount: (followers.data || []).length,
            gistCount: (gists.data || []).length,
            gistUrl: sender.html_url.replace(/^(https:\/\/)/, '$1gist.')
        }) as IGithubUser;

        return ({
            id: head_commit.id,
            initiator,
            repository: this._repositoryProvider.toRepository(repository),
            branch: ref.split('/').slice(-1)[0],
            message: head_commit.message,
            time: new Date(head_commit.timestamp),
            diffUrl: compare,
            commitUrl: head_commit.url,
            added: head_commit.added,
            removed: head_commit.removed,
            modified: head_commit.modified
        }) as ICommit<IGithubUser>;
    }
}
