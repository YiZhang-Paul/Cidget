import IRepository from '../repository/repository.interface';

import IUser from './user.interface';

export default interface IPullRequest<TUser = IUser, TRepository = IRepository> {
    id: string;
    action: string;
    initiator: TUser;
    repository: TRepository;
    branch: { source: string, base: string };
    number: number;
    message: string;
    status: string;
    diffUrl: string;
    pullRequestUrl: string;
    reviewers: TUser[];
    createdOn: Date;
    updatedOn: Date;
    mergeable: boolean | null;
    merged: boolean;
    commits: number;
    added: number;
    removed: number;
    modified: number;
}
