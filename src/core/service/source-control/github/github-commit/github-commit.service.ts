import { injectable, inject, named } from 'inversify';

import Types from '../../../../ioc/types';
import ICommit from '../../../../interface/source-control/code-commit/commit.interface';
import ICommitStatus from '../../../../interface/source-control/code-commit/commit-status.interface';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import GithubUserService from '../github-user/github-user.service';
import AppSettings from '../../../io/app-settings/app-settings';

@injectable()
export default class GithubCommitService {
    private _url: string;
    private _token: string;
    private _httpClient: IHttpClient;
    private _repositoryProvider: IRepositoryProvider<any>;
    private _userService: GithubUserService;

    constructor(
        @inject(Types.AppSettings) settings: AppSettings,
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.IRepositoryProvider) @named('github') repositoryProvider: IRepositoryProvider<any>,
        @inject(Types.GithubUserService) userService: GithubUserService
    ) {
        const { url, token } = settings.get('repository.github');
        this._url = url;
        this._token = token;
        this._httpClient = httpClient;
        this._repositoryProvider = repositoryProvider;
        this._userService = userService;
    }

    public async getStatus(name: string, ref: string, owner: string): Promise<ICommitStatus> {
        const endpoint = `${this._url}/repos/${owner}/${name}/commits/${ref}/status`;
        const headers = { Authorization: `token ${this._token}` };
        const { data } = await this._httpClient.get(endpoint, { headers });
        const { sha, state } = data;

        return ({ ref: sha, status: state }) as ICommitStatus;
    }

    public async toCommit(payload: any): Promise<ICommit<IGithubUser>> {
        const { ref, repository, compare, sender, head_commit } = payload;

        return ({
            id: head_commit.id,
            initiator: await this._userService.getUser(sender, true),
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
