import * as axios from 'axios';

import IGithubUser from '../../../interface/repository/github/github-user.interface';
import IPullRequest from '../../../interface/general/pull-request.interface';
import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';

export default class GithubPullRequestService {
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(repositoryProvider: IRepositoryProvider<any>) {
        this._repositoryProvider = repositoryProvider;
    }

    public async toPullRequest(payload: any): Promise<IPullRequest<IGithubUser>> {
        const { action, repository, sender, pull_request } = payload;
        const repositories = await axios.default.get(`${sender.url}/repos`);
        const followers = await axios.default.get(`${sender.url}/followers`);
        const gists = await axios.default.get(`${sender.url}/gists`);

        const initiator = ({
            name: pull_request.user.login,
            avatar: pull_request.user.avatar_url,
            profileUrl: pull_request.user.html_url,
            repositoryCount: (repositories.data || []).length,
            followerCount: (followers.data || []).length,
            gistCount: (gists.data || []).length,
            gistUrl: sender.html_url.replace(/^(https:\/\/)/, '$1gist.')
        }) as IGithubUser;

        return ({
            id: String(pull_request.id),
            action: action,
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
            mergeable: pull_request.mergeable,
            commits: pull_request.commits,
            added: pull_request.additions,
            removed: pull_request.deletions,
            modified: pull_request.changed_files
        }) as IPullRequest<IGithubUser>;
    }
}
