import IRepository from '../repository/repository.interface';

import IUser from './user.interface';

export default interface ICommit<TUser = IUser, TRepository = IRepository> {
    initiator: TUser;
    repository: TRepository;
    branch: string;
    message: string;
    time: Date;
    diffUrl: string;
    commitUrl: string;
    added?: string[];
    removed?: string[];
    modified?: string[];
}
