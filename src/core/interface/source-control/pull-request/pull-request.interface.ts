import IUser from '../../generic/user.interface';
import IRepository from '../repository.interface';
import PullRequestAction from '../../../enum/pull-request-action.enum';

export default interface IPullRequest<TUser = IUser, TRepository = IRepository> {
    id: string;
    action: PullRequestAction;
    initiator: TUser;
    repository: TRepository;
    branch: { source: string, base: string };
    number: number;
    message: string;
    status: string;
    isActive: boolean;
    diffUrl: string;
    pullRequestUrl: string;
    headCommitSha: string;
    reviewers: { requested: TUser[], approved: TUser[] };
    createdOn: Date;
    updatedOn: Date;
    mergeable: boolean | null;
    merged: boolean;
    commits: number;
    added: number;
    removed: number;
    modified: number;
}
