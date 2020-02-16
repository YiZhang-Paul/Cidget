import { injectable, inject, named } from 'inversify';

import Types from '../../../../ioc/types';
import IGithubUser from '../../../../interface/repository/github/github-user.interface';
import IPullRequest from '../../../../interface/repository/pull-request.interface';
import IHttpClient from '../../../../interface/general/http-client.interface';
import IRepositoryProvider from '../../../../interface/repository/repository-provider.interface';

@injectable()
export default class GithubPullRequestService {
    private _httpClient: IHttpClient;
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(
        @inject(Types.IHttpClient) httpClient: IHttpClient,
        @inject(Types.IRepositoryProvider) @named('github') repositoryProvider: IRepositoryProvider<any>
    ) {
        this._httpClient = httpClient;
        this._repositoryProvider = repositoryProvider;
    }

    public async toPullRequest(payload: any): Promise<IPullRequest<IGithubUser>> {
        const { action, repository, pull_request, requested_reviewer } = payload;
        const user = pull_request.merged ? pull_request.merged_by : pull_request.user;

        return ({
            id: String(pull_request.id),
            action: this.getAction(payload),
            initiator: await this.getUser(user, true),
            repository: this._repositoryProvider.toRepository(repository),
            branch: {
                source: pull_request.head.ref,
                base: pull_request.base.ref
            },
            number: pull_request.number,
            message: pull_request.title,
            status: pull_request.state,
            isActive: !pull_request.merged && action !== 'closed',
            diffUrl: pull_request.diff_url,
            pullRequestUrl: pull_request.html_url,
            headCommitSha: pull_request.head.sha,
            reviewers: requested_reviewer ? [await this.getUser(requested_reviewer)] : [],
            createdOn: new Date(pull_request.created_at),
            updatedOn: new Date(pull_request.updated_at),
            mergeable: this.isMergeable(pull_request.mergeable_state),
            merged: pull_request.merged,
            commits: pull_request.commits,
            added: pull_request.additions,
            removed: pull_request.deletions,
            modified: pull_request.changed_files
        }) as IPullRequest<IGithubUser>;
    }

    private async getUser(data: any, includeDetails = false): Promise<IGithubUser> {
        const user = ({
            name: data.login,
            avatar: data.avatar_url,
            profileUrl: data.html_url,
            gistUrl: data.html_url.replace(/^(https:\/\/)/, '$1gist.')
        }) as IGithubUser;

        if (includeDetails) {
            const repositories = await this._httpClient.get(`${data.url}/repos`);
            const followers = await this._httpClient.get(`${data.url}/followers`);
            const gists = await this._httpClient.get(`${data.url}/gists`);
            user.repositoryCount = (repositories.data || []).length;
            user.followerCount = (followers.data || []).length;
            user.gistCount = (gists.data || []).length;
        }

        return user;
    }

    private getAction(payload: any): string {
        const { action, pull_request } = payload;

        if (pull_request.merged) {
            return 'merged';
        }

        if (action === 'review_requested') {
            return 'needs review';
        }
        return action === 'synchronize' ? 'updated' : action;
    }

    private isMergeable(state: string): boolean | null {
        return state === 'unknown' ? null : state === 'clean';
    }
}
