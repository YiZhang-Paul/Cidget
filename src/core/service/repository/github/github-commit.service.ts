import * as axios from 'axios';

import ICommit from '../../../interface/general/commit.interface';
import IGithubUser from '../../../interface/repository/github/github-user.interface';

import IRepositoryProvider from '../../../interface/repository/repository-provider.interface';

export default class GithubCommitService {
    private _repositoryProvider: IRepositoryProvider<any>;

    constructor(repositoryProvider: IRepositoryProvider<any>) {
        this._repositoryProvider = repositoryProvider;
    }

    public async toCommit(payload: any): Promise<ICommit<IGithubUser>> {
        const { ref, sender, repository, compare, head_commit } = payload;
        const repositories = await axios.default.get(`${sender.url}/repos`);
        const followers = await axios.default.get(`${sender.url}/followers`);
        const gists = await axios.default.get(`${sender.url}/gists`);

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
            initiator: initiator,
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
