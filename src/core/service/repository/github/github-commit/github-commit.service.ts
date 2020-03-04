import { injectable, inject, named } from 'inversify';

import Types from '../../../../ioc/types';
import ICommit from '../../../../interface/source-control/code-commit/commit.interface';
import ICommitStatus from '../../../../interface/source-control/code-commit/commit-status.interface';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import AppSettings from '../../../io/app-settings/app-settings';

@injectable()
export default class GithubCommitService {
    private _url: string;
    private _token: string;
    private _httpClient: IHttpClient;
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(
        @inject(Types.AppSettings) settings: AppSettings,
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.IRepositoryProvider) @named('github') repositoryProvider: IRepositoryProvider<any>
    ) {
        const { url, token } = settings.get('repository.github');
        this._url = url;
        this._token = token;
        this._httpClient = httpClient;
        this._repositoryProvider = repositoryProvider;
    }

    private get headers(): { [key: string]: string } {
        return ({ Authorization: `token ${this._token}` });
    }

    public async getStatus(name: string, ref: string, owner: string): Promise<ICommitStatus> {
        const endpoint = `${this._url}/repos/${owner}/${name}/commits/${ref}/status`;
        const { data } = await this._httpClient.get(endpoint, { headers: this.headers });
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
