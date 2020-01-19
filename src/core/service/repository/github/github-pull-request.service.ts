import * as axios from 'axios';

import IGithubUser from '../../../interface/repository/github/github-user.interface';
import IPullRequest from '../../../interface/general/pull-request.interface';
import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';

export default class GithubPullRequestService {
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(repositoryProvider: IRepositoryProvider<any>) {
        this._repositoryProvider = repositoryProvider;
    }

    private isMergeable(state: string): boolean | null {
        return state === 'unknown' ? null : state === 'clean';
    }

    public async toPullRequest(payload: any): Promise<IPullRequest<IGithubUser>> {
        const { action, repository, pull_request } = payload;
        const user = pull_request.merged ? pull_request.merged_by : pull_request.user;
        const repositories = await axios.default.get(`${user.url}/repos`);
        const followers = await axios.default.get(`${user.url}/followers`);
        const gists = await axios.default.get(`${user.url}/gists`);

        const initiator = ({
            name: user.login,
            avatar: user.avatar_url,
            profileUrl: user.html_url,
            repositoryCount: (repositories.data || []).length,
            followerCount: (followers.data || []).length,
            gistCount: (gists.data || []).length,
            gistUrl: user.html_url.replace(/^(https:\/\/)/, '$1gist.')
        }) as IGithubUser;

        return ({
            id: String(pull_request.id),
            action: pull_request.merged ? 'merged' : action,
            initiator,
            repository: this._repositoryProvider.toRepository(repository),
            branch: {
                source: pull_request.head.ref,
                base: pull_request.base.ref
            },
            number: pull_request.number,
            message: pull_request.title,
            status: pull_request.state,
            diffUrl: pull_request.diff_url,
            pullRequestUrl: pull_request.html_url,
            reviewers: [],
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
}
