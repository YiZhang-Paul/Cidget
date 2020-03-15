import { injectable, inject, named } from 'inversify';

import Types from '../../../../ioc/types';
import IGithubUser from '../../../../interface/source-control/github/github-user.interface';
import IPullRequest from '../../../../interface/source-control/pull-request/pull-request.interface';
import IPullRequestReview from '../../../../interface/source-control/pull-request/pull-request-review.interface';
import IHttpClient from '../../../../interface/generic/http-client.interface';
import IRepositoryProvider from '../../../../interface/source-control/repository-provider.interface';
import GithubUserService from '../github-user/github-user.service';
import AppSettings from '../../../io/app-settings/app-settings';
import PullRequestAction from '../../../../enum/pull-request-action.enum';

@injectable()
export default class GithubPullRequestService {
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
        this._token = settings.get('repository.github').token;
        this._httpClient = httpClient;
        this._repositoryProvider = repositoryProvider;
        this._userService = userService;
    }

    public async toReview(payload: any): Promise<IPullRequestReview<IGithubUser>> {
        const { user, state } = payload.review;

        return ({
            pullRequestId: String(payload.pull_request.id),
            reviewer: await this._userService.getUser(user),
            type: state === 'changes_requested' ? 'change' : state
        }) as IPullRequestReview<IGithubUser>;
    }

    public async toPullRequest(payload: any): Promise<IPullRequest<IGithubUser>> {
        const { action, repository, pull_request } = payload;
        const user = pull_request.merged ? pull_request.merged_by : pull_request.user;

        return ({
            id: String(pull_request.id),
            action: this.getAction(payload),
            initiator: await this._userService.getUser(user, true),
            repository: this._repositoryProvider.toRepository(repository),
            branch: { source: pull_request.head.ref, base: pull_request.base.ref },
            number: pull_request.number,
            message: pull_request.title,
            status: pull_request.state,
            isActive: !pull_request.merged && action !== 'closed',
            diffUrl: pull_request.diff_url,
            pullRequestUrl: pull_request.html_url,
            headCommitSha: pull_request.head.sha,
            reviewers: await this.getReviewers(pull_request),
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

    private getAction(payload: any): string {
        const { action, pull_request } = payload;

        if (pull_request.merged) {
            return PullRequestAction.Merged;
        }

        if (/^review_request/.test(action)) {
            return PullRequestAction.ReviewRequested;
        }
        return action === 'synchronize' ? PullRequestAction.Updated : action;
    }

    private async getReviewers(data: any): Promise<{ requested: IGithubUser[], approved: IGithubUser[] }> {
        const [approved, rejected] = await this.getApproversAndRejecters(data);
        const requested = data.requested_reviewers.map((_: any) => this._userService.getUser(_));

        const reviewers = this._userService.getUniqueUsers([
            ...await Promise.all(requested) as IGithubUser[],
            ...approved,
            ...rejected
        ]);

        return { requested: reviewers, approved };
    }

    private async getApproversAndRejecters(data: any): Promise<IGithubUser[][]> {
        const headers = { Authorization: `token ${this._token}` };
        const reviews = await this._httpClient.get(`${data.url}/reviews`, { headers });
        const rejecters: IGithubUser[] = [];
        const approvers: IGithubUser[] = [];
        const names = new Set<string>();

        for (const { user, state } of reviews.data.sort((a: any, b: any) => b.id - a.id)) {
            const type = state.toLowerCase();

            if ((type === 'approved' || type === 'changes_requested') && !names.has(user.login)) {
                names.add(user.login);
                const reviewer = await this._userService.getUser(user);
                (type === 'approved' ? approvers : rejecters).push(reviewer);
            }
        }

        return [approvers, rejecters];
    }

    private isMergeable(state: string): boolean | null {
        return state === 'unknown' ? null : state === 'clean';
    }
}
